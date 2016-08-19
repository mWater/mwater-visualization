var LayerDataSource;

module.exports = LayerDataSource = (function() {
  function LayerDataSource() {}

  LayerDataSource.prototype.getTileUrl = function(filters) {
    return null;
  };

  LayerDataSource.prototype.getUtfGridUrl = function(filters) {
    return null;
  };

  LayerDataSource.prototype.getPopupWidgetDataSource = function(widgetId) {
    return null;
  };

  return LayerDataSource;

})();
