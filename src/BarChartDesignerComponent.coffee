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

  renderXAesthetic: ->
    React.createElement(AestheticComponent, 
      title: "Category (X) Axis"
      schema: @props.schema, 
      table: @props.design.table
      types: ["enum", "text"]
      value: @props.design.aesthetics.x, 
      onChange: @handleAestheticChange.bind(this, "x"))

  renderYAesthetic: ->
    React.createElement(AestheticComponent, 
      title: "Value (Y) Axis"
      schema: @props.schema, 
      table: @props.design.table
      # types: ["decimal", "integer"]
      # TODO should limit aggregated value to numeric
      aggrRequired: true
      value: @props.design.aesthetics.y
      onChange: @handleAestheticChange.bind(this, "y"))

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
      @renderXAesthetic()
      @renderYAesthetic()
      @renderFilter()

class AestheticComponent extends React.Component
  @propTypes:
    title: React.PropTypes.string.isRequired # Title for display and popups
    schema: React.PropTypes.object.isRequired # schema to use

    table: React.PropTypes.string # Limits table to this table
    types: React.PropTypes.array # Optional types to limit to

    value: React.PropTypes.object # Current value of expression
    onChange: React.PropTypes.func.isRequired # Called when changes
    aggrRequired: React.PropTypes.bool # True to require aggregation

  handleExprChange: (expr) =>
    @props.onChange(_.extend({}, @props.value, { expr: expr }))

  handleAggrChange: (ev) =>
    @props.onChange(_.extend({}, @props.value, { aggr: ev.target.value }))

  renderAggr: ->
    if @props.value and @props.aggrRequired and @props.value.expr
      exprBuilder = new ExpressionBuilder(@props.schema)
      aggrs = exprBuilder.getAggrs(@props.value.expr)

      # Remove latest, as it is tricky to group by. TODO
      aggrs = _.filter(aggrs, (aggr) -> aggr.id != "last")

      return H.select(
        style: { width: "auto", display: "inline-block" }
        className: "form-control input-sm"
        value: @props.value.aggr 
        onChange: @handleAggrChange,
          _.map(aggrs, (aggr) => H.option(value: aggr.id, aggr.name)))

  render: ->
    return H.div className: "form-group",
      H.label null, @props.title
      H.div null, 
        @renderAggr()
        React.createElement(ScalarExprComponent, 
          editorTitle: @props.title
          schema: @props.schema
          table: @props.table
          types: @props.types # TODO
          onChange: @handleExprChange
          value: if @props.value then @props.value.expr)