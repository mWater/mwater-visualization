
module.exports = class DesignCompiler 
  constructor: (schema) ->
    @schema = schema

  compileExpr: (options) ->
    expr = options.expr

    switch expr.type 
      when "field"
        return @compileFieldExpr(options)
      when "scalar"
        return @compileScalarExpr(options)

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


    # TODO where  

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
          orderBy = [{ type: "field", tableAlias: exprBaseTableAlias, column: ordering }]
        when "sum", "count", "avg", "max", "min", "stdev", "stdevp"
          scalarExpr = { type: "op", op: expr.aggrId, exprs: [scalarExpr] }
        else
          throw new Error("Unknown aggregation #{expr.aggrId}")

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
