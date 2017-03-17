var CalendarChart, ChartWidget, IFrameWidget, ImageMosaicChart, ImageWidget, LayeredChart, MapWidget, MarkdownWidget, PivotChart, TableChart, TextWidget, WidgetFactory;

ChartWidget = require('./charts/ChartWidget');

LayeredChart = require('./charts/layered/LayeredChart');

TableChart = require('./charts/table/TableChart');

CalendarChart = require('./charts/calendar/CalendarChart');

ImageMosaicChart = require('./charts/imagemosaic/ImageMosaicChart');

PivotChart = require('./charts/pivot/PivotChart');

MarkdownWidget = require('./MarkdownWidget');

TextWidget = require('./text/TextWidget');

ImageWidget = require('./ImageWidget');

MapWidget = require('./MapWidget');

IFrameWidget = require('./IFrameWidget');

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
      case "PivotChart":
        return new ChartWidget(new PivotChart());
      case "Markdown":
        return new MarkdownWidget();
      case "Map":
        return new MapWidget();
      case "Text":
        return new TextWidget();
      case "Image":
        return new ImageWidget();
      case "IFrame":
        return new IFrameWidget();
      default:
        throw new Error("Unknown widget type " + type);
    }
  };

  return WidgetFactory;

})();
