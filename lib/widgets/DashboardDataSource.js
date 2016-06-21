var DashboardDataSource;

module.exports = DashboardDataSource = (function() {
  function DashboardDataSource() {}

  DashboardDataSource.prototype.getWidgetDataSource = function(widgetId) {
    throw new Error("Not implemented");
  };

  return DashboardDataSource;

})();
