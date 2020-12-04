_ = require 'lodash'
React = require 'react'
R = React.createElement
async = require 'async'
uuid = require 'uuid'
produce = require('immer').default
original = require('immer').original
WeakCache = require('mwater-expressions').WeakCache

Chart = require '../Chart'
ExprCleaner = require('mwater-expressions').ExprCleaner
AxisBuilder = require '../../../axes/AxisBuilder'
TextWidget = require '../../text/TextWidget'

PivotChartUtils = require './PivotChartUtils'
PivotChartQueryBuilder = require './PivotChartQueryBuilder'
PivotChartLayoutBuilder = require './PivotChartLayoutBuilder'

# Store true as a weakly cached value if a design is already clean
cleanDesignCache = new WeakCache()

# See README.md for the design
module.exports = class PivotChart extends Chart
  cleanDesign: (design, schema) ->
    exprCleaner = new ExprCleaner(schema)
    axisBuilder = new AxisBuilder(schema: schema)

    # Use weak caching to improve performance of cleaning complex pivot charts
    if cleanDesignCache.get([design, schema], []) == true
      return design

    cleanedDesign = produce(design, (draft) => 
      # Fill in defaults
      draft.version = design.version or 1
      draft.rows = design.rows or []
      draft.columns = design.columns or []
      draft.intersections = design.intersections or {}
      draft.header = design.header or { style: "footer", items: [] }
      draft.footer = design.footer or { style: "footer", items: [] }

      if design.table
        # Add default row and column
        if draft.rows.length == 0
          draft.rows.push({ id: uuid() })
        if draft.columns.length == 0
          draft.columns.push({ id: uuid() })

        # Cleans a single segment
        cleanSegment = (segment) =>
          if segment.valueAxis
            segment.valueAxis = axisBuilder.cleanAxis(axis: (if segment.valueAxis then original(segment.valueAxis) else null), table: design.table, aggrNeed: "none", types: ["enum", "text", "boolean", "date"])

          # Remove valueLabelBold if no valueAxis
          if not segment.valueAxis
            delete segment.valueLabelBold

          if segment.filter
            segment.filter = exprCleaner.cleanExpr((if segment.filter then original(segment.filter) else null), { table: design.table, types: ["boolean"] })

          if segment.orderExpr
            segment.orderExpr = exprCleaner.cleanExpr((if segment.orderExpr then original(segment.orderExpr) else null), { table: design.table, aggrStatuses: ["aggregate"], types: ["enum", "text", "boolean", "date", "datetime", "number"] })

        # Clean all segments
        for segment in PivotChartUtils.getAllSegments(draft.rows)
          cleanSegment(segment)
          
        for segment in PivotChartUtils.getAllSegments(draft.columns)
          cleanSegment(segment)

        # Clean all intersections
        for intersectionId, intersection of draft.intersections
          if intersection.valueAxis
            intersection.valueAxis = axisBuilder.cleanAxis(axis: (if intersection.valueAxis then original(intersection.valueAxis) else null), table: design.table, aggrNeed: "required", types: ["enum", "text", "boolean", "date", "number"])

          if intersection.backgroundColorAxis
            intersection.backgroundColorAxis = axisBuilder.cleanAxis(axis: (if intersection.backgroundColorAxis then original(intersection.backgroundColorAxis) else null), table: design.table, aggrNeed: "required", types: ["enum", "text", "boolean", "date"])
            
            if not intersection.backgroundColorOpacity?
              intersection.backgroundColorOpacity = 1

          if intersection.filter
            intersection.filter = exprCleaner.cleanExpr((if intersection.filter then original(intersection.filter) else null), { table: design.table, types: ["boolean"] })

        # Get all intersection ids
        allIntersectionIds = []
        for rowPath in PivotChartUtils.getSegmentPaths(design.rows or [])
          for columnPath in PivotChartUtils.getSegmentPaths(design.columns or [])
            allIntersectionIds.push(PivotChartUtils.getIntersectionId(rowPath, columnPath))
        
        # Add missing intersections
        for intersectionId in _.difference(allIntersectionIds, _.keys(design.intersections or {}))
          draft.intersections[intersectionId] = {}

        # Remove extra intersections
        for intersectionId in _.difference(_.keys(design.intersections or {}), allIntersectionIds)
          delete draft.intersections[intersectionId]

        # Clean filter
        draft.filter = exprCleaner.cleanExpr(design.filter, { table: design.table, types: ['boolean'] })

        return
    )

    # Cache if unchanged (and therefore clean)
    if design == cleanedDesign
      cleanDesignCache.set([design, schema], [], true)

    return cleanedDesign

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

  # Label for the edit gear dropdown
  getEditLabel: -> "Configure Table" 

  # Creates a design element with specified options
  # options include:
  #   schema: schema to use
  #   dataSource: dataSource to use
  #   design: design 
  #   onDesignChange: function
  #   filters: array of filters
  createDesignerElement: (options) ->
    # Require here to prevent server require problems
    PivotChartDesignerComponent = require './PivotChartDesignerComponent'

    props = {
      schema: options.schema
      dataSource: options.dataSource
      design: @cleanDesign(options.design, options.schema)
      filters: options.filter
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
  #   width, height: size of the chart view
  #   scope: current scope of the view element
  #   onScopeChange: called when scope changes with new scope
  #   filters: array of filters
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

      scope: options.scope
      onScopeChange: options.onScopeChange
      filters: options.filters
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

  # Get the chart placeholder icon. fa-XYZ or glyphicon-XYZ
  getPlaceholderIcon: -> "fa-magic"