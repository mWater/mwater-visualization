var ConsoleDataSource;

module.exports = ConsoleDataSource = (function() {
  function ConsoleDataSource() {}

  ConsoleDataSource.prototype.getDashboardTabDataSource = function(tabId) {
    throw new Error("Not implemented");
  };

  ConsoleDataSource.prototype.getMapTabDataSource = function(tabId) {
    throw new Error("Not implemented");
  };

  ConsoleDataSource.prototype.getDatagridTabDataSource = function(tabId) {
    throw new Error("Not implemented");
  };

  ConsoleDataSource.prototype.getDashboardPopupDataSource = function(popupId) {
    throw new Error("Not implemented");
  };

  ConsoleDataSource.prototype.getMapPopupDataSource = function(popupId) {
    throw new Error("Not implemented");
  };

  ConsoleDataSource.prototype.getDatagridPopupDataSource = function(popupId) {
    throw new Error("Not implemented");
  };

  return ConsoleDataSource;

})();
