ExprCompiler = require('mwater-expressions').ExprCompiler
ExprUtils = require('mwater-expressions').ExprUtils

# Utilities for popup filter joins. See PopupFilterJoins.md for further explanation.
module.exports = class PopupFilterJoinsUtils
  @createPopupFilters: (popupFilterJoins, schema, layerTable, rowId, useWithin = false) ->
    exprUtils = new ExprUtils(schema)
    exprCompiler = new ExprCompiler(schema)

    filters = []

    # For each filter join
    for table, expr of popupFilterJoins
      # Determine type of expression (id or id[])
      exprType = exprUtils.getExprType(expr)

      # Handle useWithin
      if useWithin
        # For simple id type
        if exprType == "id"
          # Compile filter
          filterExpr = {
            type: "op"
            op: "within"
            table: table
            exprs: [
              expr
              { type: "literal", idTable: exprUtils.getExprIdTable(expr), valueType: "id", value: rowId }
            ]
          }
          filters.push({ table: table, jsonql: exprCompiler.compileExpr(expr: filterExpr, tableAlias: "{alias}") })
        # id[] not supported
        # else if exprType == "id[]"
        #   # Compile filter
        #   filterExpr = {
        #     type: "op"
        #     op: "within any"
        #     table: table
        #     exprs: [
        #       expr
        #       { type: "literal", idTable: exprUtils.getExprIdTable(expr), valueType: "id", value: ev.data.id }
        #     ]
        #   }
        #   filters.push(exprCompiler.compileExpr(expr: filterExpr, tableAlias: "{alias}"))
      else
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

  # Create default popup filter joins where the join is just the id (not used for choropleth since that needs to join to admin_regions)
  @createDefaultPopupFilterJoins: (table) ->
    popupFilterJoins = {}

    # Return id of row for a simple match
    popupFilterJoins[table] = { table: table, type: "id" }

    return popupFilterJoins