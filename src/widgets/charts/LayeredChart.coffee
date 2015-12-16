_ = require 'lodash'
React = require 'react'
H = React.DOM

Chart = require './Chart'
LayeredChartCompiler = require './LayeredChartCompiler'
ExprCleaner = require('mwater-expressions').ExprCleaner
AxisBuilder = require './../../axes/AxisBuilder'
LayeredChartDesignerComponent = require './LayeredChartDesignerComponent'
LayeredChartViewComponent = require './LayeredChartViewComponent'
LayeredChartSvgFileSaver = require './LayeredChartSvgFileSaver'
LayeredChartUtils = require './LayeredChartUtils'

# See LayeredChart Design.md for the design
module.exports = class LayeredChart extends Chart
  # Pass in schema and dataSource
  constructor: (options) ->
    @schema = options.schema
    @dataSource = options.dataSource

    @exprCleaner = new ExprCleaner(@schema)
    @axisBuilder = new AxisBuilder(schema: @schema)

  cleanDesign: (design) ->
    compiler = new LayeredChartCompiler(schema: @schema)

    # Clone deep for now # TODO
    design = _.cloneDeep(design)

    # Fill in defaults
    design.version = design.version or 1
    design.layers = design.layers or [{}]

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
        layer.axes[axisKey] = @axisBuilder.cleanAxis(axis: axis, table: layer.table, aggrNeed: aggrNeed, types: LayeredChartUtils.getAxisTypes(design, layer, axisKey))

      # Remove x axis if not required
      if not compiler.canLayerUseXExpr(design, layerId) and layer.axes.x
        delete layer.axes.x

      # Remove cumulative if x is not date or number
      if not layer.axes.x or @axisBuilder.getAxisType(layer.axes.x) not in ['date', 'number']
        delete layer.cumulative

      # Default y to count if x or color present
      if not layer.axes.y and (layer.axes.x or layer.axes.color)
        # Create count expr
        layer.axes.y = { expr: { type: "id", table: layer.table }, aggr: "count", xform: null }

      layer.filter = @exprCleaner.cleanExpr(layer.filter, { table: layer.table, types: ['boolean'] })

    return design

  validateDesign: (design) ->
    compiler = new LayeredChartCompiler(schema: @schema)

    # Check that layers have same x axis type
    xAxisTypes = _.uniq(_.map(design.layers, (l) => 
      @axisBuilder = new AxisBuilder(schema: @schema)
      return @axisBuilder.getAxisType(l.axes.x)))

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
      error = error or @axisBuilder.validateAxis(axis: layer.axes.x)
      error = error or @axisBuilder.validateAxis(axis: layer.axes.y)
      error = error or @axisBuilder.validateAxis(axis: layer.axes.color)

    return error

  isEmpty: (design) ->
    return not design.layers or not design.layers[0] or not design.layers[0].table

  # Creates a design element with specified options
  # options include design: design and onChange: function
  createDesignerElement: (options) ->
    props = {
      schema: @schema
      dataSource: @dataSource
      design: @cleanDesign(options.design)
      onDesignChange: (design) =>
        # Clean design
        design = @cleanDesign(design)
        options.onDesignChange(design)
    }
    return React.createElement(LayeredChartDesignerComponent, props)

  # filters is array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  createQueries: (design, filters) ->
    compiler = new LayeredChartCompiler(schema: @schema)
    return compiler.createQueries(design, filters)

  # Options include 
  # design: design of the chart
  # data: results from queries
  # width, height, standardWidth: size of the chart view
  # scope: current scope of the view element
  # onScopeChange: called when scope changes with new scope
  createViewElement: (options) ->
    # Create chart
    props = {
      schema: @schema
      design: @cleanDesign(options.design)
      data: options.data

      width: options.width
      height: options.height
      standardWidth: options.standardWidth

      scope: options.scope
      onScopeChange: options.onScopeChange
    }

    return React.createElement(LayeredChartViewComponent, props)

  createDropdownItems: (design, dataSource, filters) ->
    # TODO validate design before allowing save
    save = =>
      design = @cleanDesign(design)
      queries = @createQueries(design, filters)
      dataSource.performQueries(queries, (err, data) =>
        if err
          alert("Unable to load data")
        else
          LayeredChartSvgFileSaver.save(design, data, @schema))

    # Don't save image of invalid design
    if @validateDesign(@cleanDesign(design))
      return []

    return [{ label: "Save Image", icon: "camera", onClick: save }]

  createDataTable: (design, data, locale) ->
    # Export only first layer
    headers = []
    if design.layers[0].axes.x
      headers.push(@axisBuilder.summarizeAxis(design.layers[0].axes.x, locale))
    if design.layers[0].axes.color
      headers.push(@axisBuilder.summarizeAxis(design.layers[0].axes.color, locale))
    if design.layers[0].axes.y
      headers.push(@axisBuilder.summarizeAxis(design.layers[0].axes.y, locale))
    table = [headers]

    for row in data.layer0
      r = []
      if design.layers[0].axes.x
        r.push(@axisBuilder.formatValue(design.layers[0].axes.x, row.x, locale))
      if design.layers[0].axes.color
        r.push(@axisBuilder.formatValue(design.layers[0].axes.color, row.color, locale))
      if design.layers[0].axes.y
        r.push(@axisBuilder.formatValue(design.layers[0].axes.y, row.y, locale))
      table.push(r)

    return table
  #   if data.length > 0
  #   fields = Object.getOwnPropertyNames(data[0])
  #   table = [fields] # header
  #   renderRow = (record) ->
  #      _.map(fields, (field) -> record[field])
  #   table.concat(_.map(data, renderRow))
  # else []

