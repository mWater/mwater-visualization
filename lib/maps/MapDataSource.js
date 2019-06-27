"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

// Map data source gives data sources for layers
var MapDataSource;

module.exports = MapDataSource =
/*#__PURE__*/
function () {
  function MapDataSource() {
    (0, _classCallCheck2["default"])(this, MapDataSource);
  }

  (0, _createClass2["default"])(MapDataSource, [{
    key: "getLayerDataSource",
    // Gets the data source for a layer
    value: function getLayerDataSource(layerId) {
      throw new Error("Not implemented");
    } // Gets the bounds for the map. Null for no opinion. Callback as { n:, s:, w:, e: }

  }, {
    key: "getBounds",
    value: function getBounds(design, filters, callback) {
      return callback(null);
    }
  }]);
  return MapDataSource;
}();