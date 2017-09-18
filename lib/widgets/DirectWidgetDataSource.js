var DirectWidgetDataSource;

module.exports = DirectWidgetDataSource = (function() {
  function DirectWidgetDataSource(options) {
    this.options = options;
  }

  DirectWidgetDataSource.prototype.getData = function(design, filters, callback) {
    return this.options.widget.getData(design, this.options.schema, this.options.dataSource, filters, callback);
  };

  DirectWidgetDataSource.prototype.getMapDataSource = function(design) {
    var DirectMapDataSource;
    DirectMapDataSource = require('../maps/DirectMapDataSource');
    return new DirectMapDataSource({
      apiUrl: this.options.apiUrl,
      client: this.options.client,
      design: design,
      schema: this.options.schema,
      dataSource: this.options.dataSource
    });
  };

  DirectWidgetDataSource.prototype.getImageUrl = function(imageId, height) {
    return this.options.dataSource.getImageUrl(imageId, height);
  };

  DirectWidgetDataSource.prototype.clearCache = function() {
    return this.options.dataSource.clearCache();
  };

  DirectWidgetDataSource.prototype.getCacheExpiry = function() {
    return this.options.dataSource.getCacheExpiry();
  };

  return DirectWidgetDataSource;

})();
