_ = require 'lodash'
PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
AsyncReactSelect = require('react-select/lib/Async').default
ExprCompiler = require('mwater-expressions').ExprCompiler
ExprUtils = require('mwater-expressions').ExprUtils
injectTableAlias = require('mwater-expressions').injectTableAlias

# Displays a combo box that allows selecting single or multiple text values from an expression
# The expression can be type `text` or `text[]`
module.exports = class TextLiteralComponent extends React.Component
  @propTypes: 
    value: PropTypes.any
    onChange: PropTypes.func

    schema: PropTypes.object.isRequired
    quickfiltersDataSource: PropTypes.object.isRequired  # See QuickfiltersDataSource
    expr: PropTypes.object.isRequired
    index: PropTypes.number.isRequired
    multi: PropTypes.bool       # true to display multiple values

    # Filters to add to the component to restrict values
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired    # id table to filter
      jsonql: PropTypes.object.isRequired   # jsonql filter with {alias} for tableAlias
    }))

  handleSingleChange: (val) =>
    value = if val then (val.value or null) else null # Blank is null
    @props.onChange(value)

  handleMultipleChange: (val) =>
    value = if val then _.pluck(val, "value") else []

    if value.length > 0
      @props.onChange(value)
    else
      @props.onChange(null)

  getOptions: (input, cb) =>
    # Determine type of expression
    exprUtils = new ExprUtils(@props.schema)
    exprType = exprUtils.getExprType(@props.expr)

    # Create query to get matches
    exprCompiler = new ExprCompiler(@props.schema)

    # Add filter for input (simple if just text)
    if exprType == "text"
      filters = (@props.filters or []).concat({
        table: @props.expr.table
        jsonql: {
          type: "op"
          op: "~*"
          exprs: [
            exprCompiler.compileExpr(expr: @props.expr, tableAlias: "{alias}")
            escapeRegex(input)  # Don't use _.escapeRegExp as adds weird backslashes that postgres doesn't like
          ]
        }
      })
    else if exprType == "text[]"
      # Special filter for text[]
      filters = (@props.filters or []).concat({
        table: "_values_"
        jsonql: {
          type: "op"
          op: "~*"
          exprs: [
            { type: "field", tableAlias: "{alias}", column: "value" }
            "^" + escapeRegex(input)  # Don't use _.escapeRegExp as adds weird backslashes that postgres doesn't like
          ]
        }
      })
    else
      return

    # Execute query
    @props.quickfiltersDataSource.getValues @props.index, @props.expr, filters, null, 250, (err, values) =>
      if err
        return 

      # Filter null and blank
      values = _.filter(values, (value) -> value)

      cb(_.map(values, (value) -> { value: value, label: value }))
      
    return

  renderSingle: ->
    currentValue = if @props.value then { value: @props.value, label: @props.value } else null

    R AsyncReactSelect, 
      key: JSON.stringify(@props.filters)  # Include to force a change when filters change
      placeholder: "All"
      value: currentValue
      loadOptions: @getOptions
      onChange: if @props.onChange then @handleSingleChange
      isClearable: true
      defaultOptions: true
      isDisabled: not @props.onChange?
      noOptionsMessage: () => "Type to search"
      styles: { 
        # Keep menu above fixed data table headers
        menu: (style) => _.extend({}, style, zIndex: 2000)
      }


  renderMultiple: ->
    currentValue = if @props.value then _.map(@props.value, (v) => { value: v, label: v }) else null

    R AsyncReactSelect, 
      placeholder: "All"
      value: currentValue
      key: JSON.stringify(@props.filters)  # Include to force a change when filters change
      isMulti: true
      loadOptions: @getOptions
      defaultOptions: true
      onChange: if @props.onChange then @handleMultipleChange
      isClearable: true
      isDisabled: not @props.onChange?
      noOptionsMessage: () => "Type to search"
      styles: { 
        # Keep menu above fixed data table headers
        menu: (style) => _.extend({}, style, zIndex: 2000)
      }

  render: ->
    R 'div', style: { width: "100%" },
      if @props.multi
        @renderMultiple()
      else
        @renderSingle()

escapeRegex = (s) -> s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')