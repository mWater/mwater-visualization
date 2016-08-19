var DirectDashboardDataSource, DirectWidgetDataSource, LayoutManager, WidgetFactory;

WidgetFactory = require('../widgets/WidgetFactory');

DirectWidgetDataSource = require('../widgets/DirectWidgetDataSource');

LayoutManager = require('../layouts/LayoutManager');

module.exports = DirectDashboardDataSource = (function() {
  function DirectDashboardDataSource(options) {
    this.options = options;
  }

  DirectDashboardDataSource.prototype.getWidgetDataSource = function(widgetId) {
    var design, ref, type, widget;
    ref = LayoutManager.createLayoutManager(this.options.design.layout).getWidgetTypeAndDesign(this.options.design.items, widgetId), type = ref.type, design = ref.design;
    widget = WidgetFactory.createWidget(type);
    return new DirectWidgetDataSource({
      apiUrl: this.options.apiUrl,
      client: this.options.client,
      widget: widget,
      design: design,
      schema: this.options.schema,
      dataSource: this.options.dataSource
    });
  };

  return DirectDashboardDataSource;

})();
