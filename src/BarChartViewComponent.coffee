React = require 'react'
H = React.DOM

module.exports = class BarChartViewComponent extends React.Component
  componentDidMount: ->
    el = React.findDOMNode(@refs.chart)

    # nv.addGraph =>
    #   chart = nv.models.discreteBarChart()
    #       .x((d) -> d.label)
    #       .y((d) -> d.value)
    #       .staggerLabels(true)
    #       #.staggerLabels(historicalBarChart[0].values.length > 8)
    #       .showValues(true)
    #       .duration(250)
    #       # .height(200)
    #       # .width(300)
    nv.addGraph =>
      chart = nv.models.multiBarChart()
          # .x((d) -> d.label)
          # .y((d) -> d.value)
          # .staggerLabels(true)
          #.staggerLabels(historicalBarChart[0].values.length > 8)
          # .showValues(true)
          .stacked(true)
          .showControls(false)
          .duration(250)
          # .height(200)
          # .width(300)

          
      d3.select(el)
          .datum(data)
          .call(chart)
      # nv.utils.windowResize(chart.update)
      # return ChartTestComponent

  render: ->
    H.div style: { width: @props.width, height: @props.height }, 
      H.svg ref: "chart"

data = [
  { key: "Asadfsdfa", values: [
    { x: 2, y: 10 }
    { x: 1, y: 20 }
    ]}
  # { key: "sdfsdf", values: [
  #   { x: "apple", y: 14 }
  #   { x: "banana", y: 25 }
  #   ]}
]

# data = [
#   { key: "Asadfsdfa", values: [
#     { x: "apple", y: 10 }
#     { x: "banana", y: 20 }
#     ]}
#   # { key: "sdfsdf", values: [
#   #   { x: "apple", y: 14 }
#   #   { x: "banana", y: 25 }
#   #   ]}
# ]
