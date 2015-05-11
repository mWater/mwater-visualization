
# Cleans and validates designs
module.exports = class DesignValidator
  constructor: (schema) ->
    @schema = schema

  # Returns null if ok, message if bad
  validateExpr: (expr) ->
    # Empty is ok
    if not expr
      return null

    switch expr.type
      when "scalar"
        return @validateScalarExpr(expr)
      when "comparison"
        return @validateComparisonExpr(expr)
      when "logical"
        return @validateLogicalExpr(expr)
    return null

  validateComparisonExpr: (expr) ->
    if not expr.lhs then return "Missing lhs"
    if not expr.op then return "Missing op"
    if @schema.getComparisonRhsType(@schema.getExprType(expr.lhs), expr.op) and not expr.rhs then return "Missing rhs"

    return @validateExpr(expr.lhs) or @validateExpr(expr.rhs)

  validateLogicalExpr: (expr) ->
    error = null
    for subexpr in expr.exprs
      error = error or @validateExpr(subexpr)
    return error

  validateScalarExpr: (expr) ->
    # TODO
    return null

  cleanExpr: (expr, baseTableId) ->
    if not expr or not expr.type
      return expr

    switch expr.type
      when "scalar"
        return @cleanScalarExpr(expr)
      when "comparison"
        return @cleanComparisonExpr(expr)
      when "logical"
        return @cleanLogicalExpr(expr)

    return expr

  cleanScalarExpr: (scalar, baseTableId) =>
    if not scalar then return scalar

    # If baseTable wrong, set null
    # TODO

    # Clean aggregate
    if scalar.expr
      aggrs = @schema.getAggrs(scalar.expr)

      # Remove if wrong
      if scalar.aggrId not in _.pluck(aggrs, "id")
        scalar = _.omit(scalar, "aggrId")

      # Set if needed to first
      if not @schema.isAggrNeeded(scalar.joinIds)
        scalar = _.omit(scalar, "aggrId")
      else if not scalar.aggrId
        scalar = _.extend({}, scalar, { aggrId: aggrs[0].id })

    # Clean where
    if scalar.where
      scalar = _.extend({}, scalar, { where: @cleanExpr(scalar.where, @schema.getExprTable(scalar.expr).id) })

    return scalar

  cleanComparisonExpr: (expr, baseTableId) =>
    # TODO always creates new
    expr = _.extend({}, expr, lhs: @cleanExpr(expr.lhs))

    # Remove op, rhs if no lhs
    if not expr.lhs 
      expr = { type: "comparison" }

    # Remove rhs if no op
    if not expr.op and expr.rhs
      expr = _.omit(expr, "rhs")

    if expr.op and expr.rhs and expr.lhs
      # Remove rhs if wrong type
      if @schema.getComparisonRhsType(@schema.getExprType(expr.lhs), expr.op) != @schema.getExprType(expr.rhs)
        expr = _.omit(expr, "rhs")        
      # Remove rhs if wrong enum
      else if @schema.getComparisonRhsType(@schema.getExprType(expr.lhs), expr.op) == "enum" and expr.rhs.type == "enum" and expr.rhs.value not in _.pluck(@schema.getExprValues(expr.lhs), "id")
        expr = _.omit(expr, "rhs")

    # Default op
    if expr.lhs and not expr.op
      expr = _.extend({}, expr, op: @schema.getComparisonOps(@schema.getExprType(expr.lhs))[0].id)

    # Default rhs enum
    if expr.lhs and expr.op and not expr.rhs and @schema.getComparisonRhsType(@schema.getExprType(expr.lhs), expr.op) == "enum"
      expr = _.extend({}, expr, rhs: { type: "enum", value: @schema.getExprValues(expr.lhs)[0].id })

    return expr

  cleanLogicalExpr: (expr, baseTableId) =>
    # TODO always makes new
    expr = _.extend({}, expr, exprs: _.map(expr.exprs, (e) => @cleanComparisonExpr(e, baseTableId)))

