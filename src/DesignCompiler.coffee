
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

    # TODO perform joins

    exprBaseTableId = options.baseTableId
    exprBaseTableAlias = options.baseTableAlias

    # TODO where  
    # TODO aggr

    # Create scalar
    return {
      type: "scalar"
      expr: @compileExpr(expr: expr.expr, baseTableId: exprBaseTableId, baseTableAlias: exprBaseTableAlias)
    }
