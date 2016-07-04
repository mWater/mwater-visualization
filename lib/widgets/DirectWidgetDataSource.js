var DirectMapUrlSource, DirectWidgetDataSource;

DirectMapUrlSource = require('../maps/DirectMapUrlSource');

module.exports = DirectWidgetDataSource = (function() {
  function DirectWidgetDataSource(options) {
    this.apiUrl = options.apiUrl;
    this.widget = options.widget;
    this.design = options.design;
    this.schema = options.schema;
    this.dataSource = options.dataSource;
  }

  DirectWidgetDataSource.prototype.getData = function(filters, callback) {
    return this.widget.getData(this.design, this.schema, this.dataSource, filters, callback);
  };

  DirectWidgetDataSource.prototype.getTileUrl = function(layerId, filters) {
    return new DirectMapUrlSource({
      apiUrl: this.apiUrl,
      client: this.client,
      mapDesign: this.design,
      schema: this.schema
    }).getTileUrl(layerId, filters);
  };

  DirectWidgetDataSource.prototype.getUtfGridUrl = function(layerId, filters) {
    return new DirectMapUrlSource({
      apiUrl: this.apiUrl,
      client: this.client,
      mapDesign: this.design,
      schema: this.schema
    }).getUtfGridUrl(layerId, filters);
  };

  return DirectWidgetDataSource;

})();