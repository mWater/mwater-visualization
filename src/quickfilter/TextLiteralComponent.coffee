_ = require 'lodash'
PropTypes = require('prop-types')
React = require 'react'
H = React.DOM
R = React.createElement
ReactSelect = require 'react-select'
ExprCompiler = require('mwater-expressions').ExprCompiler
injectTableAlias = require('mwater-expressions').injectTableAlias

# Displays a combo box that allows selecting single text value from an expression
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
    value = if val then val else null # Blank is null
    @props.onChange(value)

  handleMultipleChange: (val) =>
    value = if val then val.split("\n") else []

    if value.length > 0
      @props.onChange(value)
    else
      @props.onChange(null)

  getOptions: (input, cb) =>
    # Create query to get matches
    exprCompiler = new ExprCompiler(@props.schema)

    # Add filter for input
    filters = (@props.filters or []).concat({
      table: @props.expr.table
      jsonql: {
        type: "op"
        op: "~*"
        exprs: [
          exprCompiler.compileExpr(expr: @props.expr, tableAlias: "{alias}")
          "^" + escapeRegex(input)  # Don't use _.escapeRegExp as adds weird backslashes that postgres doesn't like
        ]
      }
    })

    # Execute query
    @props.quickfiltersDataSource.getValues @props.index, @props.expr, filters, null, 250, (err, values) =>
      if err
        cb(err)
        return 

      # Filter null and blank
      values = _.filter(values, (value) -> value)

      cb(null, {
        options: _.map(values, (value) -> { value: value, label: value })
        complete: false # TODO rows.length < 50 # Complete if didn't hit limit
      })
      
    return

  renderSingle: ->
    R ReactSelect, 
      placeholder: "All"
      value: @props.value or ""
      asyncOptions: @getOptions
      onChange: if @props.onChange then @handleSingleChange
      disabled: not @props.onChange?

  renderMultiple: ->
    R ReactSelect, 
      placeholder: "All"
      value: (@props.value or []).join("\n")
      multi: true
      delimiter: "\n"
      asyncOptions: @getOptions
      onChange: if @props.onChange then @handleMultipleChange
      disabled: not @props.onChange?

  render: ->
    H.div style: { width: "100%" },
      if @props.multi
        @renderMultiple()
      else
        @renderSingle()

escapeRegex = (s) -> s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')