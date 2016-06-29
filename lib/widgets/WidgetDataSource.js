var WidgetDataSource;

module.exports = WidgetDataSource = (function() {
  function WidgetDataSource() {}

  WidgetDataSource.prototype.getData = function(filters, callback) {
    throw new Error("Not implemented");
  };

  WidgetDataSource.prototype.getTileUrl = function(layerId, filters) {
    throw new Error("Not implemented");
  };

  WidgetDataSource.prototype.getUtfGridUrl = function(layerId, filters) {
    throw new Error("Not implemented");
  };

  return WidgetDataSource;

})();
