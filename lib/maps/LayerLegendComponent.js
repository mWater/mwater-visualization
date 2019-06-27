"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AxisBuilder, ExprUtils, LayerLegendComponent, LegendGroup, PropTypes, R, React, _, injectTableAlias;

PropTypes = require('prop-types');
React = require('react');
_ = require('lodash');
R = React.createElement;
AxisBuilder = require('../axes/AxisBuilder');
LegendGroup = require('./LegendGroup');
ExprUtils = require('mwater-expressions').ExprUtils;
injectTableAlias = require('mwater-expressions').injectTableAlias; // wraps the legends for a layer

module.exports = LayerLegendComponent = function () {
  var LayerLegendComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2["default"])(LayerLegendComponent, _React$Component);

    function LayerLegendComponent() {
      (0, _classCallCheck2["default"])(this, LayerLegendComponent);
      return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(LayerLegendComponent).apply(this, arguments));
    }

    (0, _createClass2["default"])(LayerLegendComponent, [{
      key: "getCategories",
      value: function getCategories() {
        var axisBuilder, categories;
        axisBuilder = new AxisBuilder({
          schema: this.props.schema
        });

        if (!this.props.axis || !this.props.axis.colorMap) {
          return;
        } // Get categories (value + label)


        categories = axisBuilder.getCategories(this.props.axis); // Just "None" and so doesn't count

        if (_.any(categories, function (category) {
          return category.value != null;
        })) {
          return categories;
        } // Can't get values of aggregate axis


        if (axisBuilder.isAxisAggr(this.props.axis)) {
          return [];
        } // If no categories, use values from color map as input


        return axisBuilder.getCategories(this.props.axis, _.pluck(this.props.axis.colorMap, "value"));
      }
    }, {
      key: "render",
      value: function render() {
        var _this = this;

        var categories, items;
        categories = this.getCategories();

        if (this.props.axis && this.props.axis.colorMap) {
          items = _.map(categories, function (category) {
            var color, label; // Exclude if excluded

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
                name: label // old color maps dont have null value

              };
            } else {
              return {
                color: _this.props.defaultColor,
                name: label
              };
            }
          }); // Compact out nulls

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
      }
    }]);
    return LayerLegendComponent;
  }(React.Component);

  ;
  LayerLegendComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    radiusLayer: PropTypes.bool,
    axis: PropTypes.object,
    symbol: PropTypes.string,
    markerSize: PropTypes.number,
    defaultColor: PropTypes.string,
    filters: PropTypes.array // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  };
  LayerLegendComponent.defaultProps = {
    radiusLayer: false
  };
  return LayerLegendComponent;
}.call(void 0);