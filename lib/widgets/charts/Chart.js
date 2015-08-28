var Chart;

module.exports = Chart = (function() {
  function Chart() {}

  Chart.prototype.cleanDesign = function(design) {
    throw new Error("Not implemented");
  };

  Chart.prototype.validateDesign = function(design) {
    throw new Error("Not implemented");
  };

  Chart.prototype.isEmpty = function(design) {
    return false;
  };

  Chart.prototype.createDesignerElement = function(options) {
    throw new Error("Not implemented");
  };

  Chart.prototype.createQueries = function(design, filters) {
    throw new Error("Not implemented");
  };

  Chart.prototype.createViewElement = function(options) {
    throw new Error("Not implemented");
  };

  Chart.prototype.createDropdownItems = function(design, dataSource, filters) {
    return [];
  };

  Chart.prototype.createDataTable = function(design, data) {
    throw new Error("Not implemented");
  };

  return Chart;

})();
