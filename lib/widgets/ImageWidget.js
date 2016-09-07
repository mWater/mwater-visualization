var ExprCompiler, H, ImageWidget, R, React, Widget, _, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

R = React.createElement;

_ = require('lodash');

ExprCompiler = require('mwater-expressions').ExprCompiler;

injectTableAlias = require('mwater-expressions').injectTableAlias;

Widget = require('./Widget');

module.exports = ImageWidget = (function(superClass) {
  extend(ImageWidget, superClass);

  function ImageWidget() {
    return ImageWidget.__super__.constructor.apply(this, arguments);
  }

  ImageWidget.prototype.createViewElement = function(options) {
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

  ImageWidget.prototype.getData = function(design, schema, dataSource, filters, callback) {
    var exprCompiler, imageExpr, query, table, whereClauses;
    if (!design.expr) {
      return callback(null);
    }
    table = design.expr.table;
    exprCompiler = new ExprCompiler(schema);
    imageExpr = exprCompiler.compileExpr({
      expr: design.expr,
      tableAlias: "main"
    });
    query = {
      distinct: true,
      selects: [
        {
          type: "select",
          expr: imageExpr,
          alias: "value"
        }
      ],
      from: {
        type: "table",
        table: table,
        alias: "main"
      },
      limit: 2
    };
    filters = _.where(filters || [], {
      table: table
    });
    whereClauses = _.map(filters, function(f) {
      return injectTableAlias(f.jsonql, "main");
    });
    whereClauses.push({
      type: "op",
      op: "is not null",
      exprs: [imageExpr]
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
        if (error) {
          return callback(error);
        } else {
          if (rows.length !== 1) {
            return callback(null, null);
          } else {
            return callback(null, rows[0].value);
          }
        }
      };
    })(this));
  };

  ImageWidget.prototype.isAutoHeight = function() {
    return false;
  };

  return ImageWidget;

})(Widget);
