var ClickOutHandler, Color, ColorPaletteComponent, FontColorPaletteItem, PropTypes, R, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

R = React.createElement;

_ = require('lodash');

ClickOutHandler = require('react-onclickout');

Color = require('color');

module.exports = FontColorPaletteItem = (function(superClass) {
  extend(FontColorPaletteItem, superClass);

  FontColorPaletteItem.propTypes = {
    onSetColor: PropTypes.func.isRequired,
    position: PropTypes.string
  };

  FontColorPaletteItem.defaultProps = {
    position: "under"
  };

  function FontColorPaletteItem(props) {
    this.handleMouseDown = bind(this.handleMouseDown, this);
    FontColorPaletteItem.__super__.constructor.call(this, props);
    this.state = {
      open: false
    };
  }

  FontColorPaletteItem.prototype.handleMouseDown = function(ev) {
    ev.preventDefault();
    return this.setState({
      open: !this.state.open
    });
  };

  FontColorPaletteItem.prototype.render = function() {
    var popupPosition;
    popupPosition = {
      position: 'absolute',
      left: 0,
      zIndex: 1000,
      backgroundColor: "white",
      border: "solid 1px #AAA",
      borderRadius: 3
    };
    if (this.props.position === "under") {
      popupPosition['top'] = 26;
    } else {
      popupPosition['bottom'] = 26;
    }
    return R(ClickOutHandler, {
      onClickOut: ((function(_this) {
        return function() {
          return _this.setState({
            open: false
          });
        };
      })(this))
    }, R('div', {
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleMouseDown,
      style: {
        position: "relative"
      }
    }, this.state.open ? R('div', {
      style: popupPosition
    }, R(ColorPaletteComponent, {
      onSetColor: (function(_this) {
        return function(color) {
          _this.props.onSetColor(color);
          return _this.setState({
            open: false
          });
        };
      })(this)
    })) : void 0, R('i', {
      className: "fa fa-tint"
    })));
  };

  return FontColorPaletteItem;

})(React.Component);

ColorPaletteComponent = (function(superClass) {
  extend(ColorPaletteComponent, superClass);

  function ColorPaletteComponent() {
    return ColorPaletteComponent.__super__.constructor.apply(this, arguments);
  }

  ColorPaletteComponent.propTypes = {
    onSetColor: PropTypes.func.isRequired
  };

  ColorPaletteComponent.prototype.renderColor = function(color) {
    return R('td', null, R('div', {
      style: {
        width: 16,
        height: 15,
        backgroundColor: color,
        margin: 1
      },
      onMouseDown: (function(_this) {
        return function(ev) {
          ev.preventDefault();
          return _this.props.onSetColor(color);
        };
      })(this)
    }));
  };

  ColorPaletteComponent.prototype.render = function() {
    var baseColors;
    baseColors = ["#FF0000", "#FFAA00", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#9900FF", "#FF00FF"];
    return R('div', {
      style: {
        padding: 5
      }
    }, R('table', null, R('tbody', null, R('tr', null, _.map(_.range(0, 8), (function(_this) {
      return function(i) {
        return _this.renderColor(Color({
          r: i * 255 / 7,
          g: i * 255 / 7,
          b: i * 255 / 7
        }).hex());
      };
    })(this))), R('tr', {
      style: {
        height: 5
      }
    }), R('tr', null, _.map(baseColors, (function(_this) {
      return function(c) {
        return _this.renderColor(c);
      };
    })(this))), R('tr', {
      style: {
        height: 5
      }
    }), R('tr', null, _.map(baseColors, (function(_this) {
      return function(c) {
        return _this.renderColor(Color(c).lighten(0.7).hex());
      };
    })(this))), R('tr', null, _.map(baseColors, (function(_this) {
      return function(c) {
        return _this.renderColor(Color(c).lighten(0.5).hex());
      };
    })(this))), R('tr', null, _.map(baseColors, (function(_this) {
      return function(c) {
        return _this.renderColor(Color(c).lighten(0.3).hex());
      };
    })(this))), R('tr', null, _.map(baseColors, (function(_this) {
      return function(c) {
        return _this.renderColor(Color(c).darken(0.3).hex());
      };
    })(this))), R('tr', null, _.map(baseColors, (function(_this) {
      return function(c) {
        return _this.renderColor(Color(c).darken(0.5).hex());
      };
    })(this))), R('tr', null, _.map(baseColors, (function(_this) {
      return function(c) {
        return _this.renderColor(Color(c).darken(0.7).hex());
      };
    })(this))))));
  };

  return ColorPaletteComponent;

})(React.Component);
