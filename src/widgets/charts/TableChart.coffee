_ = require 'lodash'
React = require 'react'
H = React.DOM

injectTableAlias = require('mwater-expressions').injectTableAlias
Chart = require './Chart'
ExprUtils = require('mwater-expressions').ExprUtils
ExprCleaner = require('mwater-expressions').ExprCleaner
ExprCompiler = require('mwater-expressions').ExprCompiler
AxisBuilder = require './../../axes/AxisBuilder'
TableChartViewComponent = require './TableChartViewComponent'

###
Design is:
  
  table: table to use for data source
  titleText: title text
  columns: array of columns
  filter: optional logical expression to filter by
  orderings: array of orderings

column:
  headerText: header text
  textAxis: axis that creates the text value of the column

ordering:
  axis: axis that creates the order expression
  direction: "asc"/"desc"

###
module.exports = class TableChart extends Chart
  cleanDesign: (design, schema) ->
    exprCleaner = new ExprCleaner(schema)
    axisBuilder = new AxisBuilder(schema: schema)

    # Clone deep for now # TODO
    design = _.cloneDeep(design)

    design.version = design.version or 1

    # Always have at least one column
    design.columns = design.columns or []
    if design.columns.length == 0
      design.columns.push({})

    design.orderings = design.orderings or []

    # Clean each column
    for columnId in [0...design.columns.length]
      column = design.columns[columnId]

      # Clean textAxis
      column.textAxis = axisBuilder.cleanAxis(axis: column.textAxis, table: design.table, aggrNeed: "optional")

    # Clean orderings
    for ordering in design.orderings
      ordering.axis = axisBuilder.cleanAxis(axis: ordering.axis, table: design.table, aggrNeed: "optional")

    if design.filter
      design.filter = exprCleaner.cleanExpr(design.filter, { table: design.table, types: ['boolean'] })

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
      limit: 1000
    }

    # For each column
    for colNum in [0...design.columns.length]
      column = design.columns[colNum]

      expr = axisBuilder.compileAxis(axis: column.textAxis, tableAlias: "main")

      query.selects.push({ 
        type: "select"
        expr: expr
        alias: "c#{colNum}" 
      })

      # Add group by if not aggregate
      if not axisBuilder.isAxisAggr(column.textAxis)
        query.groupBy.push(colNum + 1)

    # Compile orderings
    for ordering, i in design.orderings or []
      # Add as select so we can use ordinals. Prevents https://github.com/mWater/mwater-visualization/issues/165
      query.selects.push({
        type: "select"
        expr: axisBuilder.compileAxis(axis: ordering.axis, tableAlias: "main")
        alias: "o#{i}"
      })
      
      query.orderBy.push({ ordinal: design.columns.length + i + 1, direction: ordering.direction })
      # Add group by if non-aggregate
      if not axisBuilder.isAxisAggr(ordering.axis)
        query.groupBy.push(design.columns.length + i + 1)

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
  #   width, height, standardWidth: size of the chart view
  #   scope: current scope of the view element
  #   onScopeChange: called when scope changes with new scope
  createViewElement: (options) ->
    # Create chart
    props = {
      schema: options.schema
      design: @cleanDesign(options.design, options.schema)
      data: options.data

      width: options.width
      height: options.height
      standardWidth: options.standardWidth

      scope: options.scope
      onScopeChange: options.onScopeChange
    }

    return React.createElement(TableChartViewComponent, props)

  createDataTable: (design, data, locale) ->
    renderHeaderCell = (column) =>
      column.headerText or @axisBuilder.summarizeAxis(column.textAxis, locale)

    header = _.map(design.columns, renderHeaderCell)
    table = [header]
    renderRow = (record) =>
      renderCell = (column, columnIndex) =>
        value = record["c#{columnIndex}"]
        return @axisBuilder.formatValue(column.textAxis, value, locale)

      return _.map(design.columns, renderCell)

    table = table.concat(_.map(data.main, renderRow))
    return table

