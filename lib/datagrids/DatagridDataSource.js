var DashboardDataSource;

module.exports = DashboardDataSource = (function() {
  function DashboardDataSource() {}

  DashboardDataSource.prototype.getRows = function(design, offset, limit, filters, callback) {
    throw new Error("Not implemented");
  };

  return DashboardDataSource;

})();
