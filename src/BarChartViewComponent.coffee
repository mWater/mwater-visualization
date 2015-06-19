React = require 'react'
H = React.DOM

module.exports = class BarChartViewComponent extends React.Component
  constructor: ->
    super
    @state = { selected: null }

  componentDidMount: ->
    el = React.findDOMNode(@refs.chart)

    # Create chart
    console.log @props.data
    @chart = c3.generate({
        bindto: el
        data: {
          type: "bar"
          json: @props.data
          keys: { x: "x", value: ["y"] }
          names: { y: 'Value' } # Name the data
          onclick: @handleDataClick
        }
        legend: { hide: true } # No need for simple bar chart
        grid: { focus: { show: false } }  # Don't display hover grid
        axis: {
          x: {
            type: 'category'
          }
          # rotated: true
        }
        size: { width: @props.width, height: @props.height }
    })

    @updateSelected()

  componentWillReceiveProps: (props) ->
    # Reload data
    @chart.load({ 
      json: props.data
      keys: { x: "x", value: ["y"] }
      names: { y: 'Value' } # Name the data
    })
    @setState(selected: null)

  # Update selected value
  updateSelected: =>
    d3.select(React.findDOMNode(@refs.chart))
      .select(".c3-bars-y") # Get bars
      .selectAll(".c3-bar")
      # Highlight only selected one
      .style("opacity", (d,i) => if not @state.selected? or i == @state.selected then 1 else 0.3)    

  handleDataClick: (d) =>
    selected = if @state.selected == d.index then null else d.index
    @setState(selected: selected)

  componentDidUpdate: ->
    @updateSelected()

  componentWillUnmount: ->
    @chart.destroy()

  render: ->
    H.div style: { width: @props.width, height: @props.height }, ref: "chart"
