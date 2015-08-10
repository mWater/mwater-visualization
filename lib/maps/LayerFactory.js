var LayerFactory, LegacyLayer;

LegacyLayer = require('./LegacyLayer');

module.exports = LayerFactory = (function() {
  function LayerFactory(options) {
    this.schema = options.schema;
    this.client = options.client;
  }

  LayerFactory.prototype.createLayer = function(type, design) {
    switch (type) {
      case "Legacy":
        return new LegacyLayer(design, this.schema, this.client);
    }
    throw new Error("Unknown type " + type);
  };

  return LayerFactory;

})();
