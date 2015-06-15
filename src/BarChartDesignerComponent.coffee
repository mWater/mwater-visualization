H = React.DOM
ScalarExprComponent = require './ScalarExprComponent'
LogicalExprComponent = require './LogicalExprComponent'


module.exports = class BarChartDesignerComponent extends React.Component
  handleYAxisChange: (val) =>
    @props.onChange(_.extend({}, @props.value, { yAxis: val }))

  handleXAxisChange: (val) =>
    @props.onChange(_.extend({}, @props.value, { xAxis: val }))

  handleWhereChange: (val) =>
    @props.onChange(_.extend({}, @props.value, { where: val }))

  renderYAxis: ->
    H.div className: "form-group",
      H.label null, "Bar size"
      H.div null, 
        React.createElement(ScalarExprComponent, 
          editorTitle: "Bar size"
          schema: @props.schema
          onChange: @handleYAxisChange
          value: @props.value.yAxis)
      H.p className: "help-block", "Field to use for the size of the bars"

  renderXAxis: ->
    # If no y axis, hide
    if not @props.value.yAxis
      return null

    # Expression is limited to same table as y-axis
    return H.div className: "form-group",
      H.label null, "Bar size"
      H.div null, 
        React.createElement(ScalarExprComponent, 
          editorTitle: "Bar size"
          schema: @props.schema
          table: @props.value.yAxis.table
          onChange: @handleXAxisChange
          value: @props.value.xAxis)
      H.p className: "help-block", "Data to control the size of the bars"

  renderFilter: ->
    # If no y axis, hide
    if not @props.value.yAxis
      return null

    return H.div className: "form-group",
      H.label null, "Filter"
      React.createElement(LogicalExprComponent, 
        schema: @props.schema
        onChange: @handleWhereChange
        table: @props.value.yAxis.table
        expr: @props.value.where)

  render: ->
    expr = null

    H.div null,
      @renderYAxis()
      @renderXAxis()
      @renderFilter()
