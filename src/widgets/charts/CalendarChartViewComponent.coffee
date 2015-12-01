_ = require 'lodash'
React = require 'react'
H = React.DOM

AxisBuilder = require '../../axes/AxisBuilder'

module.exports = class CalendarChartViewComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired # Design of chart
    data: React.PropTypes.object.isRequired # Data that the chart has requested. In format { main: [{ date: <YYYY-MM-DD>, value: <number value> }, { date: ... }...] }

    width: React.PropTypes.number
    height: React.PropTypes.number
    standardWidth: React.PropTypes.number

    scope: React.PropTypes.any # scope of the widget (when the widget self-selects a particular scope)
    onScopeChange: React.PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

  shouldComponentUpdate: (prevProps) ->
    not _.isEqual(prevProps, @props)

  render: ->
    H.div style: { width: @props.width, height: @props.height, border: "solid 1px #AAA" }, 
      "THIS SHOULD BE A CALENDAR HEATMAP"

