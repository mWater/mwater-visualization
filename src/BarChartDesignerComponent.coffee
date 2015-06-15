H = React.DOM
ScalarExprComponent = require './ScalarExprComponent'
LogicalExprComponent = require './LogicalExprComponent'
ExpressionBuilder = require './ExpressionBuilder'

module.exports = class BarChartDesignerComponent extends React.Component
  cleanDesign: (design) ->
    exprBuilder = new ExpressionBuilder(@props.schema)

    design.yAxis = exprBuilder.cleanExpr(design.yAxis)
    
    if design.yAxis
      design.xAxis = exprBuilder.cleanExpr(design.xAxis, design.yAxis.table)
    else
      design.xAxis = null

    if design.yAxis
      design.where = exprBuilder.cleanExpr(design.where, design.yAxis.table)
    else
      design.where = null

    @props.onChange(design)

  validateDesign: (design) ->
    if not design.yAxis 
      return "Missing Y Axis"

    if not design.xAxis
      return "Missing X axis"

    exprBuilder = new ExpressionBuilder(@props.schema)
    return exprBuilder.validateExpr(design.yAxis) or exprBuilder.validateExpr(design.xAxis) or exprBuilder.validateExpr(design.where)

  handleYAxisChange: (val) =>
    @cleanDesign(_.extend({}, @props.value, { yAxis: val }))

  handleXAxisChange: (val) =>
    @cleanDesign(_.extend({}, @props.value, { xAxis: val }))

  handleWhereChange: (val) =>
    @cleanDesign(_.extend({}, @props.value, { where: val }))

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
      H.label null, "Group By"
      H.div null, 
        React.createElement(ScalarExprComponent, 
          editorTitle: "Group By"
          schema: @props.schema
          table: @props.value.yAxis.table
          onChange: @handleXAxisChange
          value: @props.value.xAxis)
      H.p className: "help-block", "Field to group by"

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
        value: @props.value.where)

  render: ->
    expr = null

    error = @validateDesign(@props.value)

    H.div null,
      if error 
        H.div className: "alert alert-warning", 
          H.span className: "glyphicon glyphicon-info-sign"
          " "
          error
      @renderYAxis()
      @renderXAxis()
      @renderFilter()
