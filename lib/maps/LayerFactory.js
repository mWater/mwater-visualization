var AdminChoroplethLayer, AdminIndicatorChoroplethLayer, BufferLayer, LayerFactory, MWaterServerLayer, MarkersLayer;

MWaterServerLayer = require('./MWaterServerLayer');

MarkersLayer = require('./MarkersLayer');

BufferLayer = require('./BufferLayer');

AdminIndicatorChoroplethLayer = require('./AdminIndicatorChoroplethLayer');

AdminChoroplethLayer = require('./AdminChoroplethLayer');

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
    }
    throw new Error("Unknown type " + type);
  };

  return LayerFactory;

})();
