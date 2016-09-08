var AxisBuilder, ExprUtils, H, LayerLegendComponent, LegendGroup, R, React, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

React = require('react');

H = React.DOM;

_ = require('lodash');

R = React.createElement;

AxisBuilder = require('../axes/AxisBuilder');

LegendGroup = require('./LegendGroup');

ExprUtils = require('mwater-expressions').ExprUtils;

module.exports = LayerLegendComponent = (function(superClass) {
  extend(LayerLegendComponent, superClass);

  LayerLegendComponent.propTypes = {
    schema: React.PropTypes.object.isRequired,
    name: React.PropTypes.string.isRequired,
    radiusLayer: React.PropTypes.bool,
    axis: React.PropTypes.object,
    symbol: React.PropTypes.string,
    defaultColor: React.PropTypes.string
  };

  LayerLegendComponent.defaultProps = {
    radiusLayer: false
  };

  function LayerLegendComponent() {
    LayerLegendComponent.__super__.constructor.apply(this, arguments);
    this.state = {
      categories: []
    };
  }

  LayerLegendComponent.prototype.componentWillMount = function() {
    return this.loadCategories(this.props);
  };

  LayerLegendComponent.prototype.componentWillReceiveProps = function(nextProps) {
    if (!_.isEqual(nextProps.axis, this.props.axis)) {
      return this.loadCategories(nextProps);
    }
  };

  LayerLegendComponent.prototype.componentWillUnmount = function() {
    return this.unmounted = true;
  };

  LayerLegendComponent.prototype.loadCategories = function(props) {
    var axisBuilder, categories;
    axisBuilder = new AxisBuilder({
      schema: props.schema
    });
    if (!props.axis || !props.axis.colorMap) {
      return;
    }
    categories = axisBuilder.getCategories(props.axis, _.pluck(props.axis.colorMap, "value"));
    if (categories.length > 1) {
      this.setState({
        categories: categories
      });
    }
  };

  LayerLegendComponent.prototype.render = function() {
    var colors;
    if (this.props.axis && this.props.axis.colorMap) {
      colors = _.map(this.state.categories, (function(_this) {
        return function(category) {
          var color, label;
          label = ExprUtils.localizeString(category.label);
          color = _.find(_this.props.axis.colorMap, {
            value: category.value
          });
          if (color) {
            return {
              color: color.color,
              name: label
            };
          } else {
            return {
              color: _this.props.defaultColor,
              name: label
            };
          }
        };
      })(this));
    } else {
      colors = [];
    }
    return React.createElement(LegendGroup, {
      symbol: this.props.symbol,
      items: colors,
      defaultColor: this.props.defaultColor,
      name: this.props.name,
      radiusLayer: this.props.radiusLayer
    });
  };

  return LayerLegendComponent;

})(React.Component);
