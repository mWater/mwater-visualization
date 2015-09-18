var AxisComponent, H, OrderingComponent, OrderingsComponent, R, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

AxisComponent = require('../../expressions/axes/AxisComponent');

module.exports = OrderingsComponent = (function(superClass) {
  extend(OrderingsComponent, superClass);

  function OrderingsComponent() {
    this.handleOrderingChange = bind(this.handleOrderingChange, this);
    this.handleOrderingRemove = bind(this.handleOrderingRemove, this);
    this.handleAdd = bind(this.handleAdd, this);
    return OrderingsComponent.__super__.constructor.apply(this, arguments);
  }

  OrderingsComponent.propTypes = {
    orderings: React.PropTypes.array.isRequired,
    onOrderingsChange: React.PropTypes.func.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string
  };

  OrderingsComponent.prototype.handleAdd = function() {
    var orderings;
    orderings = this.props.orderings.slice();
    orderings.push({
      axis: null,
      direction: "asc"
    });
    return this.props.onOrderingsChange(orderings);
  };

  OrderingsComponent.prototype.handleOrderingRemove = function(index) {
    var orderings;
    orderings = this.props.orderings.slice();
    orderings.splice(index, 1);
    return this.props.onOrderingsChange(orderings);
  };

  OrderingsComponent.prototype.handleOrderingChange = function(index, ordering) {
    var orderings;
    orderings = this.props.orderings.slice();
    orderings[index] = ordering;
    return this.props.onOrderingsChange(orderings);
  };

  OrderingsComponent.prototype.render = function() {
    return H.div(null, _.map(this.props.orderings, (function(_this) {
      return function(ordering, i) {
        return R(OrderingComponent, {
          schema: _this.props.schema,
          dataSource: _this.props.dataSource,
          ordering: ordering,
          table: _this.props.table,
          onOrderingChange: _this.handleOrderingChange.bind(null, i),
          onOrderingRemove: _this.handleOrderingRemove.bind(null, i)
        });
      };
    })(this)), H.button({
      type: "button",
      className: "btn btn-sm btn-default",
      onClick: this.handleAdd,
      key: "add"
    }, H.span({
      className: "glyphicon glyphicon-plus"
    }), " Add Ordering"));
  };

  return OrderingsComponent;

})(React.Component);

OrderingComponent = (function(superClass) {
  extend(OrderingComponent, superClass);

  function OrderingComponent() {
    this.handleDirectionChange = bind(this.handleDirectionChange, this);
    this.handleAxisChange = bind(this.handleAxisChange, this);
    return OrderingComponent.__super__.constructor.apply(this, arguments);
  }

  OrderingComponent.propTypes = {
    ordering: React.PropTypes.array.isRequired,
    onOrderingChange: React.PropTypes.func.isRequired,
    onOrderingRemove: React.PropTypes.func.isRequired,
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    table: React.PropTypes.string
  };

  OrderingComponent.prototype.handleAxisChange = function(axis) {
    return this.props.onOrderingChange(_.extend({}, this.props.ordering, {
      axis: axis
    }));
  };

  OrderingComponent.prototype.handleDirectionChange = function(ev) {
    return this.props.onOrderingChange(_.extend({}, this.props.ordering, {
      direction: ev.target.checked ? "desc" : "asc"
    }));
  };

  OrderingComponent.prototype.render = function() {
    return H.div({
      style: {
        marginLeft: 5
      }
    }, H.button({
      className: "btn btn-xs btn-link pull-right",
      type: "button",
      onClick: this.props.onOrderingRemove
    }, H.span({
      className: "glyphicon glyphicon-remove"
    })), R(AxisComponent, {
      editorTitle: "Order",
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      types: ['text', 'integer', 'decimal', 'boolean', 'date', 'datetime'],
      aggrNeed: 'optional',
      value: this.props.ordering.axis,
      onChange: this.handleAxisChange
    }), H.div({
      className: "checkbox"
    }, H.label(null, H.input({
      type: "checkbox",
      checked: this.props.ordering.direction === "desc",
      onChange: this.handleDirectionChange
    }), "Reverse")));
  };

  return OrderingComponent;

})(React.Component);
