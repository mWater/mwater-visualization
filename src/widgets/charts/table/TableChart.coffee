_ = require 'lodash'
React = require 'react'
R = React.createElement
uuid = require 'uuid'
produce = require('immer').default
original = require('immer').original
isDraft = require('immer').isDraft

injectTableAlias = require('mwater-expressions').injectTableAlias
Chart = require '../Chart'
ExprUtils = require('mwater-expressions').ExprUtils
ExprCompiler = require('mwater-expressions').ExprCompiler
AxisBuilder = require '../../../axes/AxisBuilder'
TableChartViewComponent = require './TableChartViewComponent'

###
Design is:

  table: table to use for data source
  titleText: title text
  columns: array of columns
  filter: optional logical expression to filter by
  orderings: array of orderings
  limit: optional limit to number of rows

column:
  id: unique id of column (uuid v4)
  headerText: header text
  textAxis: axis that creates the text value of the column. NOTE: now no longer using as an axis, but only using expression within!
  format: optional d3-format format for numeric values. Default if null is ","

ordering:
  axis: axis that creates the order expression. NOTE: now no longer using as an axis, but only using expression within!
  direction: "asc"/"desc"

###
module.exports = class TableChart extends Chart
  cleanDesign: (design, schema) ->
    ExprCleaner = require('mwater-expressions').ExprCleaner

    exprCleaner = new ExprCleaner(schema)
    axisBuilder = new AxisBuilder(schema: schema)

    design = produce(design, (draft) =>
      draft.version = design.version or 1

      # Always have at least one column
      draft.columns = design.columns or []
      if draft.columns.length == 0
        draft.columns.push({id: uuid()})

      draft.orderings = design.orderings or []

      # Clean each column
      for columnId in [0...draft.columns.length]
        column = draft.columns[columnId]

        if not column.id
          column.id = uuid()
        # Clean textAxis
        column.textAxis = axisBuilder.cleanAxis(axis: (if column.textAxis then original(column.textAxis) else null), table: design.table, aggrNeed: "optional")

      # Clean orderings
      for ordering in draft.orderings
        ordering.axis = axisBuilder.cleanAxis(axis: (if ordering.axis then original(ordering.axis) else null), table: design.table, aggrNeed: "optional")

      if design.filter
        draft.filter = exprCleaner.cleanExpr(design.filter, { table: design.table, types: ['boolean'] })

      # Limit 
      if design.limit and design.limit > 1000
        delete draft.limit

      return
    )

    return design

  validateDesign: (design, schema) ->
    axisBuilder = new AxisBuilder(schema: schema)

    # Check that has table
    if not design.table
      return "Missing data source"

    error = null

    for column in design.columns
      # Check that has textAxis
      if not column.textAxis
        error = error or "Missing text"

      error = error or axisBuilder.validateAxis(axis: column.textAxis)

    for ordering in design.orderings
      if not ordering.axis
        error = error or "Missing order expression"
      error = error or axisBuilder.validateAxis(axis: ordering.axis)

    return error

  isEmpty: (design) ->
    return not design.columns or not design.columns[0] or not design.columns[0].textAxis

  # Creates a design element with specified options
  # options include:
  #   schema: schema to use
  #   dataSource: dataSource to use
  #   design: design
  #   onDesignChange: function
  createDesignerElement: (options) ->
    # Require here to prevent server require problems
    TableChartDesignerComponent = require './TableChartDesignerComponent'

    props = {
      schema: options.schema
      design: @cleanDesign(options.design, options.schema)
      dataSource: options.dataSource
      onDesignChange: (design) =>
        # Clean design
        design = @cleanDesign(design, options.schema)
        options.onDesignChange(design)
    }
    return React.createElement(TableChartDesignerComponent, props)

  # Get data for the chart asynchronously
  # design: design of the chart
  # schema: schema to use
  # dataSource: data source to get data from
  # filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  # callback: (error, data)
  getData: (design, schema, dataSource, filters, callback) ->
    exprUtils = new ExprUtils(schema)
    exprCompiler = new ExprCompiler(schema)
    axisBuilder = new AxisBuilder(schema: schema)

    # Create shell of query
    query = {
      type: "query"
      selects: []
      from: exprCompiler.compileTable(design.table, "main")
      groupBy: []
      orderBy: []
      limit: Math.min(design.limit or 1000, 1000)
    }

    # Determine if any aggregate
    isAggr = _.any(design.columns, (column) => axisBuilder.isAxisAggr(column.textAxis)) or _.any(design.orderings, (ordering) => axisBuilder.isAxisAggr(ordering.axis))

    # For each column
    for colNum in [0...design.columns.length]
      column = design.columns[colNum]

      exprType = exprUtils.getExprType(column.textAxis?.expr)

      compiledExpr = exprCompiler.compileExpr(expr: column.textAxis?.expr, tableAlias: "main")

      # Handle special case of geometry, converting to GeoJSON
      if exprType == "geometry"
        # Convert to 4326 (lat/long). Force ::geometry for null
        compiledExpr = { type: "op", op: "ST_AsGeoJSON", exprs: [{ type: "op", op: "ST_Transform", exprs: [{ type: "op", op: "::geometry", exprs: [compiledExpr]}, 4326] }] }

      query.selects.push({
        type: "select"
        expr: compiledExpr
        alias: "c#{colNum}"
      })

      # Add group by if not aggregate
      if isAggr and not axisBuilder.isAxisAggr(column.textAxis)
        query.groupBy.push(colNum + 1)

    # Compile orderings
    for ordering, i in design.orderings or []
      # Add as select so we can use ordinals. Prevents https://github.com/mWater/mwater-visualization/issues/165
      query.selects.push({
        type: "select"
        expr: exprCompiler.compileExpr(expr: ordering.axis?.expr, tableAlias: "main")
        alias: "o#{i}"
      })

      query.orderBy.push({ ordinal: design.columns.length + i + 1, direction: ordering.direction, nulls: (if ordering.direction == "desc" then "last" else "first") })

      # Add group by if non-aggregate
      if isAggr and exprUtils.getExprAggrStatus(ordering.axis?.expr) == "individual"
        query.groupBy.push(design.columns.length + i + 1)

    # Add id if non-aggr
    if not isAggr
      query.selects.push({
        type: "select"
        expr: { type: "field", tableAlias: "main", column: schema.getTable(design.table).primaryKey }
        alias: "id"
      })

    # Get relevant filters
    filters = _.where(filters or [], table: design.table)
    whereClauses = _.map(filters, (f) -> injectTableAlias(f.jsonql, "main"))

    # Compile filter
    if design.filter
      whereClauses.push(exprCompiler.compileExpr(expr: design.filter, tableAlias: "main"))

    whereClauses = _.compact(whereClauses)

    # Wrap if multiple
    if whereClauses.length > 1
      query.where = { type: "op", op: "and", exprs: whereClauses }
    else
      query.where = whereClauses[0]

    dataSource.performQuery(query, (error, data) => callback(error, { main: data }))

  # Create a view element for the chart
  # Options include:
  #   schema: schema to use
  #   dataSource: dataSource to use
  #   design: design of the chart
  #   data: results from queries
  #   width, height: size of the chart view
  #   scope: current scope of the view element
  #   onScopeChange: called when scope changes with new scope
  #   onRowClick: Called with (tableId, rowId) when item is clicked
  createViewElement: (options) ->
    # Create chart
    props = {
      schema: options.schema
      dataSource: options.dataSource
      design: @cleanDesign(options.design, options.schema)
      data: options.data

      width: options.width
      height: options.height

      scope: options.scope
      onScopeChange: options.onScopeChange

      onRowClick: options.onRowClick
    }

    return React.createElement(TableChartViewComponent, props)

  createDataTable: (design, schema, dataSource, data, locale) ->
    exprUtils = new ExprUtils(schema)

    renderHeaderCell = (column) =>
      column.headerText or exprUtils.summarizeExpr(column.textAxis?.expr, locale)

    header = _.map(design.columns, renderHeaderCell)
    table = [header]
    renderRow = (record) =>
      renderCell = (column, columnIndex) =>
        value = record["c#{columnIndex}"]

        # Handle empty as "" not "None"
        if not value?
          return ""

        exprUtils = new ExprUtils(schema)
        exprType = exprUtils.getExprType(column.textAxis?.expr)

        # Special case for images
        if exprType == "image" and value
          return dataSource.getImageUrl(value.id)

        if exprType == "imagelist" and value 
          return _.map(value, (img) -> dataSource.getImageUrl(img.id)).join(" ")

        return exprUtils.stringifyExprLiteral(column.textAxis?.expr, value, locale)

      return _.map(design.columns, renderCell)

    table = table.concat(_.map(data.main, renderRow))
    return table

  # Get a list of table ids that can be filtered on
  getFilterableTables: (design, schema) ->
    return _.compact([design.table])

  # Get the chart placeholder icon. fa-XYZ or glyphicon-XYZ
  getPlaceholderIcon: -> "fa-table"