
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

  # Follows a list of joins to determine final table
  followJoins: (startTable, joins) ->
    t = startTable
    for j in joins
      joinCol = @schema.getColumn(t, j)
      t = joinCol.join.toTable

    return t

  getAggrTypes: (expr) ->
    # Get available aggregations
    aggrs = @getAggrs(expr)

    # Keep unique types
    return _.uniq(_.pluck(aggrs, "type"))

  # Gets available aggregations [{id, name, type}]
  getAggrs: (expr) ->
    aggrs = []

    type = @getExprType(expr)

    # If null type, only return count
    if not type
      return [{ id: "count", name: "Number", type: "integer" }]
    
    table = @schema.getTable(expr.table)
    if table.ordering
      aggrs.push({ id: "last", name: "Latest", type: type })

    switch type
      when "date"
        aggrs.push({ id: "max", name: "Maximum", type: type })
        aggrs.push({ id: "min", name: "Minimum", type: type })

      when "integer", "decimal"
        aggrs.push({ id: "sum", name: "Total", type: type })
        aggrs.push({ id: "avg", name: "Average", type: "decimal" })
        aggrs.push({ id: "max", name: "Maximum", type: type })
        aggrs.push({ id: "min", name: "Minimum", type: type })

    # Count is always last option
    aggrs.push({ id: "count", name: "Number of", type: "integer" })

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

    # Add joins
    t = expr.table
    for join in expr.joins
      joinCol = @schema.getColumn(t, join)
      str += joinCol.name + " > "
      t = joinCol.join.toTable

    # Special case for aggr (count) of null to be rendered Number of {last join name}
    if expr.aggr and not expr.expr
      str = str.substring(0, str.length - 3)
    else
      str += @summarizeExpr(expr.expr)

    return str

  # Summarize an expression with optional aggregation
  summarizeAggrExpr: (expr, aggr) ->
    # Summarize null with count as "Number of {table name}" to handle count(*) case 
    if expr and not @getExprType(expr) and aggr == "count"
      summary = "Number of #{@schema.getTable(expr.table).name}"
    else if not aggr
      summary = @summarizeExpr(expr)
    else
      aggrName = _.findWhere(@getAggrs(expr), { id: aggr }).name
      return aggrName + " " + @summarizeExpr(expr)

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
        if not expr.column or not expr.table
          return null
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

    # Clean where
    if expr.where
      expr.where = @cleanExpr(expr.where)

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
        if expr.rhs.type == "literal" and expr.rhs.value not in _.pluck(@getExprValues(expr.lhs), "id")
          expr = _.omit(expr, "rhs")
      # Remove rhs if empty enum list
      else if @getComparisonRhsType(@getExprType(expr.lhs), expr.op) == "enum[]" 
        if expr.rhs.type == "literal"
          # Filter invalid values
          expr.rhs.value = _.intersection(_.pluck(@getExprValues(expr.lhs), "id"), expr.rhs.value)

          # Remove if empty
          if expr.rhs.value.length == 0
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
        ops.push({ id: "=", name: "equals" })
        ops.push({ id: ">", name: "is greater than" })
        ops.push({ id: ">=", name: "is greater or equal to" })
        ops.push({ id: "<", name: "is less than" })
        ops.push({ id: "<=", name: "is less than or equal to" })
      when "text"
        ops.push({ id: "~*", name: "matches" })
      when "date"
        ops.push({ id: ">", name: "after" })
        ops.push({ id: "<", name: "before" })
      when "enum"
        ops.push({ id: "= any", name: "is one of" })
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

    if op in ['= any']
      return 'enum[]'

    return lhsType

  # Return array of { id: <enum value>, name: <localized label of enum value> }
  getExprValues: (expr) ->
    if expr.type == "field"
      column = @schema.getColumn(expr.table, expr.column)
      return column.values
    if expr.type == "scalar"
      if expr.expr
        return @getExprValues(expr.expr)  

  # Converts all literals to string, using name of enums
  stringifyExprLiteral: (expr, literal) ->
    if not literal?
      return "null"

    values = @getExprValues(expr)
    if values
      item = _.findWhere(values, id: literal)
      if item
        return item.name
      return "???"

    return "#{literal}"

  # Returns null if ok, error message if invalid
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
    if not expr.lhs then return "Missing left-hand side"
    if not expr.op then return "Missing operation"
    if @getComparisonRhsType(@getExprType(expr.lhs), expr.op) and not expr.rhs then return "Missing right-hand side"

    return @validateExpr(expr.lhs) or @validateExpr(expr.rhs)

  validateLogicalExpr: (expr) ->
    error = null
    for subexpr in expr.exprs
      error = error or @validateExpr(subexpr)
    return error

  validateScalarExpr: (expr) ->
    # Check that has table
    if not expr.table
      return "Missing expression"

    error = @validateExpr(expr.expr) or @validateExpr(expr.where)

    return error
