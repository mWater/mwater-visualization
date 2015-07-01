var BarChart, ChartWidget, WidgetFactory;

BarChart = require('./BarChart');

ChartWidget = require('./ChartWidget');

module.exports = WidgetFactory = (function() {
  function WidgetFactory(schema, dataSource) {
    this.schema = schema;
    this.dataSource = dataSource;
  }

  WidgetFactory.prototype.createWidget = function(type, version, design) {
    var chart;
    switch (type) {
      case "BarChart":
        chart = new BarChart(this.schema);
        return new ChartWidget(chart, design, this.dataSource);
      default:
        throw new Error("Unknown widget type " + type);
    }
  };

  return WidgetFactory;

})();
