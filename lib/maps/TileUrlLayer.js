"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var AxisBuilder,
    ExprCleaner,
    ExprCompiler,
    ExprUtils,
    Layer,
    LegendGroup,
    PropTypes,
    R,
    React,
    TileUrlLayer,
    TileUrlLayerDesignerComponent,
    _,
    injectTableAlias,
    boundMethodCheck = function boundMethodCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error('Bound instance method accessed before binding');
  }
};

PropTypes = require('prop-types');
_ = require('lodash');
React = require('react');
R = React.createElement;
Layer = require('./Layer');
ExprCompiler = require('mwater-expressions').ExprCompiler;
ExprUtils = require('mwater-expressions').ExprUtils;
injectTableAlias = require('mwater-expressions').injectTableAlias;
ExprCleaner = require('mwater-expressions').ExprCleaner;
ExprUtils = require('mwater-expressions').ExprUtils;
AxisBuilder = require('../axes/AxisBuilder');
LegendGroup = require('./LegendGroup');
/*
Layer that is a custom Leaflet-style url tile layer
Design is:
  tileUrl: Url with {s}, {z}, {x}, {y}
  minZoom: optional min zoom level
  maxZoom: optional max zoom level
  readonly: if true, hides url and prevents editing
*/

module.exports = TileUrlLayer =
/*#__PURE__*/
function (_Layer) {
  (0, _inherits2.default)(TileUrlLayer, _Layer);

  function TileUrlLayer() {
    (0, _classCallCheck2.default)(this, TileUrlLayer);
    return (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(TileUrlLayer).apply(this, arguments));
  }

  (0, _createClass2.default)(TileUrlLayer, [{
    key: "getLayerDefinitionType",
    // Gets the type of layer definition ("JsonQLCss"/"TileUrl")
    value: function getLayerDefinitionType() {
      return "TileUrl";
    } // Gets the tile url for definition type "TileUrl"

  }, {
    key: "getTileUrl",
    value: function getTileUrl(design, filters) {
      return design.tileUrl;
    } // Gets the utf grid url for definition type "TileUrl"

  }, {
    key: "getUtfGridUrl",
    value: function getUtfGridUrl(design, filters) {
      return null;
    } // Get min and max zoom levels

  }, {
    key: "getMinZoom",
    value: function getMinZoom(design) {
      return design.minZoom;
    }
  }, {
    key: "getMaxZoom",
    value: function getMaxZoom(design) {
      return design.maxZoom;
    } // True if layer can be edited

  }, {
    key: "isEditable",
    value: function isEditable() {
      return true;
    } // True if layer is incomplete (e.g. brand new) and should be editable immediately

  }, {
    key: "isIncomplete",
    value: function isIncomplete(design, schema) {
      return this.validateDesign(this.cleanDesign(design, schema), schema) != null;
    } // Creates a design element with specified options.
    // Design should be cleaned on the way in and on way out.
    // options:
    //   design: design of layer
    //   schema: schema to use
    //   dataSource: data source to use
    //   onDesignChange: function called when design changes

  }, {
    key: "createDesignerElement",
    value: function createDesignerElement(options) {
      return R(TileUrlLayerDesignerComponent, {
        design: options.design,
        onDesignChange: options.onDesignChange
      });
    } // Returns a cleaned design

  }, {
    key: "cleanDesign",
    value: function cleanDesign(design, schema) {
      return design;
    } // Validates design. Null if ok, message otherwise

  }, {
    key: "validateDesign",
    value: function validateDesign(design, schema) {
      if (!design.tileUrl) {
        return "Missing Url";
      }

      return null;
    }
  }]);
  return TileUrlLayer;
}(Layer);

TileUrlLayerDesignerComponent = function () {
  var TileUrlLayerDesignerComponent =
  /*#__PURE__*/
  function (_React$Component) {
    (0, _inherits2.default)(TileUrlLayerDesignerComponent, _React$Component);

    function TileUrlLayerDesignerComponent() {
      var _this;

      (0, _classCallCheck2.default)(this, TileUrlLayerDesignerComponent);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(TileUrlLayerDesignerComponent).apply(this, arguments));
      _this.handleTileUrlChange = _this.handleTileUrlChange.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)));
      return _this;
    }

    (0, _createClass2.default)(TileUrlLayerDesignerComponent, [{
      key: "handleTileUrlChange",
      value: function handleTileUrlChange(ev) {
        boundMethodCheck(this, TileUrlLayerDesignerComponent);
        return this.props.onDesignChange(_.extend({}, this.props.design, {
          tileUrl: ev.target.value
        }));
      }
    }, {
      key: "render",
      value: function render() {
        // Readonly is non-editable and shows only description
        if (this.props.design.readonly) {
          return null;
        }

        return R('div', {
          className: "form-group"
        }, R('label', {
          className: "text-muted"
        }, "Url (containing {z}, {x} and {y})"), R('input', {
          type: "text",
          className: "form-control",
          value: this.props.design.tileUrl || "",
          onChange: this.handleTileUrlChange
        }));
      }
    }]);
    return TileUrlLayerDesignerComponent;
  }(React.Component);

  ;
  TileUrlLayerDesignerComponent.propTypes = {
    design: PropTypes.object.isRequired,
    // Design of the marker layer
    onDesignChange: PropTypes.func.isRequired // Called with new design

  };
  return TileUrlLayerDesignerComponent;
}.call(void 0);