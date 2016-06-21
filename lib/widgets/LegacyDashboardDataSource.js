var LegacyDashboardDataSource, LegacyMapUrlSource, LegacyWidgetDataSource, WidgetFactory;

WidgetFactory = require('./WidgetFactory');

LegacyMapUrlSource = require('../maps/LegacyMapUrlSource');

module.exports = LegacyDashboardDataSource = (function() {
  function LegacyDashboardDataSource(apiUrl, client, design, schema, dataSource) {
    this.apiUrl = apiUrl;
    this.client = client;
    this.design = design;
    this.schema = schema;
    this.dataSource = dataSource;
  }

  LegacyDashboardDataSource.prototype.getWidgetDataSource = function(widgetId) {
    var widget, widgetDesign;
    widget = WidgetFactory.createWidget(this.design.items[widgetId].widget.type);
    widgetDesign = this.design.items[widgetId].widget.design;
    return new LegacyWidgetDataSource(this.apiUrl, this.client, widget, widgetDesign, this.schema, this.dataSource);
  };

  return LegacyDashboardDataSource;

})();

LegacyWidgetDataSource = (function() {
  function LegacyWidgetDataSource(apiUrl, client, widget, design, schema, dataSource) {
    this.apiUrl = apiUrl;
    this.widget = widget;
    this.design = design;
    this.schema = schema;
    this.dataSource = dataSource;
  }

  LegacyWidgetDataSource.prototype.getData = function(filters, callback) {
    return this.widget.getData(this.design, this.schema, this.dataSource, filters, callback);
  };

  LegacyWidgetDataSource.prototype.getTileUrl = function(layerId, filters) {
    return new LegacyMapUrlSource({
      apiUrl: this.apiUrl,
      client: this.client,
      mapDesign: this.design,
      schema: this.schema
    }).getTileUrl(layerId, filters);
  };

  LegacyWidgetDataSource.prototype.getUtfGridUrl = function(layerId, filters) {
    return new LegacyMapUrlSource({
      apiUrl: this.apiUrl,
      client: this.client,
      mapDesign: this.design,
      schema: this.schema
    }).getUtfGridUrl(layerId, filters);
  };

  return LegacyWidgetDataSource;

})();
