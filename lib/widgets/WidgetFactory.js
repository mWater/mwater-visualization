var CalendarChart, ChartWidget, ImageMosaicChart, LayeredChart, MapWidget, MarkdownWidget, TableChart, WidgetFactory;

ChartWidget = require('./charts/ChartWidget');

LayeredChart = require('./charts/LayeredChart');

TableChart = require('./charts/TableChart');

CalendarChart = require('./charts/CalendarChart');

ImageMosaicChart = require('./charts/ImageMosaicChart');

MarkdownWidget = require('./MarkdownWidget');

MapWidget = require('./MapWidget');

module.exports = WidgetFactory = (function() {
  function WidgetFactory() {}

  WidgetFactory.createWidget = function(type) {
    switch (type) {
      case "LayeredChart":
        return new ChartWidget(new LayeredChart());
      case "TableChart":
        return new ChartWidget(new TableChart());
      case "CalendarChart":
        return new ChartWidget(new CalendarChart());
      case "ImageMosaicChart":
        return new ChartWidget(new ImageMosaicChart());
      case "Markdown":
        return new MarkdownWidget();
      case "Map":
        return new MapWidget();
      default:
        throw new Error("Unknown widget type " + type);
    }
  };

  return WidgetFactory;

})();
