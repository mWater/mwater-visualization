
# Understands expressions. Contains methods to build an expression of any type. 
module.exports = class ExpressionBuilder
  constructor: (schema) ->
    @schema = schema

  # Gets the type of an expression
  getExprType: (expr) ->
    if not expr?
      return null

    switch expr.type
      when "field"
        column = @schema.getColumn(expr.tableId, expr.columnId)
        return column.type
      when "scalar"
        if expr.aggrId == "count"
          return "integer"
        return @getExprType(expr.expr)
      when "text", "integer", "boolean", "decimal", "enum", "date"
        return expr.type
      else
        throw new Error("Not implemented")

  # Gets the table of an expression (null if none)
  getExprTable: (expr) ->
    switch expr.type
      when "field"
        return @schema.getTable(expr.tableId)
      else
        throw new Error("Not implemented")

  # Gets available aggregations [{id, name}]
  getAggrs: (expr) ->
    aggrs = []

    type = @getExprType(expr)
    
    table = @getExprTable(expr)
    if table and table.ordering and type != "uuid"
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

  # Determines if aggregation is needed for joins
  isAggrNeeded: (joinIds) ->
    return _.any(joinIds, (j) => @getJoin(j).oneToMany)

  # Summarizes expression as text
  summarizeExpr: (expr) ->
    if not expr
      return "None"
    switch expr.type
      when "scalar"
        return @summarizeScalarExpr(expr)
      when "field"
        return @schema.getColumn(expr.tableId, expr.columnId).name
      else
        throw new Error("Unsupported type #{expr.type}")

  summarizeScalarExpr: (expr) ->
    str = @summarizeExpr(expr.expr)

    # Handle case of primary key
    if @getExprType(expr.expr) == "uuid"
      str = "Number"
    # Add aggr
    else if expr.aggrId
      str = _.findWhere(@getAggrs(expr.expr), { id: expr.aggrId }).name + " " + str

    # Add ofs (reverse joins)
    for joinId in expr.joinIds.slice().reverse()
      str = str + " of " + @getJoin(joinId).name

    return str

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

  getComparisonRhsType: (lhsType, op) ->
    if op in ['= true', '= false', 'is null', 'is not null']
      return null

    return lhsType

  getExprValues: (expr) ->
    if expr.type == "field"
      column = @schema.getColumn(expr.tableId, expr.columnId)
      return column.values
    if expr.type == "scalar"
      return @getExprValues(expr.expr)  