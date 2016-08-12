var ExprCompiler, H, R, React, TextWidget, Widget, _, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

_ = require('lodash');

ExprCompiler = require('mwater-expressions').ExprCompiler;

injectTableAlias = require('mwater-expressions').injectTableAlias;

Widget = require('./Widget');

module.exports = TextWidget = (function(superClass) {
  extend(TextWidget, superClass);

  function TextWidget() {
    return TextWidget.__super__.constructor.apply(this, arguments);
  }

  TextWidget.prototype.createViewElement = function(options) {
    var ImageWidgetComponent;
    ImageWidgetComponent = require('./ImageWidgetComponent');
    return R(ImageWidgetComponent, {
      schema: options.schema,
      dataSource: options.dataSource,
      widgetDataSource: options.widgetDataSource,
      filters: options.filters,
      design: options.design,
      onDesignChange: options.onDesignChange,
      width: options.width,
      height: options.height,
      standardWidth: options.standardWidth,
      singleRowTable: options.singleRowTable
    });
  };

  TextWidget.prototype.getData = function(design, schema, dataSource, filters, callback) {
    var exprCompiler, query, table, whereClauses;
    table = design.expr.table;
    exprCompiler = new ExprCompiler(schema);
    query = {
      selects: [
        {
          type: "select",
          expr: exprCompiler.compileExpr({
            expr: design.expr,
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
    return dataSource.performQuery(query, (function(_this) {
      return function(error, rows) {
        var ref;
        if (error) {
          return callback(error);
        } else {
          return callback(null, (ref = rows[0]) != null ? ref.value : void 0);
        }
      };
    })(this));
  };

  TextWidget.prototype.isAutoHeight = function() {
    return false;
  };

  return TextWidget;

})(Widget);
