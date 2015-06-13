H = React.DOM
ScalarExprComponent = require './ScalarExprComponent'

module.exports = class BarChartDesignerComponent extends React.Component
  handleYAxisChange: (val) =>
    @props.onChange(_.extend({}, @props.value, { yAxis: val }))

  handleXAxisChange: (val) =>
    @props.onChange(_.extend({}, @props.value, { xAxis: val }))

  renderYAxis: ->
    H.div className: "form-group",
      H.label null, "Bar size"
      React.createElement(ScalarExprComponent, 
        editorTitle: "Bar size"
        schema: @props.schema
        onChange: @handleYAxisChange
        value: null)
      H.p className: "help-block", "Field to use for the size of the bars"

  renderXAxis: ->
    # If no y axis, hide
    if not @props.value.yAxis
      return null

    return H.div className: "form-group",
      H.label null, "Bar size"
      React.createElement(ScalarExprComponent, 
        editorTitle: "Bar size"
        schema: @props.schema
        startTable: @props.value.yAxis.table
        onChange: @handleXAxisChange
        value: null)
      H.p className: "help-block", "Data to control the size of the bars"

  render: ->
    expr = null

    H.div null,
      @renderYAxis()
      @renderXAxis()
