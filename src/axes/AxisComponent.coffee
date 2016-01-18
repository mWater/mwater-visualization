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

  handleXformChange: (xform) =>
    @props.onChange(update(@props.value, { xform: { $set: xform } }))

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

  renderBins: ->
    R BinsComponent,
      value: @props.value.xform
      onChange: @handleXformChange

  renderXform: ->
    if not @props.value
      return

    if @props.value.xform and @props.value.xform.type == "bin"
      return R(BinsComponent, 
        schema: @props.schema
        dataSource: @props.dataSource
        expr: @props.value.expr
        xform: @props.value.xform
        onChange: @handleXformChange)

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

# Allows setting of bins (min, max and number). Computes defaults if not present
class BinsComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired 
    dataSource: React.PropTypes.object.isRequired

    expr: React.PropTypes.object.isRequired   # Expression for computing min/max
    xform: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired

  componentDidMount: ->
    # Check if computing is needed
    if not @props.xform.min? or not @props.xform.max?
      axisBuilder = new AxisBuilder(schema: @props.schema)

      # Get min and max from a query
      minMaxQuery = axisBuilder.compileBinMinMax(@props.expr, @props.expr.table, null, @props.xform.numBins)

      @props.dataSource.performQuery(minMaxQuery, (error, rows) =>
        if @unmounted
          return

        if error
          return # Ignore

        if rows[0].min?
          min = parseFloat(rows[0].min)
          max = parseFloat(rows[0].max)

        @props.onChange(update(@props.xform, { min: { $set: min }, max: { $set: max }}))
      )

  componentWillUnmount: ->
    @unmounted = true

  render: ->
    H.div null,
      R NumberComponent, key: "min", label: "Min:", value: @props.xform.min, onChange: (v) => @props.onChange(update(@props.xform, { min: { $set: v }}))
      " "
      R NumberComponent, key: "max", label: "Max:", value: @props.xform.max, onChange: (v) => @props.onChange(update(@props.xform, { max: { $set: v }}))
      " "
      R NumberComponent, key: "numBins", label: "Bins:", value: @props.xform.numBins, onChange: (v) => @props.onChange(update(@props.xform, { numBins: { $set: v }}))

# Label and number
class NumberComponent extends React.Component
  @propTypes:
    label: React.PropTypes.node
    value: React.PropTypes.number
    onChange: React.PropTypes.func.isRequired
    integer: React.PropTypes.bool

  handleChange: (ev) =>
    if @props.integer
      number = parseInt(ev.target.value)
    else
      number = parseFloat(ev.target.value)

    if _.isNaN(number)
      @props.onChange(null)
    else
      @props.onChange(number)

  render: ->
    H.div style: { display: "inline-block" },
      H.label className: "text-muted", @props.label
      H.input 
        type: "number"
        step: (if @props.integer then "1" else "any")
        value: @props.value
        onChange: @handleChange
        className: "form-control input-sm"
        style: { width: "8em", display: "inline-block", marginLeft: 5 }


