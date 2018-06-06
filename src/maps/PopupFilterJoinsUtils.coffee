ExprCompiler = require('mwater-expressions').ExprCompiler
ExprUtils = require('mwater-expressions').ExprUtils

# Utilities for popup filter joins. See PopupFilterJoins.md for further explanation.
module.exports = class PopupFilterJoinsUtils
  @createPopupFilters: (popupFilterJoins, schema, layerTable, rowId) ->
    exprUtils = new ExprUtils(schema)
    exprCompiler = new ExprCompiler(schema)

    filters = []

    # For each filter join
    for table, expr of popupFilterJoins
      # Determine type of expression (id or id[])
      exprType = exprUtils.getExprType(expr)

      # For simple id type
      if exprType == "id"
        filter = {
          table: table
          jsonql: { type: "op", op: "=", exprs: [
            exprCompiler.compileExpr(expr: expr, tableAlias: "{alias}")
            { type: "literal", value: rowId }
          ]}
        }
        filters.push(filter)
      else if exprType == "id[]"
        filter = {
          table: table
          jsonql: { type: "op", op: "@>", exprs: [
            exprCompiler.compileExpr(expr: expr, tableAlias: "{alias}")
            { type: "op", op: "::jsonb", exprs: [{ type: "literal", value: JSON.stringify([rowId]) }] }
          ]}
        }
        filters.push(filter)

    return filters

  @createDefaultPopupFilterJoins: (table) ->
    popupFilterJoins = {}

    # Return id of row for a simple match
    popupFilterJoins[table] = { table: table, type: "id" }

    return popupFilterJoins