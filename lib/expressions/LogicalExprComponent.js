var ComparisonExprComponent, H, LogicalExprComponent, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ComparisonExprComponent = require('./ComparisonExprComponent');

module.exports = LogicalExprComponent = (function(superClass) {
  extend(LogicalExprComponent, superClass);

  function LogicalExprComponent() {
    this.handleRemove = bind(this.handleRemove, this);
    this.handleAdd = bind(this.handleAdd, this);
    this.handleExprChange = bind(this.handleExprChange, this);
    return LogicalExprComponent.__super__.constructor.apply(this, arguments);
  }

  LogicalExprComponent.propTypes = {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired
  };

  LogicalExprComponent.prototype.handleExprChange = function(i, expr) {
    var exprs;
    exprs = this.props.value.exprs.slice();
    exprs[i] = expr;
    return this.props.onChange(_.extend({}, this.props.value, {
      exprs: exprs
    }));
  };

  LogicalExprComponent.prototype.handleAdd = function(newExpr) {
    var expr, exprs;
    expr = this.props.value || {
      type: "logical",
      table: this.props.table,
      op: "and",
      exprs: []
    };
    if (newExpr && newExpr.type === "field") {
      newExpr = {
        type: "scalar",
        table: newExpr.table,
        expr: newExpr,
        joins: []
      };
    }
    exprs = expr.exprs.concat([
      {
        type: "comparison",
        table: this.props.table,
        lhs: newExpr
      }
    ]);
    return this.props.onChange(_.extend({}, expr, {
      exprs: exprs
    }));
  };

  LogicalExprComponent.prototype.handleRemove = function(i) {
    var exprs;
    exprs = this.props.value.exprs.slice();
    exprs.splice(i, 1);
    return this.props.onChange(_.extend({}, this.props.value, {
      exprs: exprs
    }));
  };

  LogicalExprComponent.prototype.renderAdd = function() {
    var namedExprs;
    namedExprs = this.props.schema.getNamedExprs(this.props.table);
    if (namedExprs.length === 0) {
      return H.button({
        type: "button",
        className: "btn btn-sm btn-default",
        onClick: this.handleAdd.bind(null, null)
      }, H.span({
        className: "glyphicon glyphicon-plus"
      }), " Add Filter");
    }
    return H.div({
      className: "btn-group"
    }, H.button({
      type: "button",
      "data-toggle": "dropdown",
      className: "btn btn-default dropdown-toggle"
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Filter"), H.ul({
      className: "dropdown-menu"
    }, _.map(namedExprs, (function(_this) {
      return function(ne) {
        return H.li({
          key: ne.id
        }, H.a({
          onClick: _this.handleAdd.bind(null, ne.expr)
        }, ne.name));
      };
    })(this)), H.li({
      key: "_divider",
      className: "divider"
    }), H.li({
      key: "_advanced"
    }, H.a({
      onClick: this.handleAdd.bind(null, null)
    }, "Advanced..."))));
  };

  LogicalExprComponent.prototype.renderDropdownItem = function(icon, label, onClick) {
    return H.li({
      key: label
    }, H.a({
      onClick: onClick
    }, icon ? H.span({
      className: "glyphicon glyphicon-" + icon + " text-muted"
    }) : void 0, icon ? " " : void 0, label));
  };

  LogicalExprComponent.prototype.renderGearMenu = function(i) {
    return H.div({
      style: {
        float: "right",
        position: "relative"
      },
      className: "hover-display-child"
    }, H.div({
      "data-toggle": "dropdown"
    }, H.div({
      style: {
        color: "#337ab7"
      }
    }, H.span({
      className: "glyphicon glyphicon-cog"
    }))), H.ul({
      className: "dropdown-menu dropdown-menu-right"
    }, this.renderDropdownItem("remove", "Remove", this.handleRemove.bind(null, i))));
  };

  LogicalExprComponent.prototype.render = function() {
    var childElems;
    if (this.props.value) {
      childElems = _.map(this.props.value.exprs, (function(_this) {
        return function(e, i) {
          return H.div({
            key: "" + i,
            className: "hover-display-parent",
            style: {
              marginBottom: 20
            }
          }, _this.renderGearMenu(i), React.createElement(ComparisonExprComponent, {
            value: e,
            schema: _this.props.schema,
            dataSource: _this.props.dataSource,
            table: _this.props.table,
            onChange: _this.handleExprChange.bind(null, i)
          }));
        };
      })(this));
    }
    return H.div(null, childElems, H.div({
      style: {
        marginTop: 5
      }
    }, this.renderAdd()));
  };

  return LogicalExprComponent;

})(React.Component);
