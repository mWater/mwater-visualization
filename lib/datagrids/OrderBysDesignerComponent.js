var ExprComponent, ExprUtils, H, OrderByDesignerComponent, OrderBysDesignerComponent, R, React, ReactReorderable, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ExprUtils = require("mwater-expressions").ExprUtils;

ExprComponent = require('mwater-expressions-ui').ExprComponent;

ReactReorderable = require('react-reorderable');

module.exports = OrderBysDesignerComponent = (function(superClass) {
  extend(OrderBysDesignerComponent, superClass);

  function OrderBysDesignerComponent() {
    this.handleAdd = bind(this.handleAdd, this);
    this.handleRemove = bind(this.handleRemove, this);
    this.handleChange = bind(this.handleChange, this);
    return OrderBysDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  OrderBysDesignerComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string.isRequired,
    orderBys: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  OrderBysDesignerComponent.defaultProps = {
    orderBys: []
  };

  OrderBysDesignerComponent.prototype.handleChange = function(index, orderBy) {
    var orderBys;
    orderBys = this.props.orderBys.slice();
    orderBys[index] = orderBy;
    return this.props.onChange(orderBys);
  };

  OrderBysDesignerComponent.prototype.handleRemove = function(index) {
    var orderBys;
    orderBys = this.props.orderBys.slice();
    orderBys.splice(index, 1);
    return this.props.onChange(orderBys);
  };

  OrderBysDesignerComponent.prototype.handleAdd = function() {
    var orderBys;
    orderBys = this.props.orderBys.slice();
    orderBys.push({
      expr: null,
      direction: "asc"
    });
    return this.props.onChange(orderBys);
  };

  OrderBysDesignerComponent.prototype.render = function() {
    return H.div(null, _.map(this.props.orderBys, (function(_this) {
      return function(orderBy, index) {
        return R(OrderByDesignerComponent, {
          key: index,
          schema: _this.props.schema,
          table: _this.props.table,
          dataSource: _this.props.dataSource,
          orderBy: orderBy,
          onChange: _this.handleChange.bind(null, index),
          onRemove: _this.handleRemove.bind(null, index)
        });
      };
    })(this)), H.button({
      key: "add",
      type: "button",
      className: "btn btn-link",
      onClick: this.handleAdd
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Ordering"));
  };

  return OrderBysDesignerComponent;

})(React.Component);

OrderByDesignerComponent = (function(superClass) {
  extend(OrderByDesignerComponent, superClass);

  function OrderByDesignerComponent() {
    this.handleDirectionChange = bind(this.handleDirectionChange, this);
    this.handleExprChange = bind(this.handleExprChange, this);
    return OrderByDesignerComponent.__super__.constructor.apply(this, arguments);
  }

  OrderByDesignerComponent.propTypes = {
    orderBy: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string
  };

  OrderByDesignerComponent.prototype.handleExprChange = function(expr) {
    return this.props.onChange(_.extend({}, this.props.orderBy, {
      expr: expr
    }));
  };

  OrderByDesignerComponent.prototype.handleDirectionChange = function(ev) {
    return this.props.onChange(_.extend({}, this.props.orderBy, {
      direction: ev.target.checked ? "desc" : "asc"
    }));
  };

  OrderByDesignerComponent.prototype.render = function() {
    return H.div({
      className: "row"
    }, H.div({
      className: "col-xs-7"
    }, R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      types: ['text', 'number', 'boolean', 'date', 'datetime'],
      aggrStatuses: ["individual", "literal", "aggregate"],
      value: this.props.orderBy.expr,
      onChange: this.handleExprChange
    })), H.div({
      className: "col-xs-3"
    }, H.div({
      className: "checkbox-inline"
    }, H.label(null, H.input({
      type: "checkbox",
      checked: this.props.orderBy.direction === "desc",
      onChange: this.handleDirectionChange
    }), "Reverse"))), H.div({
      className: "col-xs-1"
    }, H.button({
      className: "btn btn-xs btn-link",
      type: "button",
      onClick: this.props.onRemove
    }, H.span({
      className: "glyphicon glyphicon-remove"
    }))));
  };

  return OrderByDesignerComponent;

})(React.Component);
