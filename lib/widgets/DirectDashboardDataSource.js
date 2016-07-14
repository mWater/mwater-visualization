var DirectDashboardDataSource, DirectWidgetDataSource, WidgetFactory;

WidgetFactory = require('./WidgetFactory');

DirectWidgetDataSource = require('./DirectWidgetDataSource');

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
    return new DirectWidgetDataSource({
      apiUrl: this.apiUrl,
      client: this.client,
      widget: widget,
      design: widgetDesign,
      schema: this.schema,
      dataSource: this.dataSource
    });
  };

  return DirectDashboardDataSource;

})();
