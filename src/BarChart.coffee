_ = require 'lodash'
React = require 'react'
H = React.DOM

Chart = require './Chart'
ExpressionBuilder = require './ExpressionBuilder'
ExpressionCompiler = require './ExpressionCompiler'
BarChartDesignerComponent = require './BarChartDesignerComponent'
BarChartViewComponent = require './BarChartViewComponent'

###
Design is:

table: base table of design

aesthetics:
  x:
    expr: expression
    scale: scale
  y: 
    expr: expression
    scale: scale
    aggr: aggregation function to apply
  color:
    expr: expression
    scale: scale

filter: expression that filters table

stacked: true/false

###
module.exports = class BarChart extends Chart
  constructor: (schema) ->
    @schema = schema
    @exprBuilder = new ExpressionBuilder(@schema)

  cleanDesign: (design) ->
    # Fill in defaults
    if not design.aesthetics
      design.aesthetics = {}

    # Clone deep for now # TODO
    design = _.cloneDeep(design)

    # Clean aesthetic expressions.
    for aes in ['y', 'x', 'color']
      value = design.aesthetics[aes]

      # Aesthetic or its expression can be blank
      if not value or not value.expr
        continue

      # Clean expression
      value.expr = @exprBuilder.cleanExpr(value.expr, design.table)

    # Default y expr
    if not design.aesthetics.y or not design.aesthetics.y.expr
      if design.table 
        # Get id column
        idCol = _.findWhere(@schema.getColumns(design.table), type: "id")
        if idCol
          design.aesthetics.y = { expr: { type: "scalar", table: design.table, joins: [], expr: { type: "field", table: design.table, column: idCol.id } }, aggr: "count" }

    # Default y aggr
    if design.aesthetics.y and design.aesthetics.y.expr and not design.aesthetics.y.aggr
      # Remove latest, as it is tricky to group by. TODO
      aggrs = @exprBuilder.getAggrs(design.aesthetics.y.expr)
      aggrs = _.filter(aggrs, (aggr) -> aggr.id != "last")

      design.aesthetics.y.aggr = aggrs[0].id

    if design.filter
      design.filter = @exprBuilder.cleanExpr(design.filter, design.table)

    return design

  validateDesign: (design) ->
    # Check that has table
    if not design.table
      return "Missing Table"

    # Check that has x and y
    if not design.aesthetics.x or not design.aesthetics.x.expr
      return "Missing X Axis"
    if not design.aesthetics.y or not design.aesthetics.y.expr
      return "Missing Y Axis"

    error = null
    if not design.aesthetics.y.aggr
      error = "Missing Y aggregation"
    error = error or @exprBuilder.validateExpr(design.aesthetics.x.expr)
    error = error or @exprBuilder.validateExpr(design.aesthetics.y.expr)
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
    return React.createElement(BarChartDesignerComponent, props)

  createQueries: (design) ->
    exprCompiler = new ExpressionCompiler(@schema)

    # Create main query
    query = {
      type: "query"
      selects: []
      from: { type: "table", table: design.table, alias: "main" }
      groupBy: [1] # X-axis
      limit: 1000
    }

    query.selects.push({ type: "select", expr: exprCompiler.compileExpr(expr: design.aesthetics.x.expr, tableAlias: "main"), alias: "x" })

    # Y is aggregated
    expr = exprCompiler.compileExpr(expr: design.aesthetics.y.expr, tableAlias: "main")
    query.selects.push({ type: "select", expr: { type: "op", op: design.aesthetics.y.aggr, exprs: [expr] }, alias: "y" })

    # Add where
    if design.filter
      query.where = exprCompiler.compileExpr(expr: design.filter, tableAlias: "main")

    return { main: query }

  # Options include 
  # design: design of the component
  # data: results from queries
  # width, height
  createViewElement: (options) ->
    rows = options.data.main
    for row in rows
      if not row.x
        row.x = "(None)"

    # Create datum from query re    
    props = {
      schema: @schema
      design: @cleanDesign(options.design)
      onChange: options.onChange
      width: options.width
      height: options.height
      data: rows
    }

    return React.createElement(BarChartViewComponent, props)
