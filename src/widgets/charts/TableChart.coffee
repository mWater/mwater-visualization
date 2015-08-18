_ = require 'lodash'
React = require 'react'
H = React.DOM

Chart = require './Chart'
ExpressionBuilder = require './../../expressions/ExpressionBuilder'
ExpressionCompiler = require './../../expressions/ExpressionCompiler'
TableChartDesignerComponent = require './TableChartDesignerComponent'
TableChartViewComponent = require './TableChartViewComponent'

###
Design is:
  
  table: table to use for data source
  titleText: title text
  columns: array of columns
  filter: optional logical expression to filter by

column:
  headerText: heaer text
  expr: expression for column value
  aggr: aggregation function if needed

###
module.exports = class TableChart extends Chart
  # Options include
  #  schema: schema to use
  constructor: (options) ->
    @schema = options.schema
    @exprBuilder = new ExpressionBuilder(@schema)

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

      # Clean expression
      column.expr = @exprBuilder.cleanExpr(column.expr, design.table)

      # Remove invalid aggr
      if column.expr
        aggrs = @exprBuilder.getAggrs(column.expr)
        if column.aggr and column.aggr not in _.pluck(aggrs, "id")
          delete column.aggr

        # Set count aggr if null expression type
        if not column.aggr and not @exprBuilder.getExprType(column.expr)
          column.aggr = "count"

    if design.filter
      design.filter = @exprBuilder.cleanExpr(design.filter, design.table)
    return design

  validateDesign: (design) ->
    # Check that has table
    if not design.table
      return "Missing data source"

    error = null

    for column in design.columns
      # Check that has expr
      if not column.expr
        error = error or "Missing expression"

      error = error or @exprBuilder.validateExpr(column.xExpr)

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

      expr = @compileExpr(column.expr, column.aggr)

      query.selects.push({ 
        type: "select"
        expr: expr
        alias: "c#{colNum}" 
      })

      # Add group by
      if not column.aggr
        query.groupBy.push(colNum + 1)

    # Get relevant filters
    filters = _.where(filters or [], table: design.table)
    if design.filter
      filters.push(design.filter)

    # Compile all filters
    filters = _.map(filters, @compileExpr)      

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

  compileExpr: (expr, aggr) =>
    exprCompiler = new ExpressionCompiler(@schema)
    return exprCompiler.compileExpr(expr: expr, tableAlias: "main", aggr: aggr)

  createDataTable: (design, data) ->
    renderHeaderCell = (column) =>
      column.headerText or @exprBuilder.summarizeAggrExpr(column.expr, column.aggr)

    header = _.map(design.columns, renderHeaderCell)
    table = [header]
    renderRow = (record) =>
      renderCell = (column, columnIndex) =>
        value = record["c#{columnIndex}"]
        return @exprBuilder.stringifyExprLiteral(column.expr, value)

      return _.map(design.columns, renderCell)

    table = table.concat(_.map(data.main, renderRow))
    return table

