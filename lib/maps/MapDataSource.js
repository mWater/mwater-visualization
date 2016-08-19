var MapDataSource;

module.exports = MapDataSource = (function() {
  function MapDataSource() {}

  MapDataSource.prototype.getLayerDataSource = function(layerId) {
    throw new Error("Not implemented");
  };

  return MapDataSource;

})();
