React = require 'react'
H = React.DOM

titleFontSize = 14
titleHeight = 20

# Displays a bar chart
module.exports = class BarChartViewComponent extends React.Component
  @propTypes: 
    data: React.PropTypes.array.isRequired
    design: React.PropTypes.object.isRequired
    width: React.PropTypes.number.isRequired
    height: React.PropTypes.number.isRequired

  constructor: ->
    super
    @state = { selected: null }

  componentDidMount: ->
    @createChart(@props)

  createChart: (props) ->
    if @chart
      @chart.destroy()

    el = React.findDOMNode(@refs.chart)

    # Create chart
    @chart = c3.generate({
        bindto: el
        data: {
          type: "bar"
          json: props.data
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
        size: { width: props.width, height: props.height - titleHeight }
    })

    @updateSelected()

  componentWillReceiveProps: (nextProps) ->
    # Check if size changed
    if @props.height != nextProps.height or @props.width != nextProps.width
      @createChart(nextProps)
      return

    if not _.isEqual(@props.data, nextProps.data)
      # Reload data
      @chart.load({ 
        json: nextProps.data
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
    titleStyle = {
      position: "absolute"
      top: 0
      width: @props.width
      textAlign: "center"
      fontWeight: "bold"
    }

    H.div null,
      H.div style: titleStyle, @props.design.annotations.title
      H.div style: { marginTop: titleHeight }, ref: "chart"
