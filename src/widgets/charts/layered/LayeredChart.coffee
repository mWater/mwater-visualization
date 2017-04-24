_ = require 'lodash'
React = require 'react'
H = React.DOM
async = require 'async'

Chart = require '../Chart'
LayeredChartCompiler = require './LayeredChartCompiler'
ExprCleaner = require('mwater-expressions').ExprCleaner
AxisBuilder = require '../../../axes/AxisBuilder'
LayeredChartSvgFileSaver = require './LayeredChartSvgFileSaver'
LayeredChartUtils = require './LayeredChartUtils'
TextWidget = require '../../text/TextWidget'

# See LayeredChart Design.md for the design
module.exports = class LayeredChart extends Chart
  cleanDesign: (design, schema) ->
    exprCleaner = new ExprCleaner(schema)
    axisBuilder = new AxisBuilder(schema: schema)
    compiler = new LayeredChartCompiler(schema: schema)

    # Clone deep for now # TODO
    design = _.cloneDeep(design)

    # Fill in defaults
    design.version = design.version or 2
    design.layers = design.layers or [{}]

    # Default to titleText (legacy)
    design.header = design.header or { style: "header", items: _.compact([design.titleText or null]) }
    design.footer = design.footer or { style: "footer", items: [] }

    # Default value is now ""
    if design.version < 2
      if not design.xAxisLabelText?
        design.xAxisLabelText = ""
      if not design.yAxisLabelText?
        design.yAxisLabelText = ""
      design.version = 2

    # Clean each layer
    for layerId in [0...design.layers.length]
      layer = design.layers[layerId]

      layer.axes = layer.axes or {}

      for axisKey, axis of layer.axes
        # Determine what aggregation axis requires
        if axisKey == "y" and compiler.doesLayerNeedGrouping(design, layerId)
          aggrNeed = "required"
        else
          aggrNeed = "none"
        layer.axes[axisKey] = axisBuilder.cleanAxis(axis: axis, table: layer.table, aggrNeed: aggrNeed, types: LayeredChartUtils.getAxisTypes(design, layer, axisKey))

      # Remove x axis if not required
      if not compiler.canLayerUseXExpr(design, layerId) and layer.axes.x
        delete layer.axes.x

      # Remove cumulative if x is not date or number
      if not layer.axes.x or axisBuilder.getAxisType(layer.axes.x) not in ['date', 'number']
        delete layer.cumulative

      layer.filter = exprCleaner.cleanExpr(layer.filter, { table: layer.table, types: ['boolean'] })

    return design

  validateDesign: (design, schema) ->
    axisBuilder = new AxisBuilder(schema: schema)
    compiler = new LayeredChartCompiler(schema: schema)

    # Check that layers have same x axis type
    xAxisTypes = _.uniq(_.map(design.layers, (l) => 
      axisBuilder = new AxisBuilder(schema: schema)
      return axisBuilder.getAxisType(l.axes.x)))

    if xAxisTypes.length > 1
      return "All x axes must be of same type"

    for layerId in [0...design.layers.length]
      layer = design.layers[layerId]

      # Check that has table
      if not layer.table
        return "Missing data source"

      # Check that has y axis
      if not layer.axes.y
        return "Missing Y Axis"

      if not layer.axes.x and compiler.isXAxisRequired(design, layerId)
        return "Missing X Axis"
      if not layer.axes.color and compiler.isColorAxisRequired(design, layerId)
        return "Missing Color Axis"

      error = null

      # Validate axes
      error = error or axisBuilder.validateAxis(axis: layer.axes.x)
      error = error or axisBuilder.validateAxis(axis: layer.axes.y)
      error = error or axisBuilder.validateAxis(axis: layer.axes.color)

    return error

  isEmpty: (design) ->
    return not design.layers or not design.layers[0] or not design.layers[0].table

  # Creates a design element with specified options
  # options include:
  #   schema: schema to use
  #   dataSource: dataSource to use
  #   design: design 
  #   onDesignChange: function
  createDesignerElement: (options) ->
    # Require here to prevent server require problems
    LayeredChartDesignerComponent = require './LayeredChartDesignerComponent'

    props = {
      schema: options.schema
      dataSource: options.dataSource
      design: @cleanDesign(options.design, options.schema)
      onDesignChange: (design) =>
        # Clean design
        design = @cleanDesign(design, options.schema)
        options.onDesignChange(design)
    }
    return React.createElement(LayeredChartDesignerComponent, props)

  # Get data for the chart asynchronously 
  # design: design of the chart
  # schema: schema to use
  # dataSource: data source to get data from
  # filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  # callback: (error, data)
  getData: (design, schema, dataSource, filters, callback) ->
    compiler = new LayeredChartCompiler(schema: schema)
    queries = compiler.createQueries(design, filters)

    # Run queries in parallel
    async.map _.pairs(queries), (item, cb) =>
      dataSource.performQuery(item[1], (err, rows) =>
        cb(err, [item[0], rows])
        )
    , (err, items) =>
      if err
        return callback(err)

      data = _.object(items)

      # Add header and footer data
      textWidget = new TextWidget()
      textWidget.getData design.header, schema, dataSource, filters, (error, headerData) =>
        if error
          return callback(error)

        data.header = headerData

        textWidget.getData design.footer, schema, dataSource, filters, (error, footerData) =>
          if error
            return callback(error)

          data.footer = footerData
    
          callback(null, data)

  # Create a view element for the chart
  # Options include:
  #   schema: schema to use
  #   dataSource: dataSource to use
  #   design: design of the chart
  #   onDesignChange: when design changes
  #   data: results from queries
  #   width, height, standardWidth: size of the chart view
  #   scope: current scope of the view element
  #   onScopeChange: called when scope changes with new scope
  createViewElement: (options) ->
    LayeredChartViewComponent = require './LayeredChartViewComponent'
    
    # Create chart
    props = {
      schema: options.schema
      dataSource: options.dataSource
      design: @cleanDesign(options.design, options.schema)
      onDesignChange: options.onDesignChange
      data: options.data

      width: options.width
      height: options.height
      standardWidth: options.standardWidth

      scope: options.scope
      onScopeChange: options.onScopeChange
    }

    return React.createElement(LayeredChartViewComponent, props)

  createDropdownItems: (design, schema, widgetDataSource, filters) ->
    # TODO validate design before allowing save
    save = (format) =>
      design = @cleanDesign(design, schema)
      widgetDataSource.getData design, filters, (err, data) =>
        if err
          alert("Unable to load data")
        else
          LayeredChartSvgFileSaver.save(design, data, schema, format)

    # Don't save image of invalid design
    if @validateDesign(@cleanDesign(design, schema), schema)
      return []

    return [
      { label: "Save as SVG", icon: "picture", onClick: save.bind(null, "svg") }
      { label: "Save as PNG", icon: "camera", onClick: save.bind(null, "png") }
    ]

  createDataTable: (design, schema, dataSource, data, locale) ->
    axisBuilder = new AxisBuilder(schema: schema)

    # Export only first layer
    headers = []
    if design.layers[0].axes.x
      headers.push(axisBuilder.summarizeAxis(design.layers[0].axes.x, locale))
    if design.layers[0].axes.color
      headers.push(axisBuilder.summarizeAxis(design.layers[0].axes.color, locale))
    if design.layers[0].axes.y
      headers.push(axisBuilder.summarizeAxis(design.layers[0].axes.y, locale))
    table = [headers]

    for row in data.layer0
      r = []
      if design.layers[0].axes.x
        r.push(axisBuilder.formatValue(design.layers[0].axes.x, row.x, locale))
      if design.layers[0].axes.color
        r.push(axisBuilder.formatValue(design.layers[0].axes.color, row.color, locale))
      if design.layers[0].axes.y
        r.push(axisBuilder.formatValue(design.layers[0].axes.y, row.y, locale))
      table.push(r)

    return table
  #   if data.length > 0
  #   fields = Object.getOwnPropertyNames(data[0])
  #   table = [fields] # header
  #   renderRow = (record) ->
  #      _.map(fields, (field) -> record[field])
  #   table.concat(_.map(data, renderRow))
  # else []


  # Get a list of table ids that can be filtered on
  getFilterableTables: (design, schema) ->
    filterableTables = _.uniq(_.compact(_.map(design.layers, (layer) -> layer.table)))

    # Get filterable tables from header and footer
    textWidget = new TextWidget()
    filterableTables = _.union(filterableTables, textWidget.getFilterableTables(design.header, schema))
    filterableTables = _.union(filterableTables, textWidget.getFilterableTables(design.footer, schema))

    return filterableTables

  # Get the chart placeholder icon. fa-XYZ or glyphicon-XYZ
  getPlaceholderIcon: -> "fa-bar-chart"