React = require 'react'
H = React.DOM
ReactSelect = require 'react-select'
ExprUtils = require('mwater-expressions').ExprUtils
TextLiteralComponent = require './TextLiteralComponent'
moment = require 'moment'

# Displays quick filters and allows their value to be modified
module.exports = class QuickfiltersComponent extends React.Component
  @propTypes:
    design: React.PropTypes.array             # Design of quickfilters. See README.md
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

    if type in ["date", "datetime"]
      return React.createElement DateQuickfilterComponent, 
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

    H.div style: { borderTop: "solid 1px #E8E8E8", borderBottom: "solid 1px #E8E8E8", padding: 5 },
      _.map @props.design, (item, i) => @renderQuickfilter(item, i)

# Quickfilter for an enum
class EnumQuickfilterComponent extends React.Component
  @propTypes:
    label: React.PropTypes.string
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


# Quickfilter for a date value
class DateQuickfilterComponent extends React.Component
  @propTypes:
    label: React.PropTypes.string
    schema: React.PropTypes.object.isRequired
    expr: React.PropTypes.object.isRequired

    value: React.PropTypes.any                     # Current value of quickfilter (state of filter selected)
    onValueChange: React.PropTypes.func.isRequired # Called when value changes

  render: ->
    H.div style: { display: "inline-block", paddingRight: 10 },
      if @props.label
        H.span style: { color: "gray" }, @props.label + ":\u00a0"
      H.div style: { display: "inline-block", minWidth: "20em", verticalAlign: "middle" },
        React.createElement DateExprComponent, {
          type: new ExprUtils(@props.schema).getExprType(@props.expr)
          value: @props.value
          onValueChange: @props.onValueChange
        }

class DateExprComponent extends React.Component
  @propTypes:
    type: React.PropTypes.string.isRequired        # date or datetime
    value: React.PropTypes.any                     # Current value of quickfilter (state of filter selected)
    onValueChange: React.PropTypes.func.isRequired # Called when value changes

  handleChange: (val) =>
    if val
      @props.onValueChange(JSON.parse(val))
    else
      @props.onValueChange(null)

  render: ->
    # Create list of options
    options = [
      { value: JSON.stringify({ op: "thisyear", exprs: [] }), label: 'This Year' }
      { value: JSON.stringify({ op: "lastyear", exprs: [] }), label: 'Last Year' }
      { value: JSON.stringify({ op: "thismonth", exprs: [] }), label: 'This Month' }
      { value: JSON.stringify({ op: "lastmonth", exprs: [] }), label: 'Last Month' }
      { value: JSON.stringify({ op: "today", exprs: [] }), label: 'Today' }
      { value: JSON.stringify({ op: "yesterday", exprs: [] }), label: 'Yesterday' }
      { value: JSON.stringify({ op: "last7days", exprs: [] }), label: 'In Last 7 Days' }
      { value: JSON.stringify({ op: "last30days", exprs: [] }), label: 'In Last 30 Days' }
      { value: JSON.stringify({ op: "last365days", exprs: [] }), label: 'In Last 365 Days' }
    ]

    # Add last 24 months
    for i in [1..24]
      if @props.type == "date"
        options.push({ value: JSON.stringify({
            op: "between"
            exprs: [
              { type: "literal", valueType: @props.type, value: moment().startOf("month").subtract(i, 'months').format("YYYY-MM-DD") }
              { type: "literal", valueType: @props.type, value: moment().startOf("month").subtract(i - 1, 'months').subtract(1, "days").format("YYYY-MM-DD") }
            ]
          }), label: moment().startOf("month").subtract(i, 'months').format("MMM YYYY") })
      else if @props.type == "datetime"
        options.push({ value: JSON.stringify({
            op: "between"
            exprs: [
              { type: "literal", valueType: @props.type, value: moment().startOf("month").subtract(i, 'months').toISOString() }
              { type: "literal", valueType: @props.type, value: moment().startOf("month").subtract(i - 1, 'months').subtract(1, "milliseconds").toISOString() }
            ]
          }), label: moment().startOf("month").subtract(i, 'months').format("MMM YYYY") })

    H.div style: { display: "inline-block", minWidth: "20em", verticalAlign: "middle" },
      React.createElement ReactSelect, {
        placeholder: "All"
        value: if @props.value then JSON.stringify(@props.value) else ""
        multi: false
        options: options
        onChange: @handleChange
      }

