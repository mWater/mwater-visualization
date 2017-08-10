PropTypes = require('prop-types')
React = require 'react'
H = React.DOM
R = React.createElement
ReactSelect = require 'react-select'
ExprUtils = require('mwater-expressions').ExprUtils
ExprCleaner = require('mwater-expressions').ExprCleaner
TextLiteralComponent = require './TextLiteralComponent'
DateExprComponent = require './DateExprComponent'

# Displays quick filters and allows their value to be modified
module.exports = class QuickfiltersComponent extends React.Component
  @propTypes:
    design: PropTypes.arrayOf(PropTypes.shape({
      expr: PropTypes.object.isRequired
      label: PropTypes.string
      }))       # Design of quickfilters. See README.md
    values: PropTypes.array             # Current values of quickfilters (state of filters selected)
    onValuesChange: PropTypes.func.isRequired # Called when value changes

    # Locked quickfilters. Locked ones cannot be changed and are shown with a lock
    locks: PropTypes.arrayOf(PropTypes.shape({
      expr: PropTypes.object.isRequired
      value: PropTypes.any
      }))
    
    schema: PropTypes.object.isRequired
    quickfiltersDataSource: PropTypes.object.isRequired # See QuickfiltersDataSource

    # Filters to add to restrict quick filter data to
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired    # id table to filter
      jsonql: PropTypes.object.isRequired   # jsonql filter with {alias} for tableAlias
    }))

  renderQuickfilter: (item, index) ->
    values = (@props.values or [])
    itemValue = values[index]

    # Clean expression first
    expr = new ExprCleaner(@props.schema).cleanExpr(item.expr)

    # Do not render if nothing
    if not expr
      return null

    # Get type of expr
    type = new ExprUtils(@props.schema).getExprType(expr)

    # Determine if locked
    lock = _.find(@props.locks, (lock) -> _.isEqual(lock.expr, expr))

    if lock
      # Overrides item value
      itemValue = lock.value
      onValueChange = null
    else
      # Can change value if not locked
      onValueChange = (v) =>
        values = (@props.values or []).slice()
        values[index] = v
        @props.onValuesChange(values)

    if type == "enum"
      return R EnumQuickfilterComponent, 
        key: index
        label: item.label
        expr: expr
        schema: @props.schema
        options: new ExprUtils(@props.schema).getExprEnumValues(expr)
        value: itemValue
        onValueChange: onValueChange

    if type == "text"
      return R TextQuickfilterComponent, 
        key: index
        index: index
        label: item.label
        expr: expr
        schema: @props.schema
        quickfiltersDataSource: @props.quickfiltersDataSource
        value: itemValue
        onValueChange: onValueChange
        filters: @props.filters

    if type in ["date", "datetime"]
      return R DateQuickfilterComponent, 
        key: index
        label: item.label
        expr: expr
        schema: @props.schema
        value: itemValue
        onValueChange: onValueChange

  render: ->
    if not @props.design or @props.design.length == 0
      return null

    H.div style: { borderTop: "solid 1px #E8E8E8", borderBottom: "solid 1px #E8E8E8", padding: 5 },
      _.map @props.design, (item, i) => @renderQuickfilter(item, i)

# Quickfilter for an enum
class EnumQuickfilterComponent extends React.Component
  @propTypes:
    label: PropTypes.string
    schema: PropTypes.object.isRequired
    options: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired   # id of option
      name: PropTypes.object.isRequired # Localized name
    })).isRequired

    value: PropTypes.any              # Current value of quickfilter (state of filter selected)
    onValueChange: PropTypes.func     # Called when value changes

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

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
        R ReactSelect, {
          placeholder: "All"
          value: @props.value
          multi: false
          options: _.map(@props.options, (opt) => { value: opt.id, label: ExprUtils.localizeString(opt.name, @context.locale) }) 
          onChange: if @props.onValueChange then @handleChange
          disabled: not @props.onValueChange?
        }
      if not @props.onValueChange
        H.i className: "text-warning fa fa-fw fa-lock"


# Quickfilter for a text value
class TextQuickfilterComponent extends React.Component
  @propTypes:
    label: PropTypes.string.isRequired
    schema: PropTypes.object.isRequired
    quickfiltersDataSource: PropTypes.object.isRequired  # See QuickfiltersDataSource

    expr: PropTypes.object.isRequired
    index: PropTypes.number.isRequired

    value: PropTypes.any                     # Current value of quickfilter (state of filter selected)
    onValueChange: PropTypes.func    # Called when value changes

    # Filters to add to the quickfilter to restrict values
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired    # id table to filter
      jsonql: PropTypes.object.isRequired   # jsonql filter with {alias} for tableAlias
    }))

  render: ->
    H.div style: { display: "inline-block", paddingRight: 10 },
      if @props.label
        H.span style: { color: "gray" }, @props.label + ":\u00a0"
      H.div style: { display: "inline-block", minWidth: "20em", verticalAlign: "middle" },
        R TextLiteralComponent, {
          value: @props.value
          onChange: @props.onValueChange
          schema: @props.schema
          expr: @props.expr
          index: @props.index
          quickfiltersDataSource: @props.quickfiltersDataSource
          filters: @props.filters
        }
      if not @props.onValueChange
        H.i className: "text-warning fa fa-fw fa-lock"

# Quickfilter for a date value
class DateQuickfilterComponent extends React.Component
  @propTypes:
    label: PropTypes.string
    schema: PropTypes.object.isRequired
    expr: PropTypes.object.isRequired

    value: PropTypes.any                     # Current value of quickfilter (state of filter selected)
    onValueChange: PropTypes.func.isRequired # Called when value changes

  render: ->
    H.div style: { display: "inline-block", paddingRight: 10 },
      if @props.label
        H.span style: { color: "gray" }, @props.label + ":\u00a0"
      H.div style: { display: "inline-block", minWidth: "20em", verticalAlign: "middle" },
        R DateExprComponent, {
          datetime: (new ExprUtils(@props.schema).getExprType(@props.expr)) == "datetime"
          value: @props.value
          onValueChange: @props.onValueChange
        }
      if not @props.onValueChange
        H.i className: "text-warning fa fa-fw fa-lock"

