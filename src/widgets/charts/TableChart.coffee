_ = require 'lodash'
React = require 'react'
H = React.DOM

injectTableAlias = require '../../injectTableAlias'
Chart = require './Chart'
ExpressionBuilder = require './../../expressions/ExpressionBuilder'
ExpressionCompiler = require './../../expressions/ExpressionCompiler'
AxisBuilder = require './../../expressions/axes/AxisBuilder'
TableChartDesignerComponent = require './TableChartDesignerComponent'
TableChartViewComponent = require './TableChartViewComponent'

###
Design is:
  
  table: table to use for data source
  titleText: title text
  columns: array of columns
  filter: optional logical expression to filter by

column:
  headerText: header text
  textAxis: axis that creates the text value of the column

###
module.exports = class TableChart extends Chart
  # Options include
  #  schema: schema to use
  constructor: (options) ->
    @schema = options.schema
    @exprBuilder = new ExpressionBuilder(@schema)
    @axisBuilder = new AxisBuilder(schema: @schema)

  cleanDesign: (design) ->
    # Clone deep for now # TODO
    design = _.cloneDeep(design)

    # Always have at least one column
    design.columns = design.columns or []
    if design.columns.length == 0
      design.columns.push({})

    # Clean each column
    for columnId in [0...design.columns.length]
      column = design.columns[columnId]

      # Clean textAxis
      column.textAxis = column.textAxis or {}
      column.textAxis = @axisBuilder.cleanAxis(column.textAxis, design.table, "optional")

    if design.filter
      design.filter = @exprBuilder.cleanExpr(design.filter, design.table)
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

      error = error or @axisBuilder.validateAxis(column.textAxis)

    error = error or @exprBuilder.validateExpr(design.filter)

    return error

  # Creates a design element with specified options
  # options include design: design and onChange: function
  createDesignerElement: (options) ->
    props = {
      schema: @schema
      design: @cleanDesign(options.design)
      onDesignChange: (design) =>
        # Clean design
        design = @cleanDesign(design)
        options.onDesignChange(design)
    }
    return React.createElement(TableChartDesignerComponent, props)

  createQueries: (design, filters) ->
    exprCompiler = new ExpressionCompiler(@schema)

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

    # Get relevant filters
    filters = _.where(filters or [], table: design.table)
    if design.filter
      filters.push(design.filter)

    # Compile all filters
    filters = _.map(filters, (f) -> injectTableAlias(f.jsonql, "main")) 

    # Wrap if multiple
    if filters.length > 1
      query.where = { type: "op", op: "and", exprs: filters }
    else
      query.where = filters[0]

    return { main: query }

  # Options include 
  # design: design of the chart
  # data: results from queries
  # width, height: size of the chart view
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

      scope: options.scope
      onScopeChange: options.onScopeChange
    }

    return React.createElement(TableChartViewComponent, props)

  createDataTable: (design, data) ->
    renderHeaderCell = (column) =>
      column.headerText or @axisBuilder.summarizeAxis(column.textAxis)

    header = _.map(design.columns, renderHeaderCell)
    table = [header]
    renderRow = (record) =>
      renderCell = (column, columnIndex) =>
        value = record["c#{columnIndex}"]
        return @axisBuilder.stringifyLiteral(column.textAxis, value)

      return _.map(design.columns, renderCell)

    table = table.concat(_.map(data.main, renderRow))
    return table

