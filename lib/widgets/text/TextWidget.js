var ExprCompiler, H, R, React, TextWidget, Widget, _, async, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

_ = require('lodash');

async = require('async');

ExprCompiler = require('mwater-expressions').ExprCompiler;

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
      standardWidth: options.standardWidth
    });
  };

  TextWidget.prototype.getData = function(design, schema, dataSource, filters, callback) {
    var evalExprItem, exprValues, getExprItems;
    getExprItems = function(items) {
      var exprItems, i, item, len, ref;
      exprItems = [];
      ref = items || [];
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        if (item.type === "expr") {
          exprItems.push(item);
        }
        if (item.items) {
          exprItems = exprItems.concat(getExprItems(item.items));
        }
      }
      return exprItems;
    };
    evalExprItem = (function(_this) {
      return function(exprItem, cb) {
        var exprCompiler, query, table, whereClauses;
        table = exprItem.expr.table;
        exprCompiler = new ExprCompiler(schema);
        query = {
          selects: [
            {
              type: "select",
              expr: exprCompiler.compileExpr({
                expr: exprItem.expr,
                tableAlias: "main"
              }),
              alias: "value"
            }
          ],
          from: {
            type: "table",
            table: table,
            alias: "main"
          },
          limit: 1
        };
        filters = _.where(filters || [], {
          table: table
        });
        whereClauses = _.map(filters, function(f) {
          return injectTableAlias(f.jsonql, "main");
        });
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
          var ref;
          if (error) {
            return cb(error);
          } else {
            return cb(null, (ref = rows[0]) != null ? ref.value : void 0);
          }
        });
      };
    })(this);
    exprValues = {};
    return async.each(getExprItems(design.items), (function(_this) {
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

  return TextWidget;

})(Widget);
