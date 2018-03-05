var DashboardUtils, ExprCleaner, ExprCompiler, ExprUtils, LayoutManager, WidgetFactory, _;

_ = require('lodash');

LayoutManager = require('../layouts/LayoutManager');

WidgetFactory = require('../widgets/WidgetFactory');

ExprCompiler = require('mwater-expressions').ExprCompiler;

ExprCleaner = require('mwater-expressions').ExprCleaner;

ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = DashboardUtils = (function() {
  function DashboardUtils() {}

  DashboardUtils.getFilterableTables = function(design, schema) {
    var filterableTables, i, layoutManager, len, ref, widget, widgetItem;
    layoutManager = LayoutManager.createLayoutManager(design.layout);
    filterableTables = [];
    ref = layoutManager.getAllWidgets(design.items);
    for (i = 0, len = ref.length; i < len; i++) {
      widgetItem = ref[i];
      widget = WidgetFactory.createWidget(widgetItem.type);
      filterableTables = filterableTables.concat(widget.getFilterableTables(widgetItem.design, schema));
    }
    filterableTables = _.filter(_.uniq(filterableTables), (function(_this) {
      return function(table) {
        return schema.getTable(table);
      };
    })(this));
    return filterableTables;
  };

  DashboardUtils.getCompiledFilters = function(design, schema, filterableTables) {
    var column, columnExpr, compiledFilters, expr, exprCleaner, exprCompiler, exprUtils, filter, i, j, jsonql, len, len1, ref, ref1, table;
    exprCompiler = new ExprCompiler(schema);
    exprCleaner = new ExprCleaner(schema);
    exprUtils = new ExprUtils(schema);
    compiledFilters = [];
    ref = design.filters || {};
    for (table in ref) {
      expr = ref[table];
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
    ref1 = design.globalFilters || [];
    for (i = 0, len = ref1.length; i < len; i++) {
      filter = ref1[i];
      for (j = 0, len1 = filterableTables.length; j < len1; j++) {
        table = filterableTables[j];
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
        }
        expr = {
          type: "op",
          op: filter.op,
          table: table,
          exprs: [columnExpr].concat(filter.exprs)
        };
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
  };

  return DashboardUtils;

})();
