ChartWidget = require './charts/ChartWidget'
LayeredChart = require './charts/layered/LayeredChart'
TableChart = require './charts/table/TableChart'
CalendarChart = require './charts/calendar/CalendarChart'
ImageMosaicChart = require './charts/imagemosaic/ImageMosaicChart'
PivotChart = require './charts/pivot/PivotChart'
MarkdownWidget = require './MarkdownWidget'
TextWidget = require './text/TextWidget'
ImageWidget = require './ImageWidget'
MapWidget = require './MapWidget'
IFrameWidget = require './IFrameWidget'
TOCWidget = require './TOCWidget'

widgetTypes = {
  LayeredChart: new ChartWidget(new LayeredChart())
  TableChart: new ChartWidget(new TableChart())
  CalendarChart: new ChartWidget(new CalendarChart())
  ImageMosaicChart: new ChartWidget(new ImageMosaicChart())
  PivotChart: new ChartWidget(new PivotChart())
  Markdown: new MarkdownWidget()
  Map: new MapWidget()
  Text: new TextWidget()
  Image: new ImageWidget()
  IFrame: new IFrameWidget()
  TOC: new TOCWidget()
}

# Creates widgets based on type 
module.exports = class WidgetFactory
  @createWidget: (type) ->
    if widgetTypes[type]
      return widgetTypes[type]
    throw new Error("Unknown widget type #{type}")
