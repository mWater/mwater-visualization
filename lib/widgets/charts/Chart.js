var Chart;

module.exports = Chart = (function() {
  function Chart() {}

  Chart.prototype.cleanDesign = function(design, schema) {
    throw new Error("Not implemented");
  };

  Chart.prototype.validateDesign = function(design, schema) {
    throw new Error("Not implemented");
  };

  Chart.prototype.isEmpty = function(design) {
    return false;
  };

  Chart.prototype.createDesignerElement = function(options) {
    throw new Error("Not implemented");
  };

  Chart.prototype.getData = function(design, schema, dataSource, filters, callback) {
    throw new Error("Not implemented");
  };

  Chart.prototype.createViewElement = function(options) {
    throw new Error("Not implemented");
  };

  Chart.prototype.createDropdownItems = function(design, schema, widgetDataSource, filters) {
    return [];
  };

  Chart.prototype.createDataTable = function(design, schema, dataSource, data, locale) {
    throw new Error("Not implemented");
  };

  Chart.prototype.getFilterableTables = function(design, schema) {
    throw new Error("Not implemented");
  };

  return Chart;

})();
