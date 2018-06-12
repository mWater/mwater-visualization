var ExprCompiler, ExprUtils, PopupFilterJoinsUtils;

ExprCompiler = require('mwater-expressions').ExprCompiler;

ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = PopupFilterJoinsUtils = (function() {
  function PopupFilterJoinsUtils() {}

  PopupFilterJoinsUtils.createPopupFilters = function(popupFilterJoins, schema, layerTable, rowId, useWithin) {
    var expr, exprCompiler, exprType, exprUtils, filter, filterExpr, filters, table;
    if (useWithin == null) {
      useWithin = false;
    }
    exprUtils = new ExprUtils(schema);
    exprCompiler = new ExprCompiler(schema);
    filters = [];
    for (table in popupFilterJoins) {
      expr = popupFilterJoins[table];
      exprType = exprUtils.getExprType(expr);
      if (useWithin) {
        if (exprType === "id") {
          filterExpr = {
            type: "op",
            op: "within",
            table: table,
            exprs: [
              expr, {
                type: "literal",
                idTable: exprUtils.getExprIdTable(expr),
                valueType: "id",
                value: rowId
              }
            ]
          };
          filters.push({
            table: table,
            jsonql: exprCompiler.compileExpr({
              expr: filterExpr,
              tableAlias: "{alias}"
            })
          });
        }
      } else {
        if (exprType === "id") {
          filter = {
            table: table,
            jsonql: {
              type: "op",
              op: "=",
              exprs: [
                exprCompiler.compileExpr({
                  expr: expr,
                  tableAlias: "{alias}"
                }), {
                  type: "literal",
                  value: rowId
                }
              ]
            }
          };
          filters.push(filter);
        } else if (exprType === "id[]") {
          filter = {
            table: table,
            jsonql: {
              type: "op",
              op: "@>",
              exprs: [
                exprCompiler.compileExpr({
                  expr: expr,
                  tableAlias: "{alias}"
                }), {
                  type: "op",
                  op: "::jsonb",
                  exprs: [
                    {
                      type: "literal",
                      value: JSON.stringify([rowId])
                    }
                  ]
                }
              ]
            }
          };
          filters.push(filter);
        }
      }
    }
    return filters;
  };

  PopupFilterJoinsUtils.createDefaultPopupFilterJoins = function(table) {
    var popupFilterJoins;
    popupFilterJoins = {};
    popupFilterJoins[table] = {
      table: table,
      type: "id"
    };
    return popupFilterJoins;
  };

  return PopupFilterJoinsUtils;

})();
