var Layer;

module.exports = Layer = (function() {
  function Layer() {}

  Layer.prototype.getTileUrl = function(filters) {
    throw new Error("Not implemented");
  };

  Layer.prototype.getUtfGridUrl = function(filters) {
    return null;
  };

  Layer.prototype.getLegend = function() {
    return null;
  };

  Layer.prototype.getFilterableTables = function() {
    return [];
  };

  return Layer;

})();
