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
    value: PropTypes.string
    onChange: PropTypes.func

    schema: PropTypes.object.isRequired
    quickfiltersDataSource: PropTypes.object.isRequired  # See QuickfiltersDataSource
    expr: PropTypes.object.isRequired
    index: PropTypes.number.isRequired

    # Filters to add to the component to restrict values
    filters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired    # id table to filter
      jsonql: PropTypes.object.isRequired   # jsonql filter with {alias} for tableAlias
    }))

  handleChange: (val) =>
    value = if val then val else null # Blank is null
    @props.onChange(value)

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
          "^" + _.escapeRegExp(input)
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

  render: ->
    value = @props.value or "" 

    H.div style: { width: "100%" },
      R(ReactSelect, { 
        placeholder: "All"
        value: value
        asyncOptions: @getOptions
        onChange: if @props.onChange then @handleChange
        disabled: not @props.onChange?
      })

