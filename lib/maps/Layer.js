var Layer;

module.exports = Layer = (function() {
  function Layer() {}

  Layer.prototype.getTileUrl = function(filters) {
    throw new Error("Not implemented");
  };

  Layer.prototype.getUtfGridUrl = function(filters) {
    return null;
  };

  Layer.prototype.onGridClick = function(ev) {};

  Layer.prototype.getMinZoom = function() {};

  Layer.prototype.getMaxZoom = function() {};

  Layer.prototype.getLegend = function() {
    return null;
  };

  Layer.prototype.getFilterableTables = function() {
    return [];
  };

  Layer.prototype.isEditable = function() {
    return false;
  };

  Layer.prototype.createDesignerElement = function(options) {
    throw new Error("Not implemented");
  };

  return Layer;

})();
