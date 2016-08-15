React = require 'react'
H = React.DOM
R = React.createElement
uuid = require 'node-uuid'
ExprComponent = require("mwater-expressions-ui").ExprComponent
ExprUtils = require('mwater-expressions').ExprUtils
ExprCompiler = require('mwater-expressions').ExprCompiler
LinkComponent = require('mwater-expressions-ui').LinkComponent
AxisBuilder = require './AxisBuilder'
update = require 'update-object'
ui = require '../UIComponents'
ColorMapComponent = require './ColorMapComponent'
BinsComponent = require './BinsComponent'
RangesComponent = require './RangesComponent'
AxisColorEditorComponent = require './AxisColorEditorComponent'

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
    showColorMap: React.PropTypes.bool # Shows the color map
    colorMapOptional: React.PropTypes.bool # Is the color map optional
    colorMapReorderable: React.PropTypes.bool # Is the color map reorderable

  @defaultProps:
    colorMapOptional: false
    colorMapReorderable: false

  @contextTypes:
    locale: React.PropTypes.string  # e.g. "en"

  handleExprChange: (expr) =>
    # If no expression, reset
    if not expr
      @props.onChange(null)
      return
      
    # Set expression and clear xform
    @props.onChange(@cleanAxis(_.extend({}, @props.value, { expr: expr })))

  handleXformTypeChange: (type) =>
    # Remove
    if not type
      @props.onChange(_.omit(@props.value, "xform"))

    # Save bins if going from bins to custom ranges and has ranges
    if type == "ranges" and @props.value.xform?.type == "bin" and @props.value.xform.min? and @props.value.xform.max? and @props.value.xform.min != @props.value.xform.max and @props.value.xform.numBins
      min = @props.value.xform.min
      max = @props.value.xform.max
      numBins = @props.value.xform.numBins

      ranges = [{ id: uuid.v4(), maxValue: min, minOpen: false, maxOpen: true }]
      for i in [1..numBins]
        start = (i-1) / numBins * (max - min) + min
        end = (i) / numBins * (max - min) + min
        ranges.push({ id: uuid.v4(), minValue: start, minOpen: false, maxValue: end, maxOpen: true })
      ranges.push({ id: uuid.v4(), minValue: max, minOpen: true, maxOpen: true })

      xform = {
        type: "ranges"
        ranges: ranges
      }
    else
      xform = {
        type: type
      }

    @props.onChange(update(@props.value, { xform: { $set: xform }}))

  handleXformChange: (xform) =>
    @props.onChange(@cleanAxis(update(@props.value, { xform: { $set: xform } })))

  cleanAxis: (axis) ->
    axisBuilder = new AxisBuilder(schema: @props.schema)
    return axisBuilder.cleanAxis(axis: axis, table: @props.table, aggrNeed: @props.aggrNeed, types: @props.types)

  renderXform: (axis) ->
    if not axis
      return

    if axis.xform and axis.xform.type in ["bin", "ranges"]
      if axis.xform.type == "ranges"
        comp = R(RangesComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          expr: axis.expr
          xform: axis.xform
          onChange: @handleXformChange)
      else
        comp = R(BinsComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          expr: axis.expr
          xform: axis.xform
          onChange: @handleXformChange)

      return H.div null,
        R ui.ButtonToggleComponent,
          value: if axis.xform then axis.xform.type else null
          options: [
            { value: "bin", label: "Equal Bins" }
            { value: "ranges", label: "Custom Ranges" }
          ]
          onChange: @handleXformTypeChange
        comp

    exprUtils = new ExprUtils(@props.schema)
    exprType = exprUtils.getExprType(axis.expr) 

    switch exprType
      when "date"
        R ui.ButtonToggleComponent,
          value: if axis.xform then axis.xform.type else null
          options: [
            { value: null, label: "Exact Date" }
            { value: "year", label: "Year" }
            { value: "yearmonth", label: "Year/Month" }
            { value: "month", label: "Month" }
          ]
          onChange: @handleXformTypeChange
      when "datetime"
        R ui.ButtonToggleComponent,
          value: if axis.xform then axis.xform.type else null
          options: [
            { value: "date", label: "Date" }
            { value: "year", label: "Year" }
            { value: "yearmonth", label: "Year/Month" }
            { value: "month", label: "Month" }
          ]
          onChange: @handleXformTypeChange

  renderColorMap: (axis) ->
    if not @props.showColorMap or not axis or not axis.expr
      return null

    return R AxisColorEditorComponent,
      schema: @props.schema
      dataSource: @props.dataSource
      axis: axis
      onChange: @props.onChange
      colorMapOptional: @props.colorMapOptional
      colorMapReorderable: @props.colorMapReorderable

  render: ->
    axisBuilder = new AxisBuilder(schema: @props.schema)

    # Clean before render
    axis = @cleanAxis(@props.value)

    # Determine aggrStatuses that are possible
    switch @props.aggrNeed
      when "none"
        aggrStatuses = ["literal", "individual"]
      when "optional"
        aggrStatuses = ["literal", "individual", "aggregate"]
      when "required"
        aggrStatuses = ["literal", "aggregate"]
   
    H.div null,
      H.div null, 
        React.createElement(ExprComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.table
          types: axisBuilder.getExprTypes(@props.types)
          # preventRemove: @props.required
          onChange: @handleExprChange
          value: if @props.value then @props.value.expr
          aggrStatuses: aggrStatuses
          )  
      @renderXform(axis)
      H.br()
      @renderColorMap(axis)

