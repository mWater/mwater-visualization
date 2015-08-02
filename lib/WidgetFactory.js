var ChartWidget, LayeredChart, MarkdownWidget, WidgetFactory;

ChartWidget = require('./ChartWidget');

LayeredChart = require('./LayeredChart');

MarkdownWidget = require('./MarkdownWidget');

module.exports = WidgetFactory = (function() {
  function WidgetFactory(schema, dataSource) {
    this.schema = schema;
    this.dataSource = dataSource;
  }

  WidgetFactory.prototype.createWidget = function(type, version, design) {
    var chart;
    switch (type) {
      case "LayeredChart":
        chart = new LayeredChart(this.schema);
        return new ChartWidget(chart, design, this.dataSource);
      case "Markdown":
        return new MarkdownWidget(design);
      default:
        throw new Error("Unknown widget type " + type);
    }
  };

  WidgetFactory.prototype.getNewWidgetsTypes = function() {
    return [
      {
        name: "Chart",
        type: "LayeredChart",
        version: "0.1.0",
        design: {}
      }, {
        name: "Text",
        type: "Markdown",
        version: "0.1.0",
        design: {}
      }
    ];
  };

  return WidgetFactory;

})();
