_ = require 'lodash'
PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
AsyncReactSelect = require('react-select/lib/Async').default
ExprUtils = require('mwater-expressions').ExprUtils
IdLiteralComponent = require('mwater-expressions-ui').IdLiteralComponent

# Quickfilter for an id[]
module.exports = class IdArrayQuickfilterComponent extends React.Component
  @propTypes:
    label: PropTypes.string.isRequired
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired

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
    # Determine table
    exprUtils = new ExprUtils(@props.schema)
    idTable = exprUtils.getExprIdTable(@props.expr)

    R 'div', style: { display: "inline-block", paddingRight: 10 },
      if @props.label
        R 'span', style: { color: "gray" }, @props.label + ":\u00a0"
      R 'div', style: { display: "inline-block", minWidth: "280px", verticalAlign: "middle" },
        # TODO should use quickfilter data source, but is complicated
        R IdLiteralComponent, {
          value: @props.value
          onChange: @props.onValueChange
          idTable: idTable
          schema: @props.schema
          dataSource: @props.dataSource
          placeholder: "All"
          multi: @props.multi
          # TODO Does not use filters that are passed in
        }
      if not @props.onValueChange
        R 'i', className: "text-warning fa fa-fw fa-lock"

