React = require 'react'
H = React.DOM

ExpressionBuilder = require './ExpressionBuilder'

titleFontSize = 14
titleHeight = 20

# Displays a bar chart
module.exports = class BarChartViewComponent extends React.Component
  @propTypes: 
    schema: React.PropTypes.object.isRequired
    design: React.PropTypes.object.isRequired
    data: React.PropTypes.object.isRequired

    width: React.PropTypes.number.isRequired
    height: React.PropTypes.number.isRequired

    scope: React.PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: React.PropTypes.func # called with (scope, filter) as a scope to apply to self and filter to apply to other widgets

  componentDidMount: ->
    @createChart(@props)
    @updateScope()

  # Makes nulls into (none) and localizes enums
  prepareData: (data) ->
    return { main: _.map(data.main, (row) =>
      copy = {}
      for key, value of row
        if not value?
          copy[key] = "(none)"
        else
          copy[key] = value
      return copy
      )}

  createChart: (props) ->
    if @chart
      @chart.destroy()

    el = React.findDOMNode(@refs.chart)

    # Create chart
    @chart = c3.generate({
        bindto: el
        data: {
          type: "bar"
          json: @prepareData(props.data).main
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

  componentWillReceiveProps: (nextProps) ->
    # Check if size changed
    if @props.height != nextProps.height or @props.width != nextProps.width
      @createChart(nextProps)
      return

    if not _.isEqual(@props.data, nextProps.data)
      # If length of data is different, re-create chart
      if @props.data.main.length != nextProps.data.main.length
        @createChart(nextProps)
        return

      # Reload data
      @chart.load({ 
        json: @prepareData(nextProps.data).main
        keys: { x: "x", value: ["y"] }
        names: { y: 'Value' } # Name the data
      })

  # Update scoped value
  updateScope: =>
    d3.select(React.findDOMNode(@refs.chart))
      .select(".c3-bars-y") # Get bars
      .selectAll(".c3-bar")
      # Highlight only scoped
      .style("opacity", (d,i) =>
        # Determine if scoped
        if @props.scope 
          if @props.data.main[d.index].x == @props.scope
            return 1
          else
            return 0.3
        else
          # Not scoped
          return 1
      )

  handleDataClick: (d) =>
    # Scope x value
    scope = @props.data.main[d.index].x

    # If same scope, remove scope
    if scope == @props.scope
      @props.onScopeChange(null, null)
      return

    expressionBuilder = new ExpressionBuilder(@props.schema)

    xExpr = @props.design.aesthetics.x.expr
    filter = { 
      type: "comparison"
      table: @props.design.table
      lhs: xExpr
      op: "="
      rhs: { type: "literal", valueType: expressionBuilder.getExprType(xExpr), value: scope } 
    }

    @props.onScopeChange(scope, filter)

  componentDidUpdate: ->
    @updateScope()

  componentWillUnmount: ->
    @chart.destroy()

  render: ->
    titleStyle = {
      fontWeight: "bold"
    }

    H.div null,
      H.div 
        H.svg width: @props.width, height: titleHeight,
          H.text style: titleStyle, fill: "red", x: @props.width/2, y: titleHeight/2, textAnchor: "middle", @props.design.annotations.title
      H.div style: { marginTop: titleHeight }, ref: "chart"
