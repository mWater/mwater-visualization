var ColorComponent, H, React, SketchPicker,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

SketchPicker = require("react-color").SketchPicker;

module.exports = ColorComponent = (function(superClass) {
  extend(ColorComponent, superClass);

  ColorComponent.propTypes = {
    color: React.PropTypes.string,
    onChange: React.PropTypes.func
  };

  function ColorComponent() {
    this.handleTransparent = bind(this.handleTransparent, this);
    this.handleReset = bind(this.handleReset, this);
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
    return this.props.onChange(color.hex);
  };

  ColorComponent.prototype.handleReset = function() {
    this.setState({
      open: false
    });
    return this.props.onChange(null);
  };

  ColorComponent.prototype.handleTransparent = function() {
    this.setState({
      open: false
    });
    return this.props.onChange("transparent");
  };

  ColorComponent.prototype.render = function() {
    var popupPosition, style;
    style = {
      height: 20,
      width: 20,
      border: "solid 2px #888",
      borderRadius: 4,
      backgroundColor: this.props.color,
      cursor: "pointer",
      display: "inline-block"
    };
    if (!this.props.color) {
      style.backgroundColor = "#AAA";
      style.backgroundImage = "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,.7) 2px, rgba(255,255,255,.7) 4px)";
    }
    popupPosition = {
      position: 'absolute',
      top: 0,
      left: 30,
      zIndex: 1000,
      backgroundColor: "white",
      border: "solid 1px #DDD",
      borderRadius: 3
    };
    return H.div({
      style: {
        position: "relative",
        display: "inline-block"
      }
    }, H.div({
      style: style,
      onClick: this.handleClick
    }), this.state.open ? H.div({
      style: popupPosition
    }, H.button({
      type: "button",
      className: "btn btn-link btn-sm",
      onClick: this.handleReset
    }, H.i({
      className: "fa fa-undo"
    }), " Reset Color"), H.button({
      type: "button",
      className: "btn btn-link btn-sm",
      onClick: this.handleTransparent
    }, H.i({
      className: "fa fa-ban"
    }), " Transparent"), React.createElement(SketchPicker, {
      type: "sketch",
      color: this.props.color || void 0,
      onChangeComplete: this.handleClose
    })) : void 0);
  };

  return ColorComponent;

})(React.Component);
