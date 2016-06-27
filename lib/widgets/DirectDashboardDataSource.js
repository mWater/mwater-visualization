var DirectDashboardDataSource, DirectMapUrlSource, DirectWidgetDataSource, WidgetFactory;

WidgetFactory = require('./WidgetFactory');

DirectMapUrlSource = require('../maps/DirectMapUrlSource');

module.exports = DirectDashboardDataSource = (function() {
  function DirectDashboardDataSource(options) {
    this.schema = options.schema;
    this.dataSource = options.dataSource;
    this.design = options.design;
    this.apiUrl = options.apiUrl;
    this.client = options.client;
  }

  DirectDashboardDataSource.prototype.getWidgetDataSource = function(widgetId) {
    var widget, widgetDesign;
    widget = WidgetFactory.createWidget(this.design.items[widgetId].widget.type);
    widgetDesign = this.design.items[widgetId].widget.design;
    return new DirectWidgetDataSource(this.apiUrl, this.client, widget, widgetDesign, this.schema, this.dataSource);
  };

  return DirectDashboardDataSource;

})();

DirectWidgetDataSource = (function() {
  function DirectWidgetDataSource(apiUrl, client, widget, design, schema, dataSource) {
    this.apiUrl = apiUrl;
    this.widget = widget;
    this.design = design;
    this.schema = schema;
    this.dataSource = dataSource;
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
