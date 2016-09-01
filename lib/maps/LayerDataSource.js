var LayerDataSource;

module.exports = LayerDataSource = (function() {
  function LayerDataSource() {}

  LayerDataSource.prototype.getTileUrl = function(design, filters) {
    return null;
  };

  LayerDataSource.prototype.getUtfGridUrl = function(design, filters) {
    return null;
  };

  LayerDataSource.prototype.getPopupWidgetDataSource = function(design, widgetId) {
    return null;
  };

  return LayerDataSource;

})();
