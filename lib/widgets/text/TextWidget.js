var ClickOutHandler, ExprCompiler, H, R, React, TextWidget, TextWidgetComponent, TextWidgetDesignerComponent, TextWidgetViewComponent, Widget, _, async, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

React = require('react');

H = React.DOM;

R = React.createElement;

_ = require('lodash');

async = require('async');

ExprCompiler = require('mwater-expressions').ExprCompiler;

injectTableAlias = require('mwater-expressions').injectTableAlias;

ClickOutHandler = require('react-onclickout');

Widget = require('../Widget');

TextWidgetViewComponent = require('./TextWidgetViewComponent');

TextWidgetDesignerComponent = require('./TextWidgetDesignerComponent');

module.exports = TextWidget = (function(superClass) {
  extend(TextWidget, superClass);

  function TextWidget() {
    return TextWidget.__super__.constructor.apply(this, arguments);
  }

  TextWidget.prototype.createViewElement = function(options) {
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

TextWidgetComponent = (function(superClass) {
  extend(TextWidgetComponent, superClass);

  TextWidgetComponent.propTypes = {
    design: React.PropTypes.object.isRequired,
    onDesignChange: React.PropTypes.func,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    widgetDataSource: React.PropTypes.object.isRequired,
    filters: React.PropTypes.array,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    standardWidth: React.PropTypes.number
  };

  function TextWidgetComponent(props) {
    this.handleStopEditing = bind(this.handleStopEditing, this);
    this.handleStartEditing = bind(this.handleStartEditing, this);
    TextWidgetComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      editing: false
    };
  }

  TextWidgetComponent.prototype.handleStartEditing = function() {
    if ((this.props.onDesignChange != null) && !this.state.editing) {
      return this.setState({
        editing: true
      });
    }
  };

  TextWidgetComponent.prototype.handleStopEditing = function() {
    return this.setState({
      editing: false
    });
  };

  TextWidgetComponent.prototype.refEditor = function(elem) {
    if (elem) {
      return elem.focus();
    }
  };

  TextWidgetComponent.prototype.renderEditor = function() {
    return R(TextWidgetDesignerComponent, {
      ref: this.refEditor,
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      onStopEditing: this.handleStopEditing
    });
  };

  TextWidgetComponent.prototype.renderView = function() {
    return R(TextWidgetViewComponent, {
      design: this.props.design,
      schema: this.props.schema,
      filters: this.props.filters,
      widgetDataSource: this.props.widgetDataSource
    });
  };

  TextWidgetComponent.prototype.render = function() {
    return H.div({
      onClick: this.handleStartEditing,
      style: {
        width: this.props.width,
        height: this.props.height
      }
    }, this.state.editing ? this.renderEditor() : this.renderView());
  };

  return TextWidgetComponent;

})(React.Component);
