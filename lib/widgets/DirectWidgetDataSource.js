var DirectWidgetDataSource;

module.exports = DirectWidgetDataSource = (function() {
  function DirectWidgetDataSource(options) {
    this.options = options;
  }

  DirectWidgetDataSource.prototype.getData = function(filters, callback) {
    return this.options.widget.getData(this.options.design, this.options.schema, this.options.dataSource, filters, callback);
  };

  DirectWidgetDataSource.prototype.getMapDataSource = function() {
    var DirectMapDataSource;
    DirectMapDataSource = require('../maps/DirectMapDataSource');
    return new DirectMapDataSource({
      apiUrl: this.options.apiUrl,
      client: this.options.client,
      design: this.options.design,
      schema: this.options.schema,
      dataSource: this.options.dataSource
    });
  };

  DirectWidgetDataSource.prototype.getImageUrl = function(imageId, height) {
    return this.options.dataSource.getImageUrl(imageId, height);
  };

  return DirectWidgetDataSource;

})();
