var AxisBuilder, ColorComponent, ColorMapComponent, ExprCompiler, ExprUtils, H, R, React, _, update,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require('lodash');

React = require('react');

H = React.DOM;

R = React.createElement;

ExprCompiler = require('mwater-expressions').ExprCompiler;

AxisBuilder = require('./AxisBuilder');

update = require('update-object');

ColorComponent = require('../ColorComponent');

ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = ColorMapComponent = (function(superClass) {
  extend(ColorMapComponent, superClass);

  function ColorMapComponent() {
    this.handleNullLabelChange = bind(this.handleNullLabelChange, this);
    this.handleColorChange = bind(this.handleColorChange, this);
    return ColorMapComponent.__super__.constructor.apply(this, arguments);
  }

  ColorMapComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    axis: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    categories: React.PropTypes.array
  };

  ColorMapComponent.prototype.handleColorChange = function(value, color) {
    var colorMap;
    colorMap = _.filter(this.props.axis.colorMap, (function(_this) {
      return function(item) {
        return item.value !== value;
      };
    })(this));
    if (color) {
      colorMap.push({
        value: value,
        color: color
      });
    }
    return this.props.onChange(update(this.props.axis, {
      colorMap: {
        $set: colorMap
      }
    }));
  };

  ColorMapComponent.prototype.lookupColor = function(value) {
    var item;
    item = _.find(this.props.axis.colorMap, (function(_this) {
      return function(item) {
        return item.value === value;
      };
    })(this));
    if (item) {
      return item.color;
    }
    return null;
  };

  ColorMapComponent.prototype.handleNullLabelChange = function(e) {
    var name;
    name = prompt("Enter label for none value", this.props.axis.nullLabel || ExprUtils.localizeString("None"));
    if (name) {
      return this.props.onChange(update(this.props.axis, {
        nullLabel: {
          $set: name
        }
      }));
    }
  };

  ColorMapComponent.prototype.renderLabel = function(category) {
    var label;
    label = ExprUtils.localizeString(category.label);
    if (category.value) {
      return label;
    } else {
      return H.a({
        onClick: this.handleNullLabelChange,
        style: {
          cursor: 'pointer'
        }
      }, label, H.span({
        style: {
          fontSize: 12,
          marginLeft: 4
        }
      }, "(click to change label for none value)"));
    }
  };

  ColorMapComponent.prototype.render = function() {
    return H.div(null, H.table({
      style: {
        width: "auto"
      }
    }, H.tbody(null, _.map(this.props.categories, (function(_this) {
      return function(category) {
        return H.tr({
          key: category.value
        }, H.td({
          key: "color"
        }, R(ColorComponent, {
          color: _this.lookupColor(category.value),
          onChange: function(color) {
            return _this.handleColorChange(category.value, color);
          }
        })), H.td({
          key: "label",
          style: {
            paddingLeft: 8
          }
        }, _this.renderLabel(category)));
      };
    })(this)))));
  };

  return ColorMapComponent;

})(React.Component);
