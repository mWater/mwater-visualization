var ColorComponent, ColorPicker, H, React,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

ColorPicker = require('react-color');

module.exports = ColorComponent = (function(superClass) {
  extend(ColorComponent, superClass);

  ColorComponent.propTypes = {
    color: React.PropTypes.string,
    onChange: React.PropTypes.func
  };

  function ColorComponent() {
    this.handleClose = bind(this.handleClose, this);
    this.handleClick = bind(this.handleClick, this);
    ColorComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      open: false
    };
  }

  ColorComponent.prototype.handleClick = function() {
    return this.setState({
      open: !this.state.open
    });
  };

  ColorComponent.prototype.handleClose = function(color) {
    this.setState({
      open: false
    });
    return this.props.onChange("#" + color.hex);
  };

  ColorComponent.prototype.render = function() {
    var popupPosition, style;
    style = {
      height: 30,
      width: 30,
      border: "solid 2px #888",
      borderRadius: 4,
      backgroundColor: this.props.color
    };
    popupPosition = {
      position: 'absolute',
      top: 0,
      left: 30
    };
    return H.div({
      style: {
        position: "relative"
      }
    }, H.div({
      style: style,
      onClick: this.handleClick
    }), React.createElement(ColorPicker, {
      display: this.state.open,
      positionCSS: popupPosition,
      onClose: this.handleClose
    }));
  };

  return ColorComponent;

})(React.Component);
