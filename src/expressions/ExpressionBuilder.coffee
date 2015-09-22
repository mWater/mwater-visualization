_ = require 'lodash'

# Understands expressions. Contains methods to clean/validate etc. an expression of any type. 
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

    # If null type, retun none
    if not type
      return []
    
    table = @schema.getTable(expr.table)
    if table.ordering and type != "count"
      aggrs.push({ id: "last", name: "Latest", type: type })

    switch type
      when "date", "datetime"
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

  # Gets the table of an expression
  getExprTable: (expr) ->
    if expr and expr.table
      return expr.table

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
      when "count"
        return "count"
      else
        throw new Error("Not implemented for #{expr.type}")

  # Summarizes expression as text
  summarizeExpr: (expr) ->
    if not expr
      return "None"

    # Check named expresions
    table = @getExprTable(expr)
    namedExpr = _.find(@schema.getNamedExprs(table), (ne) =>
      return @areExprsEqual(@simplifyExpr(ne.expr), @simplifyExpr(expr))
    )

    if namedExpr
      return namedExpr.name

    switch expr.type
      when "scalar"
        return @summarizeScalarExpr(expr)
      when "field"
        return @schema.getColumn(expr.table, expr.column).name
      when "count"
        return "Number of " + @schema.getTable(expr.table).name
      else
        throw new Error("Unsupported type #{expr.type}")

  summarizeScalarExpr: (expr) ->
    exprType = @getExprType(expr.expr)

    # Add aggr
    if expr.aggr 
      str = _.findWhere(@getAggrs(expr.expr), { id: expr.aggr }).name + " "
    else
      str = ""

    # Add joins
    t = expr.table
    for join in expr.joins
      joinCol = @schema.getColumn(t, join)
      str += joinCol.name + " > "
      t = joinCol.join.toTable

    # Special case for count of count type to be rendered Number of {last join name}
    if expr.aggr and exprType == "count"
      str = str.substring(0, str.length - 3)
    else
      str += @summarizeExpr(expr.expr)

    return str

  # Summarize an expression with optional aggregation
  # TODO Remove to AxisBuilder
  summarizeAggrExpr: (expr, aggr) ->
    exprType = @getExprType(expr)

    # Add aggr if not a count type
    if aggr and exprType != "count"
      aggrName = _.findWhere(@getAggrs(expr), { id: aggr }).name
      return aggrName + " " + @summarizeExpr(expr)
    else
      return @summarizeExpr(expr)

  # Clean an expression, returning null if completely invalid, otherwise removing
  # invalid parts
  cleanExpr: (expr, table) ->
    if not expr
      return null

    # Strip if wrong table
    if table and expr.type != "literal" and expr.table != table
      return null

    # Strip if non-existent table
    if expr.table and not @schema.getTable(expr.table)
      return null

    switch expr.type
      when "field"
        return @cleanFieldExpr(expr)
      when "scalar"
        return @cleanScalarExpr(expr)
      when "comparison"
        return @cleanComparisonExpr(expr)
      when "logical"
        return @cleanLogicalExpr(expr)
      when "count"
        # TODO null if table does not exist
        return expr
      else
        throw new Error("Unknown expression type #{expr.type}")

  # Removes references to non-existent tables
  cleanFieldExpr: (expr) ->
    # Empty expression
    if not expr.column or not expr.table
      return null

    # Missing table
    if not @schema.getTable(expr.table)
      return null

    # Missing column
    if not @schema.getColumn(expr.table, expr.column)
      return null

    return expr

  # Determines if an set of joins are valid
  areJoinsValid: (table, joins) ->
    t = table
    for j in joins
      joinCol = @schema.getColumn(t, j)
      if not joinCol 
        return false

      t = joinCol.join.toTable

    return true

  # Strips/defaults invalid aggr and where of a scalar expression
  cleanScalarExpr: (expr) ->
    if not @areJoinsValid(expr.table, expr.joins)
      return null

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

    # Remove op if wrong type
    if expr.op and expr.op not in _.pluck(@getComparisonOps(@getExprType(expr.lhs)), "id")
      expr = _.omit(expr, "op")

    # Default op
    if expr.lhs and not expr.op
      expr = _.extend({}, expr, op: @getComparisonOps(@getExprType(expr.lhs))[0].id)

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
      else if @getComparisonRhsType(@getExprType(expr.lhs), expr.op) == "text[]" 
        if expr.rhs.type == "literal"
          # Remove if empty
          if expr.rhs.value.length == 0
            expr = _.omit(expr, "rhs")

    return expr

  cleanLogicalExpr: (expr) =>
    # TODO always makes new
    expr = _.extend({}, expr, exprs: _.map(expr.exprs, (e) => @cleanComparisonExpr(e)))

  # Reduce scalar to field expressions or null when possible
  simplifyExpr: (expr) ->
    if not expr
      return null

    if expr.type == "scalar"
      if expr.joins.length == 0 and not expr.where
        return @simplifyExpr(expr.expr)

    return expr

  # Check if two expressions are functionally identical
  areExprsEqual: (expr1, expr2) ->
    return _.isEqual(@simplifyExpr(expr1), @simplifyExpr(expr2))

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
        ops.push({ id: "= any", name: "is one of" })
        ops.push({ id: "=", name: "is" })
        ops.push({ id: "~*", name: "matches" })
      when "date", "datetime"
        ops.push({ id: "between", name: "between" })
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
      if lhsType == "enum"
        return 'enum[]'
      else if lhsType == "text"
        return "text[]"
      else
        throw new Error("Invalid lhs type for op = any")

    if op == "between"
      if lhsType == "date"
        return 'daterange'
      if lhsType == "datetime"
        return 'datetimerange'
      else
        throw new Error("Invalid lhs type for op between")

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
      return "None"

    values = @getExprValues(expr)
    if values
      item = _.findWhere(values, id: literal)
      if item
        return item.name
      return "???"

    if literal == true
      return "True"
    if literal == false
      return "False"

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

    # Allow no rhs = no filter specified

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
