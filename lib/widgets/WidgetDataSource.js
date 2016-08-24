var WidgetDataSource;

module.exports = WidgetDataSource = (function() {
  function WidgetDataSource() {}

  WidgetDataSource.prototype.getData = function(design, filters, callback) {
    throw new Error("Not implemented");
  };

  WidgetDataSource.prototype.getMapDataSource = function(design) {
    throw new Error("Not implemented");
  };

  WidgetDataSource.prototype.getImageUrl = function(imageId, height) {
    throw new Error("Not implemented");
  };

  return WidgetDataSource;

})();
