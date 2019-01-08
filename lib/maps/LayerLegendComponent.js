var AxisBuilder, ExprUtils, LayerLegendComponent, LegendGroup, PropTypes, R, React, _, injectTableAlias,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

PropTypes = require('prop-types');

React = require('react');

_ = require('lodash');

R = React.createElement;

AxisBuilder = require('../axes/AxisBuilder');

LegendGroup = require('./LegendGroup');

ExprUtils = require('mwater-expressions').ExprUtils;

injectTableAlias = require('mwater-expressions').injectTableAlias;

module.exports = LayerLegendComponent = (function(superClass) {
  extend(LayerLegendComponent, superClass);

  function LayerLegendComponent() {
    return LayerLegendComponent.__super__.constructor.apply(this, arguments);
  }

  LayerLegendComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    radiusLayer: PropTypes.bool,
    axis: PropTypes.object,
    symbol: PropTypes.string,
    markerSize: PropTypes.number,
    defaultColor: PropTypes.string,
    filters: PropTypes.array
  };

  LayerLegendComponent.defaultProps = {
    radiusLayer: false
  };

  LayerLegendComponent.prototype.getCategories = function() {
    var axisBuilder, categories;
    axisBuilder = new AxisBuilder({
      schema: this.props.schema
    });
    if (!this.props.axis || !this.props.axis.colorMap) {
      return;
    }
    categories = axisBuilder.getCategories(this.props.axis);
    if (_.any(categories, function(category) {
      return category.value != null;
    })) {
      return categories;
    }
    if (axisBuilder.isAxisAggr(this.props.axis)) {
      return [];
    }
    return axisBuilder.getCategories(this.props.axis, _.pluck(this.props.axis.colorMap, "value"));
  };

  LayerLegendComponent.prototype.render = function() {
    var categories, items;
    categories = this.getCategories();
    if (this.props.axis && this.props.axis.colorMap) {
      items = _.map(categories, (function(_this) {
        return function(category) {
          var color, label;
          if (_.includes(_this.props.axis.excludedValues, category.value)) {
            return null;
          }
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
      items = _.compact(items);
    } else {
      items = [];
    }
    return React.createElement(LegendGroup, {
      symbol: this.props.symbol,
      markerSize: this.props.markerSize,
      items: items,
      defaultColor: this.props.defaultColor,
      name: this.props.name,
      radiusLayer: this.props.radiusLayer
    });
  };

  return LayerLegendComponent;

})(React.Component);
