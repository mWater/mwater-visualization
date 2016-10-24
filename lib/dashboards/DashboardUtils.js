var DashboardUtils, LayoutManager, WidgetFactory;

LayoutManager = require('../layouts/LayoutManager');

WidgetFactory = require('../widgets/WidgetFactory');

module.exports = DashboardUtils = (function() {
  function DashboardUtils() {}

  DashboardUtils.getFilterableTables = function(design, schema) {
    var filterableTables, i, layoutManager, len, ref, widget, widgetItem;
    layoutManager = LayoutManager.createLayoutManager(design.layout);
    filterableTables = [];
    ref = layoutManager.getAllWidgets(design.items);
    for (i = 0, len = ref.length; i < len; i++) {
      widgetItem = ref[i];
      widget = WidgetFactory.createWidget(widgetItem.type);
      filterableTables = filterableTables.concat(widget.getFilterableTables(widgetItem.design, schema));
    }
    return filterableTables = _.filter(_.uniq(filterableTables), (function(_this) {
      return function(table) {
        return schema.getTable(table);
      };
    })(this));
  };

  return DashboardUtils;

})();
