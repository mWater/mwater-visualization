_ = require 'lodash'
React = require 'react'
H = React.DOM
async = require 'async'
uuid = require 'uuid'

Chart = require '../Chart'
ExprCleaner = require('mwater-expressions').ExprCleaner
AxisBuilder = require '../../../axes/AxisBuilder'
TextWidget = require '../../text/TextWidget'

PivotChartUtils = require './PivotChartUtils'
PivotChartDesignerComponent = require './PivotChartDesignerComponent'
PivotChartViewComponent = require './PivotChartViewComponent'
PivotChartQueryBuilder = require './PivotChartQueryBuilder'
PivotChartLayoutBuilder = require './PivotChartLayoutBuilder'

# See PivotChart Design.md for the design
module.exports = class PivotChart extends Chart
  cleanDesign: (design, schema) ->
    exprCleaner = new ExprCleaner(schema)
    axisBuilder = new AxisBuilder(schema: schema)

    # Clone deep for now # TODO
    design = _.cloneDeep(design)

    # Fill in defaults
    design.version = design.version or 1
    design.rows = design.rows or []
    design.columns = design.columns or []
    design.intersections = design.intersections or {}
    design.header = design.header or { style: "footer", items: [] }
    design.footer = design.footer or { style: "footer", items: [] }

    if design.table
      # Add default row and column
      if design.rows.length == 0
        design.rows.push({ id: uuid() })
      if design.columns.length == 0
        design.columns.push({ id: uuid() })

      # Cleans a single segment
      cleanSegment = (segment) =>
        if segment.valueAxis
          segment.valueAxis = axisBuilder.cleanAxis(axis: segment.valueAxis, table: design.table, aggrNeed: "none", types: ["enum", "text", "boolean", "date"])

        # Remove valueLabelBold if no valueAxis
        if not segment.valueAxis
          delete segment.valueLabelBold

      # Clean all segments
      for segment in PivotChartUtils.getAllSegments(design.rows)
        cleanSegment(segment)
        
      for segment in PivotChartUtils.getAllSegments(design.columns)
        cleanSegment(segment)

      # Clean all intersections
      for intersectionId, intersection of design.intersections
        if intersection.valueAxis
          intersection.valueAxis = axisBuilder.cleanAxis(axis: intersection.valueAxis, table: design.table, aggrNeed: "required", types: ["enum", "text", "boolean", "date", "number"])

        if intersection.backgroundColorAxis
          intersection.backgroundColorAxis = axisBuilder.cleanAxis(axis: intersection.backgroundColorAxis, table: design.table, aggrNeed: "required", types: ["enum", "text", "boolean", "date"])
          
          if not intersection.backgroundColorOpacity?
            intersection.backgroundColorOpacity = 0.3

      # Add missing intersections
      intersections = {}
      for rowPath in PivotChartUtils.getSegmentPaths(design.rows)
        for columnPath in PivotChartUtils.getSegmentPaths(design.columns)
          intersectionId = "#{_.pluck(rowPath, "id").join(",")}:#{_.pluck(columnPath, "id").join(",")}"

          # Default to blank
          intersections[intersectionId] = design.intersections[intersectionId] or { }

      design.intersections = intersections

      # Clean filter
      design.filter = exprCleaner.cleanExpr(design.filter, { table: design.table, types: ['boolean'] })

    return design

  validateDesign: (design, schema) ->
    axisBuilder = new AxisBuilder(schema: schema)

    # Check that has table
    if not design.table
      return "Missing data source"

    # Check that has rows
    if design.rows.length == 0
      return "Missing rows"

    # Check that has columns
    if design.columns.length == 0
      return "Missing columns"

    error = null

    # Validate axes
    for segment in PivotChartUtils.getAllSegments(design.rows)
      if segment.valueAxis
        error = error or axisBuilder.validateAxis(axis: segment.valueAxis)

    for segment in PivotChartUtils.getAllSegments(design.columns)
      if segment.valueAxis
        error = error or axisBuilder.validateAxis(axis: segment.valueAxis)

    for intersectionId, intersection of design.intersections
      if intersection.valueAxis
        error = error or axisBuilder.validateAxis(axis: intersection.valueAxis)

    return error

  # Determine if widget is auto-height, which means that a vertical height is not required.
  isAutoHeight: -> false

  isEmpty: (design) ->
    return not design.table or design.rows.length == 0 or design.columns.length == 0

  # True if designer should have a preview pane to the left
  hasDesignerPreview: -> false

  # Creates a design element with specified options
  # options include:
  #   schema: schema to use
  #   dataSource: dataSource to use
  #   design: design 
  #   onDesignChange: function
  createDesignerElement: (options) ->
    # Require here to prevent server require problems
    PivotChartDesignerComponent = require './PivotChartDesignerComponent'

    props = {
      schema: options.schema
      dataSource: options.dataSource
      design: @cleanDesign(options.design, options.schema)
      onDesignChange: (design) =>
        # Clean design
        design = @cleanDesign(design, options.schema)
        options.onDesignChange(design)
    }
    return React.createElement(PivotChartDesignerComponent, props)

  # Get data for the chart asynchronously 
  # design: design of the chart
  # schema: schema to use
  # dataSource: data source to get data from
  # filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  # callback: (error, data)
  getData: (design, schema, dataSource, filters, callback) ->
    queryBuilder = new PivotChartQueryBuilder(schema: schema)
    queries = queryBuilder.createQueries(design, filters)

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
    PivotChartViewComponent = require './PivotChartViewComponent'
    
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

    return React.createElement(PivotChartViewComponent, props)

  createDropdownItems: (design, schema, widgetDataSource, filters) ->
    return []

  createDataTable: (design, schema, dataSource, data, locale) ->
    # Create layout
    layout = new PivotChartLayoutBuilder(schema: schema).buildLayout(design, data, locale)

    return _.map(layout.rows, (row) -> _.map(row.cells, (cell) -> cell.text))

  # Get a list of table ids that can be filtered on
  getFilterableTables: (design, schema) ->
    filterableTables = if design.table then [design.table] else []

    # Get filterable tables from header and footer
    textWidget = new TextWidget()
    filterableTables = _.union(filterableTables, textWidget.getFilterableTables(design.header, schema))
    filterableTables = _.union(filterableTables, textWidget.getFilterableTables(design.footer, schema))

    return filterableTables
