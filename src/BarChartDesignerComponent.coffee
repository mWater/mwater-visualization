React = require 'react'
H = React.DOM
ScalarExprComponent = require './ScalarExprComponent'
LogicalExprComponent = require './LogicalExprComponent'
ExpressionBuilder = require './ExpressionBuilder'

module.exports = class BarChartDesignerComponent extends React.Component
  handleAestheticChange: (aes, val) =>
    aesthetics = _.clone(@props.design.aesthetics)
    aesthetics[aes] = val
    @props.onChange(_.extend({}, @props.design, { aesthetics: aesthetics }))

  handleFilterChange: (val) =>
    @props.onChange(_.extend({}, @props.design, { filter: val }))

  # renderYAxis: ->
  #   H.div className: "form-group",
  #     H.label null, "Bar size"
  #     H.div null, 
  #       React.createElement(ScalarExprComponent, 
  #         editorTitle: "Bar size"
  #         schema: @props.schema
  #         onChange: @handleYAxisChange
  #         value: @props.value.yAxis)
  #     H.p className: "help-block", "Field to use for the size of the bars"

  # renderXAxis: ->
  #   # If no y axis, hide
  #   if not @props.value.yAxis
  #     return null

  #   # Expression is limited to same table as y-axis
  #   return H.div className: "form-group",
  #     H.label null, "Group By"
  #     H.div null, 
  #       React.createElement(ScalarExprComponent, 
  #         editorTitle: "Group By"
  #         schema: @props.schema
  #         table: @props.value.yAxis.table
  #         onChange: @handleXAxisChange
  #         value: @props.value.xAxis)
  #     H.p className: "help-block", "Field to group by"

  renderYAesthetic: ->
    React.createElement(AestheticComponent, 
      title: "Value (Y) Axis"
      schema: @props.schema, 
      table: @props.design.table
      types: ["decimal", "integer"]
      value: @props.design.aesthetics.y
      onChange: @handleAestheticChange.bind(this, "y"))

  renderXAesthetic: ->
    React.createElement(AestheticComponent, 
      title: "Category (X) Axis"
      schema: @props.schema, 
      table: @props.design.table
      types: ["enum", "text"]
      value: @props.design.aesthetics.x, 
      onChange: @handleAestheticChange.bind(this, "x"))

  renderFilter: ->
    # If no table, hide
    if not @props.design.table
      return null

    return H.div className: "form-group",
      H.label null, "Filter"
      React.createElement(LogicalExprComponent, 
        schema: @props.schema
        onChange: @handleFilterChange
        table: @props.design.table
        value: @props.design.filter)

  render: ->
    H.div null,
      # if error 
      #   H.div className: "text-warning", 
      #     H.span className: "glyphicon glyphicon-info-sign"
      #     " "
      #     error
      @renderYAesthetic()
      @renderXAesthetic()
      @renderFilter()

class AestheticComponent extends React.Component
  handleExprChange: (expr) =>
    @props.onChange(_.extend({}, @props.value, { expr: expr }))

  render: ->
    return H.div className: "form-group",
      H.label null, @props.title
      H.div null, 
        React.createElement(ScalarExprComponent, 
          editorTitle: @props.title
          schema: @props.schema
          table: @props.table
          types: @props.types # TODO
          onChange: @handleExprChange
          value: if @props.value then @props.value.expr)