
module.exports = class DesignCompiler 
  constructor: (schema) ->
    @schema = schema

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
      when "text", "integer", "decimal", "boolean", "enum"
        return { type: "literal", value: expr.value }
      else
        throw new Error("Expr type #{expr.type} not supported")

  compileComparisonExpr: (options) ->
    expr = options.expr

    exprs = [@compileExpr(expr: expr.lhs, baseTableId: options.baseTableId, baseTableAlias: options.baseTableAlias)]
    if expr.rhs
      exprs.push(@compileExpr(expr: expr.rhs, baseTableId: options.baseTableId, baseTableAlias: options.baseTableAlias))

    # Handle special cases 
    if expr.op == '= true'
      return { type: "op", op: "=", exprs: [exprs[0], { type: "literal", value: true }]}
    else if expr.op == '= false'
      return { type: "op", op: "=", exprs: [exprs[0], { type: "literal", value: false }]}

    return { 
      type: "op"
      op: expr.op
      exprs: exprs
    }

  compileLogicalExpr: (options) ->
    expr = options.expr

    # Simplify
    if expr.exprs.length == 1
      return @compileExpr(expr: expr.exprs[0], baseTableId: options.baseTableId, baseTableAlias: options.baseTableAlias)

    if expr.exprs.length == 0
      return null

    return { 
      type: "op"
      op: expr.op
      exprs: _.map(expr.exprs, (e) => @compileExpr(expr: e, baseTableId: options.baseTableId, baseTableAlias: options.baseTableAlias))
    }

  compileFieldExpr: (options) ->
    expr = options.expr

    if options.baseTableId != expr.tableId
      throw new Error("Table mismatch")

    return {
      type: "field"
      tableAlias: options.baseTableAlias
      column: expr.columnId
    }

  compileScalarExpr: (options) ->
    expr = options.expr

    where = null
    from = null
    orderBy = null
    limit = null

    exprBaseTableId = options.baseTableId
    exprBaseTableAlias = options.baseTableAlias

    # Perform joins
    # First join is in where clause
    if expr.joinIds and expr.joinIds.length > 0
      join = @schema.getJoin(expr.joinIds[0])

      where = { 
        type: "op", op: join.op
        exprs: [
          { type: "field", tableAlias: "j1", column: join.toColumnId }
          { type: "field", tableAlias: options.baseTableAlias, column: join.fromColumnId }
        ]
       }

      from = {
        type: "table"
        table: join.toTableId
        alias: "j1"
      }

      # We are now at j1, which is the to of the first join
      exprBaseTableId = join.toTableId
      exprBaseTableAlias = "j1"

    # Perform remaining joins
    if expr.joinIds.length > 1
      for i in [1...expr.joinIds.length]
        join = @schema.getJoin(expr.joinIds[i])
        from = {
          type: "join"
          left: from
          right: { type: "table", table: join.toTableId, alias: "j#{i+1}" }
          kind: "left"
          on: { 
            type: "op"
            op: "="
            exprs: [
              { type: "field", tableAlias: "j#{i}", column: join.fromColumnId }
              { type: "field", tableAlias: "j#{i+1}", column: join.toColumnId }
            ]
          }
        }

        # We are now at jn
        exprBaseTableId = join.toTableId
        exprBaseTableAlias = "j#{i+1}"

    # Compile where clause
    if expr.where
      extraWhere = @compileExpr(expr: expr.where, baseTableId: exprBaseTableId, baseTableAlias: exprBaseTableAlias)

      # Add to existing 
      if where
        where = { type: "op", op: "and", exprs: [where, extraWhere]}
      else
        where = extraWhere

    scalarExpr = @compileExpr(expr: expr.expr, baseTableId: exprBaseTableId, baseTableAlias: exprBaseTableAlias)
    
    # Aggregate
    if expr.aggrId
      switch expr.aggrId
        when "latest"
          # Get ordering
          ordering = @schema.getTable(exprBaseTableId).ordering
          if not ordering
            throw new Error("No ordering defined")

          # Limit
          limit = 1

          # order descending
          orderBy = [{ expr: { type: "field", tableAlias: exprBaseTableAlias, column: ordering }, direction: "desc" }]
        when "sum", "count", "avg", "max", "min", "stdev", "stdevp"
          scalarExpr = { type: "op", op: expr.aggrId, exprs: [scalarExpr] }
        else
          throw new Error("Unknown aggregation #{expr.aggrId}")

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
