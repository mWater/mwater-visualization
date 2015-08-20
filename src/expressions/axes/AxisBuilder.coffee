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
  # Options are: schema, table
  constructor: (options) ->
    @schema = options.schema
    @table = options.table

  compile: (axis, tableAlias) ->
    exprCompiler = new ExpressionCompiler(@schema)
    return exprCompiler.compileExpr(expr: axis.expr, tableAlias: tableAlias, aggr: axis.aggr)

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



