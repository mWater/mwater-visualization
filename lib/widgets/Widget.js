var Widget;

module.exports = Widget = (function() {
  function Widget() {}

  Widget.prototype.createViewElement = function(options) {
    throw new Error("Not implemented");
  };

  Widget.prototype.getData = function(design, schema, dataSource, filters, callback) {
    throw new Error("Not implemented");
  };

  Widget.prototype.isAutoHeight = function() {
    return false;
  };

  Widget.prototype.getFilterableTables = function(design, schema) {
    return [];
  };

  return Widget;

})();
