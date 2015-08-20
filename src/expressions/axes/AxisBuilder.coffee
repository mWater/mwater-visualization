ExpressionCompiler = require '../ExpressionCompiler'

# An axis is an expression with optional aggregation, transform and color mapping
# In ggplot2 parlance, an "aesthetic"
# It contains:
#  expr: expression
#  aggr: optional aggregation (e.g. sum)
#  xform: TBD
#  colorMap: TBD
module.exports = class AxisBuilder
  # Options are: schema, table, tableAlias
  constructor: (options) ->
    @schema = options.schema
    @table = options.table
    @tableAlias = options.tableAlias

  compile: (axis) ->
    exprCompiler = new ExpressionCompiler(@schema)
    return exprCompiler.compileExpr(expr: axis.expr, tableAlias: @tableAlias, aggr: axis.aggr)
    

