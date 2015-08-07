var ChartWidget, LayeredChart, MapWidget, MarkdownWidget, TableChart, WidgetFactory;

ChartWidget = require('./charts/ChartWidget');

LayeredChart = require('./charts/LayeredChart');

TableChart = require('./charts/TableChart');

MarkdownWidget = require('./MarkdownWidget');

MapWidget = require('./MapWidget');

module.exports = WidgetFactory = (function() {
  function WidgetFactory(schema, dataSource) {
    this.schema = schema;
    this.dataSource = dataSource;
  }

  WidgetFactory.prototype.createWidget = function(type, version, design) {
    var chart;
    switch (type) {
      case "LayeredChart":
        chart = new LayeredChart({
          schema: this.schema
        });
        return new ChartWidget(chart, design, this.dataSource);
      case "TableChart":
        chart = new TableChart({
          schema: this.schema
        });
        return new ChartWidget(chart, design, this.dataSource);
      case "Markdown":
        return new MarkdownWidget(design);
      case "Map":
        return new MapWidget(design);
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
        name: "Table",
        type: "TableChart",
        version: "0.1.0",
        design: {}
      }, {
        name: "Text",
        type: "Markdown",
        version: "0.1.0",
        design: {}
      }, {
        name: "Map",
        type: "Map",
        version: "0.1.0",
        design: {}
      }
    ];
  };

  return WidgetFactory;

})();
