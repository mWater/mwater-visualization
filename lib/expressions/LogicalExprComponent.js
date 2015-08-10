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

  LogicalExprComponent.prototype.handleAdd = function() {
    var expr, exprs;
    expr = this.props.value || {
      type: "logical",
      table: this.props.table,
      op: "and",
      exprs: []
    };
    exprs = expr.exprs.concat([
      {
        type: "comparison",
        table: this.props.table
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

  LogicalExprComponent.prototype.render = function() {
    var childElems;
    if (this.props.value) {
      childElems = _.map(this.props.value.exprs, (function(_this) {
        return function(e, i) {
          return H.div({
            key: "" + i
          }, React.createElement(ComparisonExprComponent, {
            value: e,
            schema: _this.props.schema,
            table: _this.props.table,
            onChange: _this.handleExprChange.bind(null, i)
          }), H.button({
            type: "button",
            className: "btn btn-sm btn-link",
            onClick: _this.handleRemove.bind(null, i)
          }, H.span({
            className: "glyphicon glyphicon-remove"
          })));
        };
      })(this));
    }
    return H.div(null, childElems, H.button({
      className: "btn btn-link",
      type: "button",
      onClick: this.handleAdd
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Filter"));
  };

  return LogicalExprComponent;

})(React.Component);
