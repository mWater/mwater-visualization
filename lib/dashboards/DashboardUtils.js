"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var DashboardUtils, ExprCleaner, ExprCompiler, ExprUtils, LayoutManager, WidgetFactory, _;

_ = require('lodash');
LayoutManager = require('../layouts/LayoutManager');
WidgetFactory = require('../widgets/WidgetFactory');
ExprCompiler = require('mwater-expressions').ExprCompiler;
ExprCleaner = require('mwater-expressions').ExprCleaner;
ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = DashboardUtils =
/*#__PURE__*/
function () {
  function DashboardUtils() {
    (0, _classCallCheck2["default"])(this, DashboardUtils);
  }

  (0, _createClass2["default"])(DashboardUtils, null, [{
    key: "getFilterableTables",
    // Gets filterable tables for a dashboard
    value: function getFilterableTables(design, schema) {
      var filterableTables, i, layoutManager, len, ref, widget, widgetItem;
      layoutManager = LayoutManager.createLayoutManager(design.layout); // Get filterable tables

      filterableTables = [];
      ref = layoutManager.getAllWidgets(design.items);

      for (i = 0, len = ref.length; i < len; i++) {
        widgetItem = ref[i]; // Create widget

        widget = WidgetFactory.createWidget(widgetItem.type); // Get filterable tables

        filterableTables = filterableTables.concat(widget.getFilterableTables(widgetItem.design, schema));
      } // Remove non-existant tables


      filterableTables = _.filter(_.uniq(filterableTables), function (table) {
        return schema.getTable(table);
      });
      return filterableTables;
    } // Get filters from props filters combined with dashboard filters

  }, {
    key: "getCompiledFilters",
    value: function getCompiledFilters(design, schema, filterableTables) {
      var column, columnExpr, compiledFilters, expr, exprCleaner, exprCompiler, exprUtils, filter, i, j, jsonql, len, len1, ref, ref1, table;
      exprCompiler = new ExprCompiler(schema);
      exprCleaner = new ExprCleaner(schema);
      exprUtils = new ExprUtils(schema);
      compiledFilters = [];
      ref = design.filters || {}; // Compile filters to JsonQL expected by widgets

      for (table in ref) {
        expr = ref[table]; // Clean expression first TODO remove this when dashboards are properly cleaned before being rendered

        expr = exprCleaner.cleanExpr(expr, {
          table: table
        });
        jsonql = exprCompiler.compileExpr({
          expr: expr,
          tableAlias: "{alias}"
        });

        if (jsonql) {
          compiledFilters.push({
            table: table,
            jsonql: jsonql
          });
        }
      }

      ref1 = design.globalFilters || []; // Add global filters

      for (i = 0, len = ref1.length; i < len; i++) {
        filter = ref1[i];

        for (j = 0, len1 = filterableTables.length; j < len1; j++) {
          table = filterableTables[j]; // Check if exists and is correct type

          column = schema.getColumn(table, filter.columnId);

          if (!column) {
            continue;
          }

          columnExpr = {
            type: "field",
            table: table,
            column: column.id
          };

          if (exprUtils.getExprType(columnExpr) !== filter.columnType) {
            continue;
          } // Create expr


          expr = {
            type: "op",
            op: filter.op,
            table: table,
            exprs: [columnExpr].concat(filter.exprs)
          }; // Clean expr

          expr = exprCleaner.cleanExpr(expr, {
            table: table
          });
          jsonql = exprCompiler.compileExpr({
            expr: expr,
            tableAlias: "{alias}"
          });

          if (jsonql) {
            compiledFilters.push({
              table: table,
              jsonql: jsonql
            });
          }
        }
      }

      return compiledFilters;
    }
  }]);
  return DashboardUtils;
}();