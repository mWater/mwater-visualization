React = require 'react'
H = React.DOM
R = React.createElement
ExprComponent = require("mwater-expressions-ui").ExprComponent
ExprUtils = require('mwater-expressions').ExprUtils
ExprCompiler = require('mwater-expressions').ExprCompiler
LinkComponent = require('mwater-expressions-ui').LinkComponent
AxisBuilder = require './AxisBuilder'
update = require 'update-object'
ui = require '../UIComponents'

# Axis component that allows designing of an axis
module.exports = class AxisComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # schema to use
    dataSource: React.PropTypes.object.isRequired

    table: React.PropTypes.string.isRequired # Table to use
    types: React.PropTypes.array # Optional types to limit to

    aggrNeed: React.PropTypes.oneOf(['none', 'optional', 'required']).isRequired

    value: React.PropTypes.object # See Axis Design.md
    onChange: React.PropTypes.func.isRequired # Called when changes

    required: React.PropTypes.bool  # Makes this a required value

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  handleExprChange: (expr) =>
    # If no expression, reset
    if not expr
      @props.onChange(null)
      return
      
    # Set expression and clear xform
    @props.onChange({ expr: expr, xform: null, aggr: null })

  handleAggrChange: (aggr) =>
    @props.onChange(update(@props.value, $merge: { aggr: aggr }))

  handleXformTypeChange: (type) =>
    if type
      @props.onChange(update(@props.value, $merge: { xform: { type: type } }))
    else
      @props.onChange(_.omit(@props.value, "xform"))

  renderAggr: ->
    if @props.aggrNeed == "none"
      return
      
    exprUtils = new ExprUtils(@props.schema)

    # Only render aggregate if has a expr with a type that is not count
    if @props.value and exprUtils.getExprType(@props.value.expr) != "count"
      exprUtils = new ExprUtils(@props.schema)
      aggrs = exprUtils.getAggrs(@props.value.expr)

      # Remove latest, as it is tricky to group by. TODO
      aggrs = _.filter(aggrs, (aggr) -> aggr.id != "last")
      currentAggr = _.findWhere(aggrs, id: @props.value.aggr)

      return React.createElement(LinkComponent, 
        dropdownItems: aggrs
        onDropdownItemClicked: @handleAggrChange
        if currentAggr then currentAggr.name
        )

  renderXform: ->
    if not @props.value
      return

    exprUtils = new ExprUtils(@props.schema)
    exprType = exprUtils.getExprType(@props.value.expr) 

    switch exprType
      when "date"
        R ui.ButtonToggleComponent,
          value: if @props.value.xform then @props.value.xform.type else null
          options: [
            { value: null, label: "Exact Date" }
            { value: "year", label: "Year" }
            { value: "yearmonth", label: "Year/Month" }
            { value: "month", label: "Month" }
          ]
          onChange: @handleXformTypeChange
      when "datetime"
        R ui.ButtonToggleComponent,
          value: if @props.value.xform then @props.value.xform.type else null
          options: [
            { value: "date", label: "Date" }
            { value: "year", label: "Year" }
            { value: "yearmonth", label: "Year/Month" }
            { value: "month", label: "Month" }
          ]
          onChange: @handleXformTypeChange

  render: ->
    axisBuilder = new AxisBuilder(schema: @props.schema)

    H.div null,
      H.div null, 
        @renderAggr()
        React.createElement(ExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.table
          types: axisBuilder.getExprTypes(@props.types, @props.aggrNeed)
          # preventRemove: @props.required
          onChange: @handleExprChange
          includeCount: @props.aggrNeed != "none"
          value: if @props.value then @props.value.expr)  
      @renderXform()

