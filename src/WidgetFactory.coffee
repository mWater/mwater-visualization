ChartWidget = require './ChartWidget'
LayeredChart = require './LayeredChart'
TableChart = require './TableChart'
MarkdownWidget = require './MarkdownWidget'
MapWidget = require './MapWidget'

# Creates widgets based on type, version and design 
module.exports = class WidgetFactory
  constructor: (schema, dataSource) ->
    @schema = schema
    @dataSource = dataSource

  createWidget: (type, version, design) ->
    switch type
      when "LayeredChart"
        # Create chart object
        chart = new LayeredChart(schema: @schema)  
        return new ChartWidget(chart, design, @dataSource)
      when "TableChart"
        # Create chart object
        chart = new TableChart(schema: @schema)  
        return new ChartWidget(chart, design, @dataSource)
      when "Markdown"
        return new MarkdownWidget(design)
      when "Map"
        return new MapWidget(design)
      else    
        throw new Error("Unknown widget type #{type}")


  # Gets list of new widget types. Each contains name, type, version and design
  getNewWidgetsTypes: ->
    return [
      { name: "Chart", type: "LayeredChart", version: "0.1.0", design: {} }
      { name: "Table", type: "TableChart", version: "0.1.0", design: {} }
      { name: "Text", type: "Markdown", version: "0.1.0", design: {} }
      { name: "Map", type: "Map", version: "0.1.0", design: {} }
    ]