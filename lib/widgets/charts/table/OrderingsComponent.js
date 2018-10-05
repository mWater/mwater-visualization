var ExprComponent, OrderingComponent, OrderingsComponent, PropTypes, R, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

_ = require('lodash');

React = require('react');

R = React.createElement;

ExprComponent = require("mwater-expressions-ui").ExprComponent;

module.exports = OrderingsComponent = (function(superClass) {
  extend(OrderingsComponent, superClass);

  function OrderingsComponent() {
    this.handleOrderingChange = bind(this.handleOrderingChange, this);
    this.handleOrderingRemove = bind(this.handleOrderingRemove, this);
    this.handleAdd = bind(this.handleAdd, this);
    return OrderingsComponent.__super__.constructor.apply(this, arguments);
  }

  OrderingsComponent.propTypes = {
    orderings: PropTypes.array.isRequired,
    onOrderingsChange: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    table: PropTypes.string
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
    return R('div', null, _.map(this.props.orderings, (function(_this) {
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
    })(this)), R('button', {
      type: "button",
      className: "btn btn-sm btn-default",
      onClick: this.handleAdd,
      key: "add"
    }, R('span', {
      className: "glyphicon glyphicon-plus"
    }), " Add Ordering"));
  };

  return OrderingsComponent;

})(React.Component);

OrderingComponent = (function(superClass) {
  extend(OrderingComponent, superClass);

  function OrderingComponent() {
    this.handleDirectionChange = bind(this.handleDirectionChange, this);
    this.handleExprChange = bind(this.handleExprChange, this);
    this.handleAxisChange = bind(this.handleAxisChange, this);
    return OrderingComponent.__super__.constructor.apply(this, arguments);
  }

  OrderingComponent.propTypes = {
    ordering: PropTypes.object.isRequired,
    onOrderingChange: PropTypes.func.isRequired,
    onOrderingRemove: PropTypes.func.isRequired,
    schema: PropTypes.object.isRequired,
    dataSource: PropTypes.object.isRequired,
    table: PropTypes.string
  };

  OrderingComponent.prototype.handleAxisChange = function(axis) {
    return this.props.onOrderingChange(_.extend({}, this.props.ordering, {
      axis: axis
    }));
  };

  OrderingComponent.prototype.handleExprChange = function(expr) {
    var axis;
    axis = _.extend({}, this.props.ordering.axis || {}, {
      expr: expr
    });
    return this.handleAxisChange(axis);
  };

  OrderingComponent.prototype.handleDirectionChange = function(ev) {
    return this.props.onOrderingChange(_.extend({}, this.props.ordering, {
      direction: ev.target.checked ? "desc" : "asc"
    }));
  };

  OrderingComponent.prototype.render = function() {
    var ref;
    return R('div', {
      style: {
        marginLeft: 5
      }
    }, R('div', {
      style: {
        textAlign: "right"
      }
    }, R('button', {
      className: "btn btn-xs btn-link",
      type: "button",
      onClick: this.props.onOrderingRemove
    }, R('span', {
      className: "glyphicon glyphicon-remove"
    }))), R(ExprComponent, {
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.table,
      types: ['text', 'number', 'boolean', 'date', 'datetime'],
      aggrStatuses: ['individual', 'aggregate'],
      value: (ref = this.props.ordering.axis) != null ? ref.expr : void 0,
      onChange: this.handleExprChange
    }), R('div', null, R('div', {
      className: "checkbox-inline"
    }, R('label', null, R('input', {
      type: "checkbox",
      checked: this.props.ordering.direction === "desc",
      onChange: this.handleDirectionChange
    }), "Reverse"))));
  };

  return OrderingComponent;

})(React.Component);
