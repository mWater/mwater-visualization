var LayerFactory, MapDataSource, _, injectTableAlias;

_ = require('lodash');

LayerFactory = require('./LayerFactory');

injectTableAlias = require('mwater-expressions').injectTableAlias;

module.exports = MapDataSource = (function() {
  function MapDataSource() {}

  MapDataSource.prototype.getTileUrl = function(layerId, filters) {
    return null;
  };

  MapDataSource.prototype.getUtfGridUrl = function(layerId, filters) {
    return null;
  };

  return MapDataSource;

})();
