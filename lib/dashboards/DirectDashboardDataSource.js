var DirectDashboardDataSource, DirectWidgetDataSource, LayoutManager, WidgetFactory;

WidgetFactory = require('../widgets/WidgetFactory');

DirectWidgetDataSource = require('../widgets/DirectWidgetDataSource');

LayoutManager = require('../layouts/LayoutManager');

module.exports = DirectDashboardDataSource = (function() {
  function DirectDashboardDataSource(options) {
    this.schema = options.schema;
    this.dataSource = options.dataSource;
    this.design = options.design;
    this.apiUrl = options.apiUrl;
    this.client = options.client;
  }

  DirectDashboardDataSource.prototype.getWidgetDataSource = function(widgetId) {
    var design, ref, type, widget;
    ref = LayoutManager.createLayoutManager(this.design.layout).getWidgetTypeAndDesign(this.design.items, widgetId), type = ref.type, design = ref.design;
    widget = WidgetFactory.createWidget(type);
    return new DirectWidgetDataSource({
      apiUrl: this.apiUrl,
      client: this.client,
      widget: widget,
      design: design,
      schema: this.schema,
      dataSource: this.dataSource
    });
  };

  return DirectDashboardDataSource;

})();
