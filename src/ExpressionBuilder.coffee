
# Understands expressions. Contains methods to build an expression of any type. 
module.exports = class ExpressionBuilder
  constructor: (schema) ->
    @schema = schema

  # Determines if an set of joins contains a multiple
  isMultipleJoins: (table, joins) ->
    t = table
    for j in joins
      joinCol = @schema.getColumn(t, j)
      if joinCol.join.multiple
        return true

      t = joinCol.join.toTable

    return false

  getAggrTypes: (expr) ->
    # Get available aggregations
    aggrs = @getAggrs(expr)

    # Keep unique types
    return _.uniq(_.pluck(aggrs, "type"))

  # Gets available aggregations [{id, name, type}]
  getAggrs: (expr) ->
    aggrs = []

    type = @getExprType(expr)
    
    table = @schema.getTable(expr.table)
    if table.ordering and type != "id"
      aggrs.push({ id: "last", name: "Latest", type: type })

    switch type
      when "date"
        aggrs.push({ id: "max", name: "Maximum", type: type })
        aggrs.push({ id: "min", name: "Minimum", type: type })

      when "integer", "decimal"
        aggrs.push({ id: "sum", name: "Sum", type: type })
        aggrs.push({ id: "avg", name: "Average", type: "decimal" })
        aggrs.push({ id: "max", name: "Maximum", type: type })
        aggrs.push({ id: "min", name: "Minimum", type: type })

    # Count is always last option
    aggrs.push({ id: "count", name: "Number", type: "integer" })

    return aggrs

  # Gets the type of an expression
  getExprType: (expr) ->
    if not expr?
      return null

    switch expr.type
      when "field"
        column = @schema.getColumn(expr.table, expr.column)
        return column.type
      when "scalar"
        if expr.aggr
          aggr = _.findWhere(@getAggrs(expr.expr), id: expr.aggr)
          if not aggr
            throw new Error("Aggregation #{expr.aggr} not found for scalar")
          return aggr.type
        return @getExprType(expr.expr)
      when "literal"
        return expr.valueType
      else
        throw new Error("Not implemented for #{expr.type}")

  # Summarizes expression as text
  summarizeExpr: (expr) ->
    if not expr
      return "None"
    switch expr.type
      when "scalar"
        return @summarizeScalarExpr(expr)
      when "field"
        return @schema.getColumn(expr.table, expr.column).name
      else
        throw new Error("Unsupported type #{expr.type}")

  summarizeScalarExpr: (expr) ->
    # Add aggr
    if expr.aggr
      str = _.findWhere(@getAggrs(expr.expr), { id: expr.aggr }).name + " of "
    else
      str = ""

    # Add table
    str += @schema.getTable(expr.table).name + " > "

    # Add joins
    t = expr.table
    for join in expr.joins
      joinCol = @schema.getColumn(t, join)
      str += joinCol.name + " > "
      t = joinCol.join.toTable

    str += @summarizeExpr(expr.expr)

    return str

  # Clean an expression, returning null if completely invalid, otherwise removing
  # invalid parts
  cleanExpr: (expr, table) ->
    if not expr
      return null

    # Strip if wrong table
    if table and expr.type != "literal" and expr.table != table
      return null

    switch expr.type
      when "field"
        return expr
      when "scalar"
        return @cleanScalarExpr(expr)
      when "comparison"
        return @cleanComparisonExpr(expr)
      when "logical"
        return @cleanLogicalExpr(expr)
      else
        throw new Error("Unknown expression type #{expr.type}")

  # Strips/defaults invalid aggr and where of a scalar expression
  cleanScalarExpr: (expr) ->
    if expr.aggr and not @isMultipleJoins(expr.table, expr.joins)
      expr = _.omit(expr, "aggr")

    if @isMultipleJoins(expr.table, expr.joins) and expr.aggr not in _.pluck(@getAggrs(expr.expr), "id")
      expr = _.extend({}, expr, { aggr: @getAggrs(expr.expr)[0].id })

    return expr

  # Removes parts that are invalid, leaving table alone
  cleanComparisonExpr: (expr) =>
    # TODO always creates new
    expr = _.extend({}, expr, lhs: @cleanExpr(expr.lhs, expr.table))

    # Remove op, rhs if no lhs
    if not expr.lhs 
      expr = { type: "comparison", table: expr.table }

    # Remove rhs if no op
    if not expr.op and expr.rhs
      expr = _.omit(expr, "rhs")

    if expr.op and expr.rhs and expr.lhs
      # Remove rhs if wrong type
      if @getComparisonRhsType(@getExprType(expr.lhs), expr.op) != @getExprType(expr.rhs)
        expr = _.omit(expr, "rhs")        
      # Remove rhs if wrong enum
      else if @getComparisonRhsType(@getExprType(expr.lhs), expr.op) == "enum" 
        if expr.rhs.type == "literal" and expr.rhs.valueType == "enum" and expr.rhs.value not in _.pluck(@getExprValues(expr.lhs), "id")
          expr = _.omit(expr, "rhs")

    # Default op
    if expr.lhs and not expr.op
      expr = _.extend({}, expr, op: @getComparisonOps(@getExprType(expr.lhs))[0].id)

    return expr

  cleanLogicalExpr: (expr) =>
    # TODO always makes new
    expr = _.extend({}, expr, exprs: _.map(expr.exprs, (e) => @cleanComparisonExpr(e)))

  # Get all comparison ops (id and name) for a given left hand side type
  getComparisonOps: (lhsType) ->
    ops = []
    switch lhsType
      when "integer", "decimal"
        ops.push({ id: "=", name: "=" })
        ops.push({ id: ">", name: ">" })
        ops.push({ id: ">=", name: ">=" })
        ops.push({ id: "<", name: "<" })
        ops.push({ id: "<=", name: "<=" })
      when "text"
        ops.push({ id: "~*", name: "matches" })
      when "date"
        ops.push({ id: ">", name: "after" })
        ops.push({ id: "<", name: "before" })
      when "enum"
        ops.push({ id: "=", name: "is" })
      when "boolean"
        ops.push({ id: "= true", name: "is true"})
        ops.push({ id: "= false", name: "is false"})

    ops.push({ id: "is null", name: "has no value"})
    ops.push({ id: "is not null", name: "has a value"})

    return ops

  # Get the right hand side type for a comparison
  getComparisonRhsType: (lhsType, op) ->
    if op in ['= true', '= false', 'is null', 'is not null']
      return null

    return lhsType

  getExprValues: (expr) ->
    if expr.type == "field"
      column = @schema.getColumn(expr.table, expr.column)
      return column.values
    if expr.type == "scalar"
      return @getExprValues(expr.expr)  