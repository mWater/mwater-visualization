ChartWidget = require './charts/ChartWidget'
LayeredChart = require './charts/LayeredChart'
TableChart = require './charts/TableChart'
CalendarChart = require './charts/CalendarChart'
ImageMosaicChart = require './charts/ImageMosaicChart'
MarkdownWidget = require './MarkdownWidget'
MapWidget = require './MapWidget'

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
      when "Markdown"
        return new MarkdownWidget()
      when "Map"
        return new MapWidget()
      else    
        throw new Error("Unknown widget type #{type}")
