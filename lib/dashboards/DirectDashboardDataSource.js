var DirectDashboardDataSource, DirectWidgetDataSource, LayoutManager, QuickfilterUtils, WidgetFactory;

WidgetFactory = require('../widgets/WidgetFactory');

DirectWidgetDataSource = require('../widgets/DirectWidgetDataSource');

LayoutManager = require('../layouts/LayoutManager');

QuickfilterUtils = require('../quickfilter/QuickfilterUtils');

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
      schema: this.options.schema,
      dataSource: this.options.dataSource
    });
  };

  DirectDashboardDataSource.prototype.getQuickfiltersDataSource = function() {
    return {
      getValues: (function(_this) {
        return function(index, expr, filters, offset, limit, callback) {
          return QuickfilterUtils.findExprValues(expr, _this.options.schema, _this.options.dataSource, filters, offset, limit, callback);
        };
      })(this)
    };
  };

  DirectDashboardDataSource.prototype.clearCache = function() {
    return this.options.dataSource.clearCache();
  };

  DirectDashboardDataSource.prototype.getCacheExpiry = function() {
    var base;
    return typeof (base = this.options.dataSource).getCacheExpiry === "function" ? base.getCacheExpiry() : void 0;
  };

  return DirectDashboardDataSource;

})();
