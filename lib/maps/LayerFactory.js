var LayerFactory, LegacyLayer;

LegacyLayer = require('./LegacyLayer');

module.exports = LayerFactory = (function() {
  function LayerFactory(options) {
    this.schema = options.schema;
  }

  LayerFactory.prototype.createLayer = function(type, design) {
    switch (type) {
      case "Legacy":
        return new LegacyLayer(design);
    }
    throw new Error("Unknown type " + type);
  };

  return LayerFactory;

})();
