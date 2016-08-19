var WidgetDataSource;

module.exports = WidgetDataSource = (function() {
  function WidgetDataSource() {}

  WidgetDataSource.prototype.getData = function(filters, callback) {
    throw new Error("Not implemented");
  };

  WidgetDataSource.prototype.getMapDataSource = function() {
    throw new Error("Not implemented");
  };

  WidgetDataSource.prototype.getImageUrl = function(imageId, height) {
    throw new Error("Not implemented");
  };

  return WidgetDataSource;

})();
