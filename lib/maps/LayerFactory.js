var AdminChoroplethLayer, BufferLayer, LayerFactory, MWaterServerLayer, MarkersLayer, TileUrlLayer;

MWaterServerLayer = require('./MWaterServerLayer');

MarkersLayer = require('./MarkersLayer');

BufferLayer = require('./BufferLayer');

AdminChoroplethLayer = require('./AdminChoroplethLayer');

TileUrlLayer = require('./TileUrlLayer');

module.exports = LayerFactory = (function() {
  function LayerFactory() {}

  LayerFactory.createLayer = function(type) {
    switch (type) {
      case "MWaterServer":
        return new MWaterServerLayer();
      case "Markers":
        return new MarkersLayer();
      case "Buffer":
        return new BufferLayer();
      case "AdminChoropleth":
        return new AdminChoroplethLayer();
      case "TileUrl":
        return new TileUrlLayer();
    }
    throw new Error("Unknown type " + type);
  };

  return LayerFactory;

})();
