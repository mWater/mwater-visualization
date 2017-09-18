var DashboardDataSource;

module.exports = DashboardDataSource = (function() {
  function DashboardDataSource() {}

  DashboardDataSource.prototype.getWidgetDataSource = function(widgetId) {
    throw new Error("Not implemented");
  };

  DashboardDataSource.prototype.getQuickfiltersDataSource = function() {
    throw new Error("Not implemented");
  };

  DashboardDataSource.prototype.clearCache = function() {};

  DashboardDataSource.prototype.getCacheExpiry = function() {
    return 0;
  };

  return DashboardDataSource;

})();
