ChartWidget = require './charts/ChartWidget'
LayeredChart = require './charts/LayeredChart'
TableChart = require './charts/TableChart'
MarkdownWidget = require './MarkdownWidget'
MapWidget = require './MapWidget'

# Creates widgets based on type and design 
module.exports = class WidgetFactory
  constructor: (schema, dataSource) ->
    @schema = schema
    @dataSource = dataSource

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
      when "Markdown"
        return new MarkdownWidget(design)
      when "Map"
        return new MapWidget(design)
      else    
        throw new Error("Unknown widget type #{type}")


  # Gets list of new widget types. Each contains name, type and design
  getNewWidgetsTypes: ->
    return [
      { name: "Chart", type: "LayeredChart", design: {} }
      { name: "Table", type: "TableChart", design: {} }
      { name: "Text", type: "Markdown", design: {} }
      # { name: "Map", type: "Map", design: {} }
    ]