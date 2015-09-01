var DateRangeComponent, DateRangeLiteralComponent, ExpressionBuilder, ExpressionCompiler, H, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ExpressionCompiler = require('./ExpressionCompiler');

ExpressionBuilder = require('./ExpressionBuilder');

DateRangeComponent = require('../DateRangeComponent');

module.exports = DateRangeLiteralComponent = (function(superClass) {
  extend(DateRangeLiteralComponent, superClass);

  function DateRangeLiteralComponent() {
    this.handleChange = bind(this.handleChange, this);
    return DateRangeLiteralComponent.__super__.constructor.apply(this, arguments);
  }

  DateRangeLiteralComponent.propTypes = {
    value: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    datetime: React.PropTypes.bool.isRequired
  };

  DateRangeLiteralComponent.prototype.handleChange = function(value) {
    if (!value) {
      return this.props.onChange(null);
    } else {
      if (this.props.datetime) {
        return this.props.onChange({
          type: "literal",
          valueType: "datetimerange",
          value: value
        });
      } else {
        return this.props.onChange({
          type: "literal",
          valueType: "daterange",
          value: value
        });
      }
    }
  };

  DateRangeLiteralComponent.prototype.render = function() {
    return React.createElement(DateRangeComponent, {
      value: this.props.value ? this.props.value.value : void 0,
      onChange: this.handleChange,
      datetime: this.props.datetime
    });
  };

  return DateRangeLiteralComponent;

})(React.Component);
