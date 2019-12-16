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
    (0, _inherits2["default"])(LegendComponent, _React$Component);

    function LegendComponent() {
      (0, _classCallCheck2["default"])(this, LegendComponent);
      return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(LegendComponent).apply(this, arguments));
    }

    (0, _createClass2["default"])(LegendComponent, [{
      key: "render",
      value: function render() {
        var _this = this;

        var legendItems, position, ref, ref1, ref2, scale, style;
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

        if (this.props.design != null && ((ref = this.props.design) != null ? ref.showLegend : void 0) === false) {
          return null;
        }

        style = {
          padding: 7,
          background: "rgba(255,255,255,0.8)",
          boxShadow: "0 0 15px rgba(0,0,0,0.2)",
          borderRadius: 5,
          position: 'absolute',
          maxHeight: '85%',
          overflowY: 'auto',
          zIndex: 1000,
          fontSize: 12
        };
        position = ((ref1 = this.props.design) != null ? ref1.position : void 0) || 'bottomRight';
        scale = ((ref2 = this.props.design) != null ? ref2.scale : void 0) || 'normal';

        switch (position) {
          case "topRight":
            style.top = 10;
            style.right = 10;
            style.transformOrigin = "top right";
            break;

          case "topLeft":
            style.top = 10;
            style.left = 50;
            style.transformOrigin = "top left";
            break;

          case "bottomLeft":
            style.bottom = 50;
            style.left = 10;
            style.transformOrigin = "bottom left";
            break;

          case "bottomRight":
            style.bottom = 35;
            style.right = 10;
            style.transformOrigin = "bottom right";
        }

        switch (scale) {
          case "small":
            style.transform = 'scale(0.6)';
            break;

          case "medium":
            style.transform = 'scale(0.8)';
        }

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
    design: PropTypes.object,
    // Legend Options
    zoom: PropTypes.number,
    // Current zoom level
    filters: PropTypes.array // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  };
  return LegendComponent;
}.call(void 0);