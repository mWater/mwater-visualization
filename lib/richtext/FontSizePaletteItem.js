var ClickOutHandler, ColorPaletteComponent, FontSizePaletteItem, H, PropTypes, R, React, _,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

H = React.DOM;

R = React.createElement;

_ = require('lodash');

ClickOutHandler = require('react-onclickout');

module.exports = FontSizePaletteItem = (function(superClass) {
  extend(FontSizePaletteItem, superClass);

  FontSizePaletteItem.propTypes = {
    onSetSize: PropTypes.func.isRequired,
    position: PropTypes.string
  };

  FontSizePaletteItem.defaultProps = {
    position: "under"
  };

  function FontSizePaletteItem() {
    this.handleMouseDown = bind(this.handleMouseDown, this);
    FontSizePaletteItem.__super__.constructor.apply(this, arguments);
    this.state = {
      open: false
    };
  }

  FontSizePaletteItem.prototype.handleMouseDown = function(ev) {
    ev.preventDefault();
    return this.setState({
      open: !this.state.open
    });
  };

  FontSizePaletteItem.prototype.renderSize = function(label, value) {
    return H.div({
      className: "font-size-palette-menu-item",
      onMouseDown: (function(_this) {
        return function(ev) {
          ev.preventDefault();
          _this.props.onSetSize(value);
          return _this.setState({
            open: false
          });
        };
      })(this),
      key: value
    }, label);
  };

  FontSizePaletteItem.prototype.renderSizes = function() {
    return H.div(null, this.renderSize("Tiny", "50%"), this.renderSize("Small", "66%"), this.renderSize("Normal", "100%"), this.renderSize("Large", "150%"), this.renderSize("Huge", "200%"));
  };

  FontSizePaletteItem.prototype.render = function() {
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
    }, H.div({
      className: "mwater-visualization-text-palette-item",
      onMouseDown: this.handleMouseDown,
      style: {
        position: "relative"
      }
    }, H.style(null, '.font-size-palette-menu-item {\n  color: black;\n  background-color: white;\n  text-align: left;\n  padding: 5px 15px 5px 15px;\n  cursor: pointer;\n}\n.font-size-palette-menu-item:hover {\n  background-color: #DDD;\n}'), this.state.open ? H.div({
      style: popupPosition
    }, this.renderSizes()) : void 0, H.i({
      className: "fa fa-arrows-v"
    })));
  };

  return FontSizePaletteItem;

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
    return H.td(null, H.div({
      style: {
        width: 16,
        height: 15,
        backgroundColor: color,
        margin: 1
      },
      onMouseDown: (function(_this) {
        return function(ev) {
          ev.preventDefault();
          return _this.props.onSetColor.bind(null, color);
        };
      })(this)
    }));
  };

  ColorPaletteComponent.prototype.render = function() {
    var baseColors;
    baseColors = ["#FF0000", "#FFAA00", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#9900FF", "#FF00FF"];
    return H.div({
      style: {
        padding: 5
      }
    }, H.table(null, H.tbody(null, H.tr(null, _.map(_.range(0, 8), (function(_this) {
      return function(i) {
        return _this.renderColor(Color({
          r: i * 255 / 7,
          g: i * 255 / 7,
          b: i * 255 / 7
        }).hex());
      };
    })(this))), H.tr({
      style: {
        height: 5
      }
    }), H.tr(null, _.map(baseColors, (function(_this) {
      return function(c) {
        return _this.renderColor(c);
      };
    })(this))), H.tr({
      style: {
        height: 5
      }
    }), H.tr(null, _.map(baseColors, (function(_this) {
      return function(c) {
        return _this.renderColor(Color(c).lighten(0.7).hex());
      };
    })(this))), H.tr(null, _.map(baseColors, (function(_this) {
      return function(c) {
        return _this.renderColor(Color(c).lighten(0.5).hex());
      };
    })(this))), H.tr(null, _.map(baseColors, (function(_this) {
      return function(c) {
        return _this.renderColor(Color(c).lighten(0.3).hex());
      };
    })(this))), H.tr(null, _.map(baseColors, (function(_this) {
      return function(c) {
        return _this.renderColor(Color(c).darken(0.3).hex());
      };
    })(this))), H.tr(null, _.map(baseColors, (function(_this) {
      return function(c) {
        return _this.renderColor(Color(c).darken(0.5).hex());
      };
    })(this))), H.tr(null, _.map(baseColors, (function(_this) {
      return function(c) {
        return _this.renderColor(Color(c).darken(0.7).hex());
      };
    })(this))))));
  };

  return ColorPaletteComponent;

})(React.Component);
