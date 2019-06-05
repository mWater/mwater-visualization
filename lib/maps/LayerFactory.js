"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var BufferLayer, ChoroplethLayer, ClusterLayer, HexgridLayer, LayerFactory, MWaterServerLayer, MarkersLayer, SwitchableTileUrlLayer, TileUrlLayer;
MWaterServerLayer = require('./MWaterServerLayer');
MarkersLayer = require('./MarkersLayer');
BufferLayer = require('./BufferLayer');
ChoroplethLayer = require('./ChoroplethLayer').default;
ClusterLayer = require('./ClusterLayer');
TileUrlLayer = require('./TileUrlLayer');
SwitchableTileUrlLayer = require('./SwitchableTileUrlLayer').default;
HexgridLayer = require('./HexgridLayer').default;

module.exports = LayerFactory =
/*#__PURE__*/
function () {
  function LayerFactory() {
    (0, _classCallCheck2.default)(this, LayerFactory);
  }

  (0, _createClass2.default)(LayerFactory, null, [{
    key: "createLayer",
    value: function createLayer(type) {
      switch (type) {
        case "MWaterServer":
          return new MWaterServerLayer();

        case "Markers":
          return new MarkersLayer();

        case "Buffer":
          return new BufferLayer();
        // Uses a legacy type name

        case "AdminChoropleth":
          return new ChoroplethLayer();

        case "Cluster":
          return new ClusterLayer();

        case "TileUrl":
          return new TileUrlLayer();

        case "SwitchableTileUrl":
          return new SwitchableTileUrlLayer();

        case "Hexgrid":
          return new HexgridLayer();
      }

      throw new Error("Unknown type ".concat(type));
    }
  }]);
  return LayerFactory;
}();