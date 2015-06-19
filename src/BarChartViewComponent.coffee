React = require 'react'
H = React.DOM

module.exports = class BarChartViewComponent extends React.Component
  componentDidMount: ->
    el = React.findDOMNode(@refs.chart)

    # Create chart
    @chart = c3.generate({
        bindto: el
        # data: {
        #   columns: [
        #     ["data1", 30, 200, 100, 400, 150, 250],
        #   ]
        #   type: "bar"
        # }
        legend: { hide: true }
        axis: {
          x: {
            type: 'category'
            categories: ['a', 'b', 'c', 'd']
          }
        }
        size: { width: @props.width, height: @props.height }
    })

    # @chart.unfocus(['data1'], [1,3,5])
    #d3.select(".c3-bars-data1").selectAll(".c3-bar").style("opacity", function(d,i) { return (i==3)?1:0.4 })

  componentWillReceiveProps: (props) ->
    @updateChart(props)

  updateChart: (props) =>
    el = React.findDOMNode(@refs.chart)

  render: ->
    H.div style: { width: @props.width, height: @props.height }, ref: "chart"

# data = [
#   { key: "Asadfsdfa", values: [
#     { x: 2, y: 10 }
#     { x: 1, y: 20 }
#     ]}
  # { key: "sdfsdf", values: [
  #   { x: "apple", y: 14 }
  #   { x: "banana", y: 25 }
  #   ]}
# ]

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
