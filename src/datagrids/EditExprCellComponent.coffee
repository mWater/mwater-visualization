_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
moment = require 'moment'

ExprUtils = require("mwater-expressions").ExprUtils

Cell = require('fixed-data-table').Cell

# Cell allows editing an expression column cell
# Store edited value here to prevent slow re-render of entire datagrid
module.exports = class EditExprCellComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired     # schema to use
    dataSource: React.PropTypes.object.isRequired # dataSource to use

    width: React.PropTypes.number.isRequired
    height: React.PropTypes.number.isRequired

    value: React.PropTypes.any
    expr: React.PropTypes.object.isRequired

    onSave: React.PropTypes.func.isRequired       # Called when save is requested (e.g. enter in text box)
    onCancel: React.PropTypes.func.isRequired     # Called when cancelled

  constructor: (props) ->
    super(props)
    @state = { value: props.value }

  getValue: -> @state.value

  # Check if edit value has changed
  hasChanged: ->
    return not _.isEqual(@props.value, @state.value)

  handleChange: (value) => @setState(value: value)

  render: ->
    exprUtils = new ExprUtils(@props.schema)

    # Get expression type
    exprType = exprUtils.getExprType(@props.expr)

    switch exprType
      when "text"
        return R TextEditComponent, value: @state.value, onChange: @handleChange, onSave: @props.onSave, onCancel: @props.onCancel
      when "number"
        return R NumberEditComponent, value: @state.value, onChange: @handleChange, onSave: @props.onSave, onCancel: @props.onCancel
      when "enum"
        return R EnumEditComponent, value: @state.value, onChange: @handleChange, enumValues: exprUtils.getExprEnumValues(@props.expr), onSave: @props.onSave, onCancel: @props.onCancel

    throw new Error("Unsupported type #{exprType} for editing")

# Simple text box
class TextEditComponent extends React.Component
  @propTypes:
    value: React.PropTypes.any
    onChange: React.PropTypes.func.isRequired     # Called with new value
    onSave: React.PropTypes.func.isRequired       # Called when enter is pressed
    onCancel: React.PropTypes.func.isRequired     # Called when cancelled

  componentDidMount: ->
    # Focus when created
    @refs.input?.focus()

  render: ->
    H.div style: { paddingTop: 3 },
      H.input 
        ref: "input"
        type: "text"
        className: "form-control"
        value: @props.value or ""
        onChange: (ev) => @props.onChange(ev.target.value or null)
        onKeyUp: (ev) =>
          if ev.keyCode == 27
            @props.onCancel()
          if ev.keyCode == 13
            @props.onSave()

# Simple number box
class NumberEditComponent extends React.Component
  @propTypes:
    value: React.PropTypes.any
    onChange: React.PropTypes.func.isRequired     # Called with new value
    onSave: React.PropTypes.func.isRequired       # Called when enter is pressed
    onCancel: React.PropTypes.func.isRequired     # Called when cancelled

  componentDidMount: ->
    # Focus when created
    @refs.input?.focus()

  handleChange: (ev) =>
    if ev.target.value
      @props.onChange(parseFloat(ev.target.value))
    else
      @props.onChange(null)

  render: ->
    H.div style: { paddingTop: 3 },
      H.input 
        ref: "input"
        type: "number"
        step: "any"
        className: "form-control"
        value: if @props.value? then @props.value else ""
        onChange: @handleChange
        onKeyUp: (ev) =>
          if ev.keyCode == 27
            @props.onCancel()
          if ev.keyCode == 13
            @props.onSave()

# Simple enum box
class EnumEditComponent extends React.Component
  @propTypes:
    value: React.PropTypes.any
    enumValues: React.PropTypes.array.isRequired
    onChange: React.PropTypes.func.isRequired     # Called with new value
    onSave: React.PropTypes.func.isRequired       # Called when enter is pressed
    onCancel: React.PropTypes.func.isRequired     # Called when cancelled

  render: ->
    H.div style: { paddingTop: 3 },
      H.select 
        value: @props.value or ""
        onChange: (ev) => @props.onChange(ev.target.value or null)
        className: "form-control",
          H.option key: "", value: "", ""
          _.map @props.enumValues, (ev) =>
            H.option key: ev.id, value: ev.id, ExprUtils.localizeString(ev.name)
