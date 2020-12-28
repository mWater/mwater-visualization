"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var LayerFactory, LegendComponent, PropTypes, R, React, _;

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
LayerFactory = require('./LayerFactory'); // Displays legends

module.exports = LegendComponent = function () {
  var LegendComponent = /*#__PURE__*/function (_React$Component) {
    (0, _inherits2["default"])(LegendComponent, _React$Component);

    var _super = _createSuper(LegendComponent);

    function LegendComponent() {
      (0, _classCallCheck2["default"])(this, LegendComponent);
      return _super.apply(this, arguments);
    }

    (0, _createClass2["default"])(LegendComponent, [{
      key: "render",
      value: function render() {
        var _this = this;

        var hideStyle, legendItems, legendStyle;
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
            legend: layer.getLegend(design, _this.props.schema, layerView.name, _this.props.dataSource, _this.props.locale, _this.props.filters)
          };
        }));

        if (legendItems.length === 0) {
          return null;
        }

        legendStyle = {
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
        hideStyle = {
          position: "absolute",
          bottom: 34,
          right: 11,
          zIndex: 1001,
          fontSize: 10,
          color: "#337ab7",
          cursor: "pointer"
        };
        return R('div', null, R('div', {
          style: legendStyle
        }, _.map(legendItems, function (item, i) {
          return [R('div', {
            key: item.key
          }, item.legend)];
        })), R('div', {
          key: "hide",
          style: hideStyle,
          onClick: this.props.onHide
        }, R('i', {
          className: "fa fa-angle-double-right"
        })));
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
    filters: PropTypes.array,
    // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    locale: PropTypes.string.isRequired,
    onHide: PropTypes.func.isRequired
  };
  return LegendComponent;
}.call(void 0);