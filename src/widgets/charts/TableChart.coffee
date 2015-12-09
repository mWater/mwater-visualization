_ = require 'lodash'
React = require 'react'
H = React.DOM

injectTableAlias = require('mwater-expressions').injectTableAlias
Chart = require './Chart'
ExprCleaner = require('mwater-expressions').ExprCleaner
ExprCompiler = require('mwater-expressions').ExprCompiler
AxisBuilder = require './../../axes/AxisBuilder'
TableChartDesignerComponent = require './TableChartDesignerComponent'
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
  # Options include
  #  schema: schema to use
  #  dataSource: data source to use
  constructor: (options) ->
    @schema = options.schema
    @dataSource = options.dataSource
    @exprCleaner = new ExprCleaner(@schema)
    @axisBuilder = new AxisBuilder(schema: @schema)

  cleanDesign: (design) ->
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
      column.textAxis = @axisBuilder.cleanAxis(axis: column.textAxis, table: design.table, aggrNeed: "optional")

    # Clean orderings
    for ordering in design.orderings
      ordering.axis = @axisBuilder.cleanAxis(axis: ordering.axis, table: design.table, aggrNeed: "optional")

    if design.filter
      design.filter = @exprCleaner.cleanExpr(design.filter, { table: design.table })

    return design

  validateDesign: (design) ->
    # Check that has table
    if not design.table
      return "Missing data source"

    error = null

    for column in design.columns
      # Check that has textAxis
      if not column.textAxis
        error = error or "Missing text"

      error = error or @axisBuilder.validateAxis(axis: column.textAxis)

    for ordering in design.orderings
      if not ordering.axis
        error = error or "Missing order expression"
      error = error or @axisBuilder.validateAxis(axis: ordering.axis)

    return error

  isEmpty: (design) ->
    return not design.columns or not design.columns[0] or not design.columns[0].textAxis

  # Creates a design element with specified options
  # options include design: design and onChange: function
  createDesignerElement: (options) ->
    props = {
      schema: @schema
      design: @cleanDesign(options.design)
      dataSource: @dataSource
      onDesignChange: (design) =>
        # Clean design
        design = @cleanDesign(design)
        options.onDesignChange(design)
    }
    return React.createElement(TableChartDesignerComponent, props)

  createQueries: (design, filters) ->
    exprCompiler = new ExprCompiler(@schema)

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

      expr = @axisBuilder.compileAxis(axis: column.textAxis, tableAlias: "main")

      query.selects.push({ 
        type: "select"
        expr: expr
        alias: "c#{colNum}" 
      })

      # Add group by
      if not column.textAxis.aggr
        query.groupBy.push(colNum + 1)

    # Compile orderings
    for ordering in design.orderings
      query.orderBy.push({ expr: @axisBuilder.compileAxis(axis: ordering.axis, tableAlias: "main"), direction: ordering.direction })
      # Add group by if non-aggregate
      if not ordering.axis.aggr
        query.groupBy.push(@axisBuilder.compileAxis(axis: ordering.axis, tableAlias: "main"))

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

    return { main: query }

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

