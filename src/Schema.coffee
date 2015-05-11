
# Schema for a database
module.exports = class Schema
  constructor: ->
    @tables = []
    @joins = []

  # Add table with id, name, desc, icon
  addTable: (options) ->
    table = _.pick(options, "id", "name", "desc", "icon", "ordering")
    table.columns = []
    @tables.push(table)

  getTables: -> @tables

  getTable: (tableId) -> _.findWhere(@tables, { id: tableId })

  addColumn: (tableId, options) ->
    table = @getTable(tableId)
    table.columns.push(_.pick(options, "id", "primary", "name", "desc", "type", "values"))

  getColumns: (tableId) ->
    table = @getTable(tableId)
    return table.columns

  getColumn: (tableId, columnId) ->
    table = @getTable(tableId)
    return _.findWhere(table.columns, { id: columnId })

  # id, name, fromTableId, fromColumnId, toTableId, toColumnId, op, oneToMany
  addJoin: (options) ->
    @joins.push(_.pick(options, "id", "name", "fromTableId", "fromColumnId", "toTableId", "toColumnId", "op", "oneToMany"))

  getJoins: -> @joins

  getJoin: (joinId) -> _.findWhere(@joins, { id: joinId })

  # Pass baseTableId and joinIds (optional)
  getJoinExprTree: (options) ->
    # Get base table
    baseTable = @getTable(options.baseTableId)

    tree = []
    joinIds = options.joinIds or []
    
    # Add columns
    for col in baseTable.columns
      # Skip primary key if no joins
      if joinIds.length == 0 and col.primary
        continue 

      # Skip uuid fields unless primary
      if col.type == "uuid" and not col.primary
        continue

      if col.primary
        name = "Number of #{baseTable.name}"
        desc = ""
      else 
        name = col.name
        desc = col.desc

      # Filter by type
      if options.types and col.type not in options.types
        continue

      tree.push({
        id: col.id
        name: name
        desc: col.desc
        type: col.type
        value: {
          joinIds: joinIds
          expr: { type: "field", tableId: baseTable.id, columnId: col.id }
          }
        })

    # Add joins
    for join in @joins
      do (join) =>
        if join.fromTableId == baseTable.id
          tree.push({
            id: join.id
            name: join.name
            desc: join.desc
            value: {
              joinIds: joinIds
              }
            getChildren: =>
              return @getJoinExprTree({ baseTableId: join.toTableId, joinIds: joinIds.concat([join.id]) })
            })
    return tree

  # Gets the type of an expression
  getExprType: (expr) ->
    if not expr?
      return null

    switch expr.type
      when "field"
        column = @getColumn(expr.tableId, expr.columnId)
        return column.type
      when "scalar"
        return @getExprType(expr.expr)
      when "text", "integer", "boolean", "decimal"
        return expr.type
      else
        throw new Error("Not implemented")

  # Gets the table of an expression (null if none)
  getExprTable: (expr) ->
    switch expr.type
      when "field"
        return @getTable(expr.tableId)
      else
        throw new Error("Not implemented")

  # Gets available aggregations [{id, name}]
  getAggrs: (expr) ->
    aggrs = []

    type = @getExprType(expr)
    
    table = @getExprTable(expr)
    if table and table.ordering
      aggrs.push({ id: "last", name: "Latest", type: type })

    switch type
      when "integer", "decimal"
        aggrs.push({ id: "sum", name: "Sum", type: type })
        aggrs.push({ id: "avg", name: "Average", type: "decimal" })

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
        return @getColumn(expr.tableId, expr.columnId).name
      else
        throw new Error("Unsupported type #{expr.type}")

  summarizeScalarExpr: (expr) ->
    str = @summarizeExpr(expr.expr)

    # Add aggr
    if expr.aggr
      str = _.findWhere(@getAggrs(expr.expr), { id: expr.aggr }).name + " " + str

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
      column = @getColumn(expr.tableId, expr.columnId)
      return column.values
    if expr.type == "scalar"
      return @getExprValues(expr.expr)