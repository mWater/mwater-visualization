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

# Creates widgets based on type 
module.exports = class WidgetFactory
  @createWidget: (type) ->
    switch type
      when "LayeredChart"
        return new ChartWidget(new LayeredChart())
      when "TableChart"
        return new ChartWidget(new TableChart())
      when "CalendarChart"
        return new ChartWidget(new CalendarChart())
      when "ImageMosaicChart"
        return new ChartWidget(new ImageMosaicChart())
      when "PivotChart"
        return new ChartWidget(new PivotChart())
      when "Markdown"
        return new MarkdownWidget()
      when "Map"
        return new MapWidget()
      when "Text"
        return new TextWidget()
      when "Image"
        return new ImageWidget()
      when "IFrame"
        return new IFrameWidget()
      when "TOC"
        return new TOCWidget()
      else    
        throw new Error("Unknown widget type #{type}")
