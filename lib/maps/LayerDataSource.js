"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

// Data source for a layer of a map. Gives urls, popup data 
var LayerDataSource;

module.exports = LayerDataSource = /*#__PURE__*/function () {
  function LayerDataSource() {
    (0, _classCallCheck2["default"])(this, LayerDataSource);
  }

  (0, _createClass2["default"])(LayerDataSource, [{
    key: "getTileUrl",
    // Get the url for the image tiles with the specified filters applied
    // Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
    // Only called on layers that are valid
    value: function getTileUrl(design, filters) {
      return null;
    } // Get the url for the interactivity tiles with the specified filters applied
    // Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
    // Only called on layers that are valid

  }, {
    key: "getUtfGridUrl",
    value: function getUtfGridUrl(design, filters) {
      return null;
    } // Gets widget data source for a popup widget

  }, {
    key: "getPopupWidgetDataSource",
    value: function getPopupWidgetDataSource(design, widgetId) {
      return null;
    }
  }]);
  return LayerDataSource;
}();