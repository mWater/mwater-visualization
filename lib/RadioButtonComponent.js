var PropTypes, R, RadioButtonComponent, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

module.exports = RadioButtonComponent = (function(superClass) {
  extend(RadioButtonComponent, superClass);

  function RadioButtonComponent() {
    this.handleClick = bind(this.handleClick, this);
    return RadioButtonComponent.__super__.constructor.apply(this, arguments);
  }

  RadioButtonComponent.propTypes = {
    checked: PropTypes.bool,
    onClick: PropTypes.func,
    onChange: PropTypes.func
  };

  RadioButtonComponent.prototype.handleClick = function() {
    if (this.props.onChange) {
      this.props.onChange(!this.props.checked);
    }
    if (this.props.onClick) {
      return this.props.onClick();
    }
  };

  RadioButtonComponent.prototype.render = function() {
    return R('div', {
      className: (this.props.checked ? "mwater-visualization-radio checked" : "mwater-visualization-radio"),
      onClick: this.handleClick
    }, this.props.children);
  };

  return RadioButtonComponent;

})(React.Component);
