var ExprCleaner, ExprCompiler, H, R, React, TextWidget, Widget, _, async, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

_ = require('lodash');

async = require('async');

ExprCompiler = require('mwater-expressions').ExprCompiler;

ExprCleaner = require('mwater-expressions').ExprCleaner;

injectTableAlias = require('mwater-expressions').injectTableAlias;

Widget = require('../Widget');

module.exports = TextWidget = (function(superClass) {
  extend(TextWidget, superClass);

  function TextWidget() {
    return TextWidget.__super__.constructor.apply(this, arguments);
  }

  TextWidget.prototype.createViewElement = function(options) {
    var TextWidgetComponent;
    TextWidgetComponent = require('./TextWidgetComponent');
    return R(TextWidgetComponent, {
      schema: options.schema,
      dataSource: options.dataSource,
      widgetDataSource: options.widgetDataSource,
      filters: options.filters,
      design: options.design,
      onDesignChange: options.onDesignChange,
      width: options.width,
      height: options.height,
      standardWidth: options.standardWidth,
      singleRowTable: options.singleRowTable,
      namedStrings: options.namedStrings
    });
  };

  TextWidget.prototype.getData = function(design, schema, dataSource, filters, callback) {
    var evalExprItem, exprValues;
    evalExprItem = (function(_this) {
      return function(exprItem, cb) {
        var expr, exprCleaner, exprCompiler, query, relevantFilters, table, whereClauses;
        if (!exprItem.expr) {
          return cb(null);
        }
        table = exprItem.expr.table;
        exprCompiler = new ExprCompiler(schema);
        exprCleaner = new ExprCleaner(schema);
        expr = exprCleaner.cleanExpr(exprItem.expr, {
          aggrStatuses: ["individual", "literal", "aggregate"]
        });
        if (table) {
          relevantFilters = _.where(filters || [], {
            table: table
          });
          whereClauses = _.map(relevantFilters, function(f) {
            return injectTableAlias(f.jsonql, "main");
          });
        } else {
          whereClauses = [];
        }
        if ((expr != null ? expr.op : void 0) === 'sum where') {
          whereClauses.push(exprCompiler.compileExpr({
            expr: expr.exprs[1],
            tableAlias: "main"
          }));
          expr = {
            type: "op",
            table: expr.table,
            op: "sum",
            exprs: [expr.exprs[0]]
          };
        } else if ((expr != null ? expr.op : void 0) === 'count where') {
          whereClauses.push(exprCompiler.compileExpr({
            expr: expr.exprs[0],
            tableAlias: "main"
          }));
          expr = {
            type: "op",
            table: expr.table,
            op: "count",
            exprs: []
          };
        }
        query = {
          distinct: true,
          selects: [
            {
              type: "select",
              expr: exprCompiler.compileExpr({
                expr: expr,
                tableAlias: "main"
              }),
              alias: "value"
            }
          ],
          from: table ? exprCompiler.compileTable(table, "main") : void 0,
          limit: 2
        };
        whereClauses = _.compact(whereClauses);
        if (whereClauses.length > 1) {
          query.where = {
            type: "op",
            op: "and",
            exprs: whereClauses
          };
        } else {
          query.where = whereClauses[0];
        }
        return dataSource.performQuery(query, function(error, rows) {
          if (error) {
            return cb(error);
          } else {
            if (rows.length !== 1) {
              return cb(null, null);
            } else {
              return cb(null, rows[0].value);
            }
          }
        });
      };
    })(this);
    exprValues = {};
    return async.each(this.getExprItems(design.items), (function(_this) {
      return function(exprItem, cb) {
        return evalExprItem(exprItem, function(error, value) {
          if (error) {
            return cb(error);
          } else {
            exprValues[exprItem.id] = value;
            return cb(null);
          }
        });
      };
    })(this), (function(_this) {
      return function(error) {
        if (error) {
          return callback(error);
        } else {
          return callback(null, exprValues);
        }
      };
    })(this));
  };

  TextWidget.prototype.isAutoHeight = function() {
    return true;
  };

  TextWidget.prototype.getExprItems = function(items) {
    var exprItems, i, item, len, ref;
    exprItems = [];
    ref = items || [];
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      if (item.type === "expr") {
        exprItems.push(item);
      }
      if (item.items) {
        exprItems = exprItems.concat(this.getExprItems(item.items));
      }
    }
    return exprItems;
  };

  TextWidget.prototype.getFilterableTables = function(design, schema) {
    var exprItems, filterableTables;
    exprItems = this.getExprItems(design.items);
    filterableTables = _.map(exprItems, function(exprItem) {
      var ref;
      return (ref = exprItem.expr) != null ? ref.table : void 0;
    });
    filterableTables = _.uniq(_.compact(filterableTables));
    return filterableTables;
  };

  return TextWidget;

})(Widget);
