React = require 'react'
H = React.DOM
ReactSelect = require 'react-select'
ExprUtils = require('mwater-expressions').ExprUtils
TextLiteralComponent = require './TextLiteralComponent'

# Displays quick filters and allows their value to be modified
module.exports = class QuickfiltersComponent extends React.Component
  @propTypes:
    design: React.PropTypes.array.isRequired  # Design of quickfilters. See README.md
    values: React.PropTypes.array             # Current values of quickfilters (state of filters selected)
    onValuesChange: React.PropTypes.func.isRequired # Called when value changes
    
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired

  renderQuickfilter: (item, index) ->
    values = (@props.values or [])
    itemValue = values[index]

    # Get type of expr
    type = new ExprUtils(@props.schema).getExprType(item.expr)

    if type == "enum"
      return React.createElement EnumQuickfilterComponent, 
        key: index
        label: item.label
        expr: item.expr
        schema: @props.schema
        options: new ExprUtils(@props.schema).getExprEnumValues(item.expr)
        value: itemValue
        onValueChange: (v) =>
          values = (@props.values or []).slice()
          values[index] = v
          @props.onValuesChange(values)

    if type == "text"
      return React.createElement TextQuickfilterComponent, 
        key: index
        label: item.label
        expr: item.expr
        schema: @props.schema
        dataSource: @props.dataSource
        value: itemValue
        onValueChange: (v) =>
          values = (@props.values or []).slice()
          values[index] = v
          @props.onValuesChange(values)

  render: ->
    if not @props.design or @props.design.length == 0
      return null

    H.div style: { borderTop: "solid 1px #E8E8E8", borderBottom: "solid 1px #E8E8E8", paddingTop: 5, paddingBottom: 5 },
      _.map @props.design, (item, i) => @renderQuickfilter(item, i)

# Quickfilter for an enum
class EnumQuickfilterComponent extends React.Component
  @propTypes:
    label: React.PropTypes.string.isRequired
    schema: React.PropTypes.object.isRequired
    options: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string.isRequired   # id of option
      name: React.PropTypes.object.isRequired # Localized name
    })).isRequired

    value: React.PropTypes.any              # Current value of quickfilter (state of filter selected)
    onValueChange: React.PropTypes.func.isRequired # Called when value changes

  handleChange: (val) =>
    if val
      @props.onValueChange(val)
    else
      @props.onValueChange(null)

  render: ->
    H.div style: { display: "inline-block", paddingRight: 10 },
      if @props.label
        H.span style: { color: "gray" }, @props.label + ":\u00a0"
      H.div style: { display: "inline-block", minWidth: "20em", verticalAlign: "middle" },
        React.createElement ReactSelect, {
          placeholder: "All"
          value: @props.value
          multi: false
          options: _.map(@props.options, (opt) -> { value: opt.id, label: opt.name.en }) # TODO localize
          onChange: @handleChange
        }


# Quickfilter for a text value
class TextQuickfilterComponent extends React.Component
  @propTypes:
    label: React.PropTypes.string.isRequired
    schema: React.PropTypes.object.isRequired
    expr: React.PropTypes.object.isRequired

    value: React.PropTypes.any                     # Current value of quickfilter (state of filter selected)
    onValueChange: React.PropTypes.func.isRequired # Called when value changes

  render: ->
    H.div style: { display: "inline-block", paddingRight: 10 },
      if @props.label
        H.span style: { color: "gray" }, @props.label + ":\u00a0"
      H.div style: { display: "inline-block", minWidth: "20em", verticalAlign: "middle" },
        React.createElement TextLiteralComponent, {
          value: @props.value
          onChange: @props.onValueChange
          refExpr: @props.expr
          schema: @props.schema
          dataSource: @props.dataSource
        }

