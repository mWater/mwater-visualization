"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var ExprCompiler, ExprUtils, PopupFilterJoinsUtils;
ExprCompiler = require('mwater-expressions').ExprCompiler;
ExprUtils = require('mwater-expressions').ExprUtils; // Utilities for popup filter joins. See PopupFilterJoins.md for further explanation.

module.exports = PopupFilterJoinsUtils = /*#__PURE__*/function () {
  function PopupFilterJoinsUtils() {
    (0, _classCallCheck2["default"])(this, PopupFilterJoinsUtils);
  }

  (0, _createClass2["default"])(PopupFilterJoinsUtils, null, [{
    key: "createPopupFilters",
    value: function createPopupFilters(popupFilterJoins, schema, layerTable, rowId) {
      var useWithin = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      var expr, exprCompiler, exprType, exprUtils, filter, filterExpr, filters, table;
      exprUtils = new ExprUtils(schema);
      exprCompiler = new ExprCompiler(schema);
      filters = []; // For each filter join

      for (table in popupFilterJoins) {
        expr = popupFilterJoins[table]; // Determine type of expression (id or id[])

        exprType = exprUtils.getExprType(expr); // Handle useWithin

        if (useWithin) {
          // For simple id type
          if (exprType === "id") {
            // Compile filter
            filterExpr = {
              type: "op",
              op: "within",
              table: table,
              exprs: [expr, {
                type: "literal",
                idTable: exprUtils.getExprIdTable(expr),
                valueType: "id",
                value: rowId
              }]
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
          // For simple id type
          // id[] not supported
          // else if exprType == "id[]"
          //   # Compile filter
          //   filterExpr = {
          //     type: "op"
          //     op: "within any"
          //     table: table
          //     exprs: [
          //       expr
          //       { type: "literal", idTable: exprUtils.getExprIdTable(expr), valueType: "id", value: ev.data.id }
          //     ]
          //   }
          //   filters.push(exprCompiler.compileExpr(expr: filterExpr, tableAlias: "{alias}"))
          if (exprType === "id") {
            filter = {
              table: table,
              jsonql: {
                type: "op",
                op: "=",
                exprs: [exprCompiler.compileExpr({
                  expr: expr,
                  tableAlias: "{alias}"
                }), {
                  type: "literal",
                  value: rowId
                }]
              }
            };
            filters.push(filter);
          } else if (exprType === "id[]") {
            filter = {
              table: table,
              jsonql: {
                type: "op",
                op: "@>",
                exprs: [exprCompiler.compileExpr({
                  expr: expr,
                  tableAlias: "{alias}"
                }), {
                  type: "op",
                  op: "::jsonb",
                  exprs: [{
                    type: "literal",
                    value: JSON.stringify([rowId])
                  }]
                }]
              }
            };
            filters.push(filter);
          }
        }
      }

      return filters;
    } // Create default popup filter joins where the join is just the id (not used for choropleth since that needs to join to admin_regions)

  }, {
    key: "createDefaultPopupFilterJoins",
    value: function createDefaultPopupFilterJoins(table) {
      var popupFilterJoins;
      popupFilterJoins = {}; // Return id of row for a simple match

      popupFilterJoins[table] = {
        table: table,
        type: "id"
      };
      return popupFilterJoins;
    }
  }]);
  return PopupFilterJoinsUtils;
}();