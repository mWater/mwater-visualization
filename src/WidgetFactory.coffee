ChartWidget = require './ChartWidget'
BarChart = require './BarChart'
LayeredChart = require './LayeredChart'

# Creates widgets based on type, version and design 
module.exports = class WidgetFactory
  constructor: (schema, dataSource) ->
    @schema = schema
    @dataSource = dataSource

  createWidget: (type, version, design) ->
    switch type
      when "BarChart"
        # Create chart object
        chart = new BarChart(@schema)  
        return new ChartWidget(chart, design, @dataSource)
      when "LayeredChart"
        # Create chart object
        chart = new LayeredChart(@schema)  
        return new ChartWidget(chart, design, @dataSource)
      else    
        throw new Error("Unknown widget type #{type}")

