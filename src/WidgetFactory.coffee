ChartWidget = require './ChartWidget'
LayeredChart = require './LayeredChart'
MarkdownWidget = require './MarkdownWidget'

# Creates widgets based on type, version and design 
module.exports = class WidgetFactory
  constructor: (schema, dataSource) ->
    @schema = schema
    @dataSource = dataSource

  createWidget: (type, version, design) ->
    switch type
      when "LayeredChart"
        # Create chart object
        chart = new LayeredChart(@schema)  
        return new ChartWidget(chart, design, @dataSource)
      when "Markdown"
        return new MarkdownWidget(design)
      else    
        throw new Error("Unknown widget type #{type}")


  # Gets list of new widget types. Each contains name, type, version and design
  getNewWidgetsTypes: ->
    return [
      { name: "Chart", type: "LayeredChart", version: "0.1.0", design: {} }
      { name: "Text", type: "Markdown", version: "0.1.0", design: {} }
    ]