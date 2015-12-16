ChartWidget = require './charts/ChartWidget'
LayeredChart = require './charts/LayeredChart'
TableChart = require './charts/TableChart'
CalendarChart = require './charts/CalendarChart'
ImageMosaicChart = require './charts/ImageMosaicChart'
MarkdownWidget = require './MarkdownWidget'
MapWidget = require './MapWidget'

# Creates widgets based on type and design 
module.exports = class WidgetFactory
  # Pass in schema, dataSource, and layerFactory
  constructor: (options) ->
    @schema = options.schema
    @dataSource = options.dataSource
    @layerFactory = options.layerFactory

  createWidget: (type, design) ->
    switch type
      when "LayeredChart"
        # Create chart object
        chart = new LayeredChart(schema: @schema, dataSource: @dataSource)  
        return new ChartWidget(chart, design, @dataSource)
      when "TableChart"
        # Create chart object
        chart = new TableChart(schema: @schema, dataSource: @dataSource)  
        return new ChartWidget(chart, design, @dataSource)
      when "CalendarChart"
        # Create chart object
        chart = new CalendarChart(schema: @schema, dataSource: @dataSource)  
        return new ChartWidget(chart, design, @dataSource)
      when "ImageMosaicChart"
        # Create chart object
        chart = new ImageMosaicChart(schema: @schema, dataSource: @dataSource)  
        return new ChartWidget(chart, design, @dataSource)
      when "Markdown"
        return new MarkdownWidget(design)
      when "Map"
        return new MapWidget(design: design, schema: @schema, dataSource: @dataSource, layerFactory: @layerFactory)
      else    
        throw new Error("Unknown widget type #{type}")


  # Gets list of new widget types. Each contains name, type and design
  getNewWidgetsTypes: ->
    widgetTypes = [
      { name: "Chart", type: "LayeredChart", design: {} }
      { name: "Table", type: "TableChart", design: {} }
      { name: "Calendar", type: "CalendarChart", design: {} }
      { name: "Image Mosaic", type: "ImageMosaicChart", design: {} }
      { name: "Text", type: "Markdown", design: {} }
    ]

    if @layerFactory
      widgetTypes.push({ name: "Map", type: "Map", design: { baseLayer: "bing_road", layerViews: [], filters: {}, bounds: { w: -40, n: 25, e: 40, s: -25 } } })
    
    return widgetTypes