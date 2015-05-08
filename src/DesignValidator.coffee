
# Cleans and validates designs
module.exports = class DesignValidator
  constructor: (schema) ->
    @schema = schema

  cleanExpr: (expr) ->
    switch expr.type
      when "scalar"
        @cleanScalarExpr(expr)

  cleanScalarExpr: (scalar) ->
    # Clean aggregate
    if scalar.expr
      aggrs = @schema.getAggrs(scalar.expr)

      # Remove if wrong
      if scalar.aggr not in _.pluck(aggrs, "id")
        scalar.aggr = null

      # Set if needed to first
      if @schema.isAggrNeeded(scalar.joinIds)
        scalar.aggr = aggrs[0].id
