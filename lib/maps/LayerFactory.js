var LayerFactory, MWaterServerLayer, MarkersLayer;

MWaterServerLayer = require('./MWaterServerLayer');

MarkersLayer = require('./MarkersLayer');

module.exports = LayerFactory = (function() {
  function LayerFactory(options) {
    this.schema = options.schema;
    this.dataSource = options.dataSource;
    this.client = options.client;
    this.apiUrl = options.apiUrl;
    this.newLayers = options.newLayers;
    this.onMarkerClick = options.onMarkerClick;
  }

  LayerFactory.prototype.createLayer = function(type, design) {
    switch (type) {
      case "MWaterServer":
        return new MWaterServerLayer({
          design: design,
          dataSource: this.dataSource,
          client: this.client,
          apiUrl: this.apiUrl,
          onMarkerClick: this.onMarkerClick
        });
      case "Markers":
        return new MarkersLayer({
          design: design,
          client: this.client,
          apiUrl: this.apiUrl,
          schema: this.schema,
          dataSource: this.dataSource,
          onMarkerClick: this.onMarkerClick
        });
    }
    throw new Error("Unknown type " + type);
  };

  LayerFactory.prototype.getNewLayers = function() {
    return this.newLayers;
  };

  return LayerFactory;

})();
