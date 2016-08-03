var DirectMapDataSource, DirectWidgetDataSource;

DirectMapDataSource = require('../maps/DirectMapDataSource');

module.exports = DirectWidgetDataSource = (function() {
  function DirectWidgetDataSource(options) {
    this.apiUrl = options.apiUrl;
    this.widget = options.widget;
    this.design = options.design;
    this.schema = options.schema;
    this.dataSource = options.dataSource;
    this.client = options.client;
  }

  DirectWidgetDataSource.prototype.getData = function(filters, callback) {
    return this.widget.getData(this.design, this.schema, this.dataSource, filters, callback);
  };

  DirectWidgetDataSource.prototype.getTileUrl = function(layerId, filters) {
    return new DirectMapDataSource({
      apiUrl: this.apiUrl,
      client: this.client,
      mapDesign: this.design,
      schema: this.schema
    }).getTileUrl(layerId, filters);
  };

  DirectWidgetDataSource.prototype.getUtfGridUrl = function(layerId, filters) {
    return new DirectMapDataSource({
      apiUrl: this.apiUrl,
      client: this.client,
      mapDesign: this.design,
      schema: this.schema
    }).getUtfGridUrl(layerId, filters);
  };

  return DirectWidgetDataSource;

})();
