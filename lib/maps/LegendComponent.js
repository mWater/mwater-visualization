"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var LayerFactory, LegendComponent, PropTypes, R, React, _;

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
LayerFactory = require('./LayerFactory'); // Displays legends

module.exports = LegendComponent = function () {
  var LegendComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(LegendComponent, _React$Component);

    function LegendComponent() {
      (0, _classCallCheck2.default)(this, LegendComponent);
      return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(LegendComponent).apply(this, arguments));
    }

    (0, _createClass2.default)(LegendComponent, [{
      key: "render",
      value: function render() {
        var _this = this;

        var legendItems, style;
        legendItems = _.compact(_.map(this.props.layerViews, function (layerView) {
          var design, layer, maxZoom, minZoom; // Ignore if legend hidden

          if (layerView.hideLegend) {
            return;
          } // Create layer


          layer = LayerFactory.createLayer(layerView.type);
          design = layer.cleanDesign(layerView.design, _this.props.schema); // Ignore if invalid

          if (layer.validateDesign(design, _this.props.schema)) {
            return null;
          } // Ignore if not visible


          if (!layerView.visible) {
            return null;
          } // Ignore if zoom out of range


          minZoom = layer.getMinZoom(design);
          maxZoom = layer.getMaxZoom(design);

          if (minZoom != null && _this.props.zoom != null && _this.props.zoom < minZoom) {
            return null;
          }

          if (maxZoom != null && _this.props.zoom != null && _this.props.zoom > maxZoom) {
            return null;
          }

          return {
            key: layerView.id,
            legend: layer.getLegend(design, _this.props.schema, layerView.name, _this.props.dataSource, _this.props.filters)
          };
        }));

        if (legendItems.length === 0) {
          return null;
        }

        style = {
          padding: 7,
          background: "rgba(255,255,255,0.8)",
          boxShadow: "0 0 15px rgba(0,0,0,0.2)",
          borderRadius: 5,
          position: 'absolute',
          right: 10,
          bottom: 35,
          maxHeight: '85%',
          overflowY: 'auto',
          zIndex: 1000,
          fontSize: 12
        };
        return R('div', {
          style: style
        }, _.map(legendItems, function (item, i) {
          return [R('div', {
            key: item.key
          }, item.legend)];
        }));
      }
    }]);
    return LegendComponent;
  }(React.Component);

  ;
  LegendComponent.propTypes = {
    schema: PropTypes.object.isRequired,
    // Schema to use
    layerViews: PropTypes.array.isRequired,
    // Layer views
    zoom: PropTypes.number,
    // Current zoom level
    filters: PropTypes.array // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  };
  return LegendComponent;
}.call(void 0);