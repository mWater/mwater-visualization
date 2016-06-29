var AxisBuilder, ColorComponent, ColorMapComponent, ExprCompiler, H, R, React, _, update,
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

module.exports = ColorMapComponent = (function(superClass) {
  extend(ColorMapComponent, superClass);

  ColorMapComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    dataSource: React.PropTypes.object.isRequired,
    axis: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  function ColorMapComponent() {
    this.handleColorChange = bind(this.handleColorChange, this);
    ColorMapComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      categories: null
    };
  }

  ColorMapComponent.prototype.componentDidMount = function() {
    return this.loadCategories(this.props);
  };

  ColorMapComponent.prototype.componentWillReceiveProps = function(nextProps) {
    if (!_.isEqual(nextProps.axis, this.props.axis)) {
      return this.loadCategories(nextProps);
    }
  };

  ColorMapComponent.prototype.loadCategories = function(props) {
    var axisBuilder, categories;
    axisBuilder = new AxisBuilder({
      schema: props.schema
    });
    categories = axisBuilder.getCategories(props.axis);
    if (categories.length > 0) {
      this.setState({
        categories: categories
      });
    }
  };

  ColorMapComponent.prototype.componentWillUnmount = function() {
    return this.unmounted = true;
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

  ColorMapComponent.prototype.render = function() {
    return H.div(null, H.table({
      style: {
        width: "auto"
      }
    }, H.tbody(null, _.map(this.state.categories, (function(_this) {
      return function(category) {
        return H.tr(null, H.td({
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
        }, category.label));
      };
    })(this)))));
  };

  return ColorMapComponent;

})(React.Component);
