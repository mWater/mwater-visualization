var DirectDashboardDataSource, DirectWidgetDataSource, LayoutManager, WidgetFactory,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

WidgetFactory = require('../widgets/WidgetFactory');

DirectWidgetDataSource = require('../widgets/DirectWidgetDataSource');

LayoutManager = require('../layouts/LayoutManager');

module.exports = DirectDashboardDataSource = (function() {
  function DirectDashboardDataSource(options) {
    this._getPopupDashboardDataSource = bind(this._getPopupDashboardDataSource, this);
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
      dataSource: this.options.dataSource,
      popupDashboardDataSourceFactory: this._getPopupDashboardDataSource
    });
  };

  DirectDashboardDataSource.prototype._getPopupDashboardDataSource = function(popupId) {
    var popup;
    popup = _.findWhere(this.options.design.popups || [], {
      id: popupId
    });
    if (!popup) {
      throw new Error("Popup " + popupId + " not found");
    }
    return new DirectDashboardDataSource({
      schema: this.options.schema,
      dataSource: this.options.dataSource,
      design: popup.design,
      apiUrl: this.options.apiUrl,
      client: this.options.client
    });
  };

  return DirectDashboardDataSource;

})();
