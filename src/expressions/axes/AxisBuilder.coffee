ExpressionCompiler = require '../ExpressionCompiler'
ExpressionBuilder = require '../ExpressionBuilder'

# An axis is an expression with optional aggregation, transform and color mapping
# In ggplot2 parlance, an "aesthetic"
# It contains:
#  expr: expression
#  aggr: optional aggregation (e.g. sum)
#  xform: TBD
#  colorMap: TBD
module.exports = class AxisBuilder
  # Options are: schema
  constructor: (axis) ->
    @schema = axis.schema

  # Pass axis, tableAlias
  compileAxis: (options) ->
    if not options.axis
      return null

    exprCompiler = new ExpressionCompiler(@schema)
    compiledExpr = exprCompiler.compileExpr(expr: options.axis.expr, tableAlias: options.tableAlias, aggr: options.axis.aggr)

    # Aggregate
    if options.axis.aggr
      compiledExpr = {
        type: "op"
        op: options.axis.aggr
        exprs: _.compact([compiledExpr])
      }

    return compiledExpr

  validateAxis: (axis) ->
    # TODO 
    return null

  getAxisType: (axis) ->
    if not axis
      return null

    # TODO add aggr support
    # TODO add xform support
    exprBuilder = new ExpressionBuilder(@schema)
    return exprBuilder.getExprType(axis.expr)

  # Summarize axis as a string
  summarizeAxis: (axis) ->
    # TODO add aggr support
    # TODO add xform support
    exprBuilder = new ExpressionBuilder(@schema)
    return exprBuilder.summarizeExpr(axis.expr)

  # Get a string representation of an axis value
  stringifyLiteral: (axis, value) ->
    # TODO add aggr support, xform support
    exprBuilder = new ExpressionBuilder(@schema)
    return exprBuilder.stringifyExprLiteral(axis.expr, value)

  # Creates a filter (jsonql with {alias} for table name) based on a specific value
  # of the axis. Used to filter by a specific point.
  createValueFilter: (axis, value) ->
    if value?
      return {
        type: "op"
        op: "="
        exprs: [
          @compileAxis(axis: axis, tableAlias: "{alias}")
          { type: "literal", value: value }
        ]
      }
    else
      return {
        type: "op"
        op: "is null"
        exprs: [
          @compileAxis(axis: axis, tableAlias: "{alias}")
        ]
      }
