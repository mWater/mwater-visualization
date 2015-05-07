
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
      if scalar.aggr not in _.pluck(aggrs, "id")
        scalar.aggr = aggrs[0].id
