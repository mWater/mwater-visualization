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
    @exprBuilder = new ExpressionBuilder(@schema)

  # Clean an axis with respect to a specific table
  # aggrNeed is "none", "optional" or "required"
  cleanAxis: (axis, table, aggrNeed="optional") ->
    if not axis
      return

    # TODO always clones
    axis = _.clone(axis)

    # Clean expression
    axis.expr = @exprBuilder.cleanExpr(axis.expr, table)

    # Remove if null or no type
    if not @exprBuilder.getExprType(axis.expr)
      return

    # Clean aggr
    aggrs = @exprBuilder.getAggrs(axis.expr)
    # Remove latest, as it is tricky to group by. TODO
    aggrs = _.filter(aggrs, (aggr) -> aggr.id != "last")

    # Remove existing if not in list
    if axis.aggr and axis.aggr not in _.pluck(aggrs, "id")
      delete axis.aggr

    # Remove if need is none
    if aggrNeed == "none"
      delete axis.aggr

    # Default aggr if required
    if aggrNeed == "required" and aggrs[0] and not axis.aggr
      axis.aggr = aggrs[0].id

    # Set aggr to count if expr is type count and aggr possible
    if aggrNeed != "none" and not axis.aggrs
      if @exprBuilder.getExprType(axis.expr) == "count"
        axis.aggr = "count"

    return axis

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
    # Nothing is ok
    if not axis
      return

    # TODO
    return @exprBuilder.validateExpr(axis.expr)

  # Get all categories for a given axis type given the known values
  # Returns array of { value, label }
  getCategories: (axis, values) ->
    switch @getAxisType(axis)
      when "enum"
        # If enum, return enum values
        return _.map(@exprBuilder.getExprValues(axis.expr), (ev) -> { value: ev.id, label: ev.name })
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

    return []

  getAxisType: (axis) ->
    if not axis
      return null

    # TODO add aggr support
    # TODO add xform support
    return @exprBuilder.getExprType(axis.expr)

  # Summarize axis as a string
  summarizeAxis: (axis) ->
    exprType = @exprBuilder.getExprType(axis.expr)

    # Add aggr if not a count type
    if axis.aggr and exprType != "count"
      aggrName = _.findWhere(@exprBuilder.getAggrs(axis.expr), { id: axis.aggr }).name
      return aggrName + " " + @exprBuilder.summarizeExpr(axis.expr)
    else
      return @exprBuilder.summarizeExpr(axis.expr)
    # TODO add xform support

  # Get a string representation of an axis value
  stringifyLiteral: (axis, value) ->
    # TODO add aggr support, xform support
    return @exprBuilder.stringifyExprLiteral(axis.expr, value)

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
