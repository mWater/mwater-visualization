var Chart;

module.exports = Chart = (function() {
  function Chart() {}

  Chart.prototype.cleanDesign = function(design) {
    throw new Error("Not implemented");
  };

  Chart.prototype.validateDesign = function(design) {
    throw new Error("Not implemented");
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

  return Chart;

})();
