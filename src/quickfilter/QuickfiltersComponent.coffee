_ = require 'lodash'
PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
ReactSelect = require('react-select').default
ExprUtils = require('mwater-expressions').ExprUtils
ExprCleaner = require('mwater-expressions').ExprCleaner
TextLiteralComponent = require './TextLiteralComponent'
DateExprComponent = require './DateExprComponent'
QuickfilterCompiler = require './QuickfilterCompiler'
IdArrayQuickfilterComponent = require './IdArrayQuickfilterComponent'

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
    dataSource: PropTypes.object.isRequired
    quickfiltersDataSource: PropTypes.object.isRequired # See QuickfiltersDataSource

    # Filters to add to restrict quick filter data to
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired    # id table to filter
      jsonql: PropTypes.object.isRequired   # jsonql filter with {alias} for tableAlias
    }))

  renderQuickfilter: (item, index) ->
    # Skip if merged
    if item.merged
      return null

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

        # Also set any subsequent merged ones
        for i in [index + 1...@props.design.length]
          if @props.design[i].merged
            values[i] = v
          else
            break

        @props.onValuesChange(values)

    # Determine additional filters that come from other quickfilters. This is to make sure that each quickfilter is filtered
    # by any other active quickfilters (excluding self)
    compiler = new QuickfilterCompiler(@props.schema)
    otherDesign = (@props.design or []).slice()
    otherValues = (@props.values or []).slice()
    otherLocks = (@props.locks or []).slice()
    otherDesign.splice(index, 1)
    otherValues.splice(index, 1)
    otherLocks.splice(index, 1)
    otherQuickFilterFilters = compiler.compile(otherDesign, otherValues, otherLocks)
    filters = (@props.filters or []).concat(otherQuickFilterFilters)

    if type in ["enum", "enumset"]
      return R EnumQuickfilterComponent, 
        key: JSON.stringify(item)
        label: item.label
        expr: expr
        schema: @props.schema
        options: new ExprUtils(@props.schema).getExprEnumValues(expr)
        value: itemValue
        onValueChange: onValueChange
        multi: item.multi

    if type == "text"
      return R TextQuickfilterComponent, 
        key: JSON.stringify(item)
        index: index
        label: item.label
        expr: expr
        schema: @props.schema
        quickfiltersDataSource: @props.quickfiltersDataSource
        value: itemValue
        onValueChange: onValueChange
        filters: filters
        multi: item.multi

    if type in ["date", "datetime"]
      return R DateQuickfilterComponent, 
        key: JSON.stringify(item)
        label: item.label
        expr: expr
        schema: @props.schema
        value: itemValue
        onValueChange: onValueChange

    if type == "id[]"
      return R IdArrayQuickfilterComponent, 
        key: JSON.stringify(item)
        index: index
        label: item.label
        expr: expr
        schema: @props.schema
        dataSource: @props.dataSource
        value: itemValue
        onValueChange: onValueChange
        filters: filters
        multi: item.multi

    if type == "text[]"
      return R TextArrayQuickfilterComponent, 
        key: JSON.stringify(item)
        index: index
        label: item.label
        expr: expr
        schema: @props.schema
        quickfiltersDataSource: @props.quickfiltersDataSource
        value: itemValue
        onValueChange: onValueChange
        filters: filters
        multi: item.multi

  render: ->
    if not @props.design or @props.design.length == 0
      return null

    R 'div', style: { borderTop: "solid 1px #E8E8E8", borderBottom: "solid 1px #E8E8E8", padding: 5 },
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

    multi: PropTypes.bool       # true to display multiple values

    value: PropTypes.any              # Current value of quickfilter (state of filter selected)
    onValueChange: PropTypes.func     # Called when value changes

  @contextTypes:
    locale: PropTypes.string  # e.g. "en"

  handleSingleChange: (val) =>
    if val
      @props.onValueChange(val)
    else
      @props.onValueChange(null)

  handleMultiChange: (val) =>
    if val?.length > 0
      @props.onValueChange(_.pluck(val, "value"))
    else
      @props.onValueChange(null)

  renderSingleSelect: (options) ->
    R ReactSelect, 
      placeholder: "All"
      value: _.findWhere(options, value: @props.value) or null
      options: options
      isClearable: true
      onChange: (value) => if @props.onValueChange then @handleSingleChange(value?.value)
      isDisabled: not @props.onValueChange?
      styles: { 
        # Keep menu above fixed data table headers
        menu: (style) => _.extend({}, style, zIndex: 2000)
      }
  
  renderMultiSelect: (options) ->
    R ReactSelect, 
      placeholder: "All"
      value: _.map(@props.value, (v) => _.find(options, (o) => o.value == v))
      isClearable: true
      isMulti: true
      options: options
      onChange: if @props.onValueChange then @handleMultiChange
      isDisabled: not @props.onValueChange?
      styles: { 
        # Keep menu above fixed data table headers
        menu: (style) => _.extend({}, style, zIndex: 2000)
      }

  render: ->
    options = _.map(@props.options, (opt) => { value: opt.id, label: ExprUtils.localizeString(opt.name, @context.locale) }) 

    # Determine width, estimating about 8 px per letter with 120px padding
    width = _.max(options, (o) => o.label.length)?.label.length
    width = if width then width * 8 + 120 else 280
    minWidth = if width > 280 or @props.multi then "280px" else "#{width}px"

    R 'div', style: { display: "inline-block", paddingRight: 10 },
      if @props.label
        R 'span', style: { color: "gray" }, @props.label + ":\u00a0"
      R 'div', style: { display: "inline-block", minWidth: minWidth, verticalAlign: "middle" },
        if @props.multi
          @renderMultiSelect(options)
        else
          @renderSingleSelect(options)
      if not @props.onValueChange
        R 'i', className: "text-warning fa fa-fw fa-lock"


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

    multi: PropTypes.bool       # true to display multiple values

    # Filters to add to the quickfilter to restrict values
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired    # id table to filter
      jsonql: PropTypes.object.isRequired   # jsonql filter with {alias} for tableAlias
    }))

  render: ->
    R 'div', style: { display: "inline-block", paddingRight: 10 },
      if @props.label
        R 'span', style: { color: "gray" }, @props.label + ":\u00a0"
      R 'div', style: { display: "inline-block", minWidth: "280px", verticalAlign: "middle" },
        R TextLiteralComponent, {
          value: @props.value
          onChange: @props.onValueChange
          schema: @props.schema
          expr: @props.expr
          index: @props.index
          multi: @props.multi
          quickfiltersDataSource: @props.quickfiltersDataSource
          filters: @props.filters
        }
      if not @props.onValueChange
        R 'i', className: "text-warning fa fa-fw fa-lock"

# Quickfilter for a date value
class DateQuickfilterComponent extends React.Component
  @propTypes:
    label: PropTypes.string
    schema: PropTypes.object.isRequired
    expr: PropTypes.object.isRequired

    value: PropTypes.any                     # Current value of quickfilter (state of filter selected)
    onValueChange: PropTypes.func.isRequired # Called when value changes

  render: ->
    R 'div', style: { display: "inline-block", paddingRight: 10 },
      if @props.label
        R 'span', style: { color: "gray" }, @props.label + ":\u00a0"
      R 'div', style: { display: "inline-block", minWidth: "280px", verticalAlign: "middle" },
        R DateExprComponent, {
          datetime: (new ExprUtils(@props.schema).getExprType(@props.expr)) == "datetime"
          value: @props.value
          onChange: @props.onValueChange
        }
      if not @props.onValueChange
        R 'i', className: "text-warning fa fa-fw fa-lock"

# Quickfilter for a text value
class TextArrayQuickfilterComponent extends React.Component
  @propTypes:
    label: PropTypes.string.isRequired
    schema: PropTypes.object.isRequired
    quickfiltersDataSource: PropTypes.object.isRequired  # See QuickfiltersDataSource

    expr: PropTypes.object.isRequired
    index: PropTypes.number.isRequired

    value: PropTypes.any                     # Current value of quickfilter (state of filter selected)
    onValueChange: PropTypes.func    # Called when value changes

    multi: PropTypes.bool       # true to display multiple values

    # Filters to add to the quickfilter to restrict values
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired    # id table to filter
      jsonql: PropTypes.object.isRequired   # jsonql filter with {alias} for tableAlias
    }))

  render: ->
    R 'div', style: { display: "inline-block", paddingRight: 10 },
      if @props.label
        R 'span', style: { color: "gray" }, @props.label + ":\u00a0"
      R 'div', style: { display: "inline-block", minWidth: "280px", verticalAlign: "middle" },
        R TextLiteralComponent, {
          value: @props.value
          onChange: @props.onValueChange
          schema: @props.schema
          expr: @props.expr
          index: @props.index
          multi: @props.multi
          quickfiltersDataSource: @props.quickfiltersDataSource
          filters: @props.filters
        }
      if not @props.onValueChange
        R 'i', className: "text-warning fa fa-fw fa-lock"
