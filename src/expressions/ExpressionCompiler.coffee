# Compiles expressions to JsonQL
module.exports = class ExpressionCompiler 
  constructor: (schema) ->
    @schema = schema

  # Compile an expression. Pass expr and tableAlias.
  compileExpr: (options) =>
    expr = options.expr

    # Handle null
    if not expr
      return null

    switch expr.type 
      when "field"
        compiledExpr =  @compileFieldExpr(options)
      when "scalar"
        compiledExpr =  @compileScalarExpr(options)
      when "comparison"
        compiledExpr =  @compileComparisonExpr(options)
      when "logical"
        compiledExpr =  @compileLogicalExpr(options)
      when "literal"
        compiledExpr =  { type: "literal", value: expr.value }
      when "count"
        compiledExpr = null
      else
        throw new Error("Expr type #{expr.type} not supported")

    return compiledExpr

  compileFieldExpr: (options) ->
    expr = options.expr

    # Check if column has custom jsonql
    column = @schema.getColumn(expr.table, expr.column)
    if not column
      throw new Error("Column #{expr.table}.#{expr.column} not found")

    # If column has custom jsonql, use that instead of id
    return @compileColumnRef(column.jsonql or column.id, options.tableAlias)

  compileScalarExpr: (options) ->
    expr = options.expr

    where = null
    from = null
    orderBy = null
    limit = null

    # Perform joins
    table = expr.table
    tableAlias = options.tableAlias

    # First join is in where clause
    if expr.joins and expr.joins.length > 0
      join = @schema.getColumn(expr.table, expr.joins[0]).join

      where = { 
        type: "op", op: join.op
        exprs: [
          @compileColumnRef(join.toColumn, "j1")
          @compileColumnRef(join.fromColumn, tableAlias)
        ]
       }

      from = @compileTable(join.toTable, "j1")

      # We are now at j1, which is the to of the first join
      table = join.toTable
      tableAlias = "j1"

    # Perform remaining joins
    if expr.joins.length > 1
      for i in [1...expr.joins.length]
        join = @schema.getColumn(table, expr.joins[i]).join
        from = {
          type: "join"
          left: from
          right: @compileTable(join.toTable, "j#{i+1}")
          kind: "left"
          on: { 
            type: "op"
            op: join.op
            exprs: [
              @compileColumnRef(join.fromColumn, "j#{i}")
              @compileColumnRef(join.toColumn, "j#{i+1}")
            ]
          }
        }

        # We are now at jn
        table = join.toTable
        tableAlias = "j#{i+1}"

    # Compile where clause
    if expr.where
      extraWhere = @compileExpr(expr: expr.where, tableAlias: tableAlias)

      # Add to existing 
      if where
        where = { type: "op", op: "and", exprs: [where, extraWhere]}
      else
        where = extraWhere

    scalarExpr = @compileExpr(expr: expr.expr, tableAlias: tableAlias)
    
    # Aggregate
    if expr.aggr
      switch expr.aggr
        when "last"
          # Get ordering
          ordering = @schema.getTable(table).ordering
          if not ordering
            throw new Error("No ordering defined")

          # Limit
          limit = 1

          # order descending
          orderBy = [{ expr: @compileColumnRef(ordering, tableAlias),  direction: "desc" }]
        when "sum", "count", "avg", "max", "min", "stdev", "stdevp"
          # Don't include scalarExpr if null
          if not scalarExpr
            scalarExpr = { type: "op", op: expr.aggr, exprs: [] }
          else
            scalarExpr = { type: "op", op: expr.aggr, exprs: [scalarExpr] }
        else
          throw new Error("Unknown aggregation #{expr.aggr}")

    # If no where, from, orderBy or limit, just return expr for simplicity
    if not from and not where and not orderBy and not limit
      return scalarExpr

    # Create scalar
    scalar = {
      type: "scalar"
      expr: scalarExpr
    }

    if from
      scalar.from = from

    if where
      scalar.where = where

    if orderBy
      scalar.orderBy = orderBy

    if limit
      scalar.limit = limit

    return scalar


  compileComparisonExpr: (options) ->
    expr = options.expr

    exprs = [@compileExpr(expr: expr.lhs, tableAlias: options.tableAlias)]
    if expr.rhs
      exprs.push(@compileExpr(expr: expr.rhs, tableAlias: options.tableAlias))

    # Handle special cases 
    switch expr.op
      when '= true'
        return { type: "op", op: "=", exprs: [exprs[0], { type: "literal", value: true }]}
      when '= false'
        return { type: "op", op: "=", exprs: [exprs[0], { type: "literal", value: false }]}
      when '= any'
        return { type: "op", op: "=", modifier: "any", exprs: exprs }
      else
        return { 
          type: "op"
          op: expr.op
          exprs: exprs
        }

  compileLogicalExpr: (options) ->
    expr = options.expr

    # Simplify
    if expr.exprs.length == 1
      return @compileExpr(expr: expr.exprs[0], tableAlias: options.tableAlias)

    if expr.exprs.length == 0
      return null

    return { 
      type: "op"
      op: expr.op
      exprs: _.map(expr.exprs, (e) => @compileExpr(expr: e, tableAlias: options.tableAlias))
    }

  # Compiles a reference to a column or a JsonQL expression
  # If parameter is a string, create a simple field expression
  # If parameter is an object, substitute tableAlias for `{alias}`
  compileColumnRef: (column, tableAlias) ->
    if _.isString(column)
      return { type: "field", tableAlias: tableAlias, column: column }

    return @substituteTableAlias(column, tableAlias)

  # Recursively substitute table alias tableAlias for `{alias}` 
  substituteTableAlias: (jsonql, tableAlias) ->
    # Handle arrays
    if _.isArray(jsonql)
      return _.map(jsonql, (item) => @substituteTableAlias(item, tableAlias))

    # Handle non-objects by leaving alone
    if not _.isObject(jsonql)
      return jsonql

    # Handle field
    if jsonql.type == "field" and jsonql.tableAlias == "{alias}"
      return _.extend(jsonql, tableAlias: tableAlias)

    # Recurse object keys
    return _.mapValues(jsonql, (value) => @substituteTableAlias(value, tableAlias))

  # Compiles a table, substituting with custom jsonql if required
  compileTable: (tableId, alias) ->
    table = @schema.getTable(tableId)
    if not table.jsonql
      return { type: "table", table: tableId, alias: alias }
    else
      return { type: "subquery", query: table.jsonql, alias: alias }
