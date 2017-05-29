var MapDataSource;

module.exports = MapDataSource = (function() {
  function MapDataSource() {}

  MapDataSource.prototype.getLayerDataSource = function(layerId) {
    throw new Error("Not implemented");
  };

  MapDataSource.prototype.getBounds = function(design, filters, callback) {
    return callback(null);
  };

  MapDataSource.prototype.getPrintUrl = function(design, scale) {
    throw new Error("Not implemented");
  };

  return MapDataSource;

})();
