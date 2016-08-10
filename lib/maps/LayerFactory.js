var AdminChoroplethLayer, AdminIndicatorChoroplethLayer, BufferLayer, LayerFactory, MWaterServerLayer, MarkersLayer, TileUrlLayer;

MWaterServerLayer = require('./MWaterServerLayer');

MarkersLayer = require('./MarkersLayer');

BufferLayer = require('./BufferLayer');

AdminIndicatorChoroplethLayer = require('./AdminIndicatorChoroplethLayer');

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
      case "AdminIndicatorChoropleth":
        return new AdminIndicatorChoroplethLayer();
      case "AdminChoropleth":
        return new AdminChoroplethLayer();
      case "TileUrl":
        return new TileUrlLayer();
    }
    throw new Error("Unknown type " + type);
  };

  return LayerFactory;

})();
