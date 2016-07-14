var Layer;

module.exports = Layer = (function() {
  function Layer() {}

  Layer.prototype.getJsonQLCss = function(design, schema, filters) {
    throw new Error("Not implemented");
  };

  Layer.prototype.onGridClick = function(ev, options) {
    return null;
  };

  Layer.prototype.getMinZoom = function(design) {
    return null;
  };

  Layer.prototype.getMaxZoom = function(design) {
    return null;
  };

  Layer.prototype.getLegend = function(design, schema) {
    return null;
  };

  Layer.prototype.getFilterableTables = function(design, schema) {
    return [];
  };

  Layer.prototype.isEditable = function(design, schema) {
    return false;
  };

  Layer.prototype.isIncomplete = function(design, schema) {
    return this.validateDesign(this.cleanDesign(design, schema), schema) != null;
  };

  Layer.prototype.createDesignerElement = function(options) {
    throw new Error("Not implemented");
  };

  Layer.prototype.cleanDesign = function(design, schema) {
    return design;
  };

  Layer.prototype.validateDesign = function(design, schema) {
    return null;
  };

  Layer.prototype.getKMLExportJsonQL = function(design, schema, filters) {
    throw new Error("Not implemented");
  };

  return Layer;

})();
