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

  # Get all categories for a given axis type given the known values
  # Returns array of { value, label }
  getCategories: (axis, values) ->
    exprBuilder = new ExpressionBuilder(@schema)

    switch @getAxisType(axis)
      when "enum"
        # If enum, return enum values
        return _.map(exprBuilder.getExprValues(axis.expr), (ev) -> { value: ev.id, label: ev.name })
      when "integer"
        # Handle none
        if values.length == 0
          return []

        # Integers are sometimes strings from database, so always parseInt (bigint in node-postgres)
        min = _.min(_.map(values, (v) -> parseInt(v)))
        max = _.max(_.map(values, (v) -> parseInt(v)))

        return _.map(_.range(min, max + 1), (v) -> { value: v, label: "#{v}"})
      when "text"
        # Return unique values
        return _.map(_.uniq(values), (v) -> { value: v, label: v })

    throw new Error("Unsupported categories axis type")

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
