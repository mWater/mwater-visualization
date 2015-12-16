var CalendarChart, ChartWidget, LayeredChart, MapWidget, MarkdownWidget, TableChart, WidgetFactory;

ChartWidget = require('./charts/ChartWidget');

LayeredChart = require('./charts/LayeredChart');

TableChart = require('./charts/TableChart');

CalendarChart = require('./charts/CalendarChart');

MarkdownWidget = require('./MarkdownWidget');

MapWidget = require('./MapWidget');

module.exports = WidgetFactory = (function() {
  function WidgetFactory(options) {
    this.schema = options.schema;
    this.dataSource = options.dataSource;
    this.layerFactory = options.layerFactory;
  }

  WidgetFactory.prototype.createWidget = function(type, design) {
    var chart;
    switch (type) {
      case "LayeredChart":
        chart = new LayeredChart({
          schema: this.schema,
          dataSource: this.dataSource
        });
        return new ChartWidget(chart, design, this.dataSource);
      case "TableChart":
        chart = new TableChart({
          schema: this.schema,
          dataSource: this.dataSource
        });
        return new ChartWidget(chart, design, this.dataSource);
      case "CalendarChart":
        chart = new CalendarChart({
          schema: this.schema,
          dataSource: this.dataSource
        });
        return new ChartWidget(chart, design, this.dataSource);
      case "Markdown":
        return new MarkdownWidget(design);
      case "Map":
        return new MapWidget({
          design: design,
          schema: this.schema,
          dataSource: this.dataSource,
          layerFactory: this.layerFactory
        });
      default:
        throw new Error("Unknown widget type " + type);
    }
  };

  WidgetFactory.prototype.getNewWidgetsTypes = function() {
    var widgetTypes;
    widgetTypes = [
      {
        name: "Chart",
        type: "LayeredChart",
        design: {}
      }, {
        name: "Table",
        type: "TableChart",
        design: {}
      }, {
        name: "Calendar",
        type: "CalendarChart",
        design: {}
      }, {
        name: "Text",
        type: "Markdown",
        design: {}
      }
    ];
    if (this.layerFactory) {
      widgetTypes.push({
        name: "Map",
        type: "Map",
        design: {
          baseLayer: "bing_road",
          layerViews: [],
          filters: {},
          bounds: {
            w: -40,
            n: 25,
            e: 40,
            s: -25
          }
        }
      });
    }
    return widgetTypes;
  };

  return WidgetFactory;

})();
