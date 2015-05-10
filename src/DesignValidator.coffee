
# Cleans and validates designs
module.exports = class DesignValidator
  constructor: (schema) ->
    @schema = schema

  cleanExpr: (expr) ->
    switch expr.type
      when "scalar"
        return @cleanScalarExpr(expr)

  cleanScalarExpr: (scalar, baseTable) ->
    if not scalar then return scalar

    # TODO toast if baseTable wrong

    # Clean aggregate
    if scalar.expr
      aggrs = @schema.getAggrs(scalar.expr)

      # Remove if wrong
      if scalar.aggr not in _.pluck(aggrs, "id")
        scalar = _.omit(scalar, "aggr")

      # Set if needed to first
      if not @schema.isAggrNeeded(scalar.joinIds)
        scalar = _.omit(scalar, "aggr")
      else if not scalar.aggr
        scalar = _.extend({}, scalar, { aggr: aggrs[0].id })

    return scalar


