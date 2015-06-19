
# Compiles expressions to JsonQL
module.exports = class ExpressionCompiler 
  constructor: (schema) ->
    @schema = schema

  # Compile an expression. Pass expr and tableAlias
  compileExpr: (options) =>
    expr = options.expr

    switch expr.type 
      when "field"
        return @compileFieldExpr(options)
      when "scalar"
        return @compileScalarExpr(options)
      when "comparison"
        return @compileComparisonExpr(options)
      when "logical"
        return @compileLogicalExpr(options)
      when "literal"
        return { type: "literal", value: expr.value }
      else
        throw new Error("Expr type #{expr.type} not supported")

  compileFieldExpr: (options) ->
    expr = options.expr

    return {
      type: "field"
      tableAlias: options.tableAlias
      column: expr.column
    }

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
          { type: "field", tableAlias: "j1", column: join.toColumn }
          { type: "field", tableAlias: tableAlias, column: join.fromColumn }
        ]
       }

      from = {
        type: "table"
        table: join.toTable
        alias: "j1"
      }

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
          right: { type: "table", table: join.toTable, alias: "j#{i+1}" }
          kind: "left"
          on: { 
            type: "op"
            op: join.op
            exprs: [
              { type: "field", tableAlias: "j#{i}", column: join.fromColumn }
              { type: "field", tableAlias: "j#{i+1}", column: join.toColumn }
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
          orderBy = [{ expr: { type: "field", tableAlias: tableAlias, column: ordering }, direction: "desc" }]
        when "sum", "count", "avg", "max", "min", "stdev", "stdevp"
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

