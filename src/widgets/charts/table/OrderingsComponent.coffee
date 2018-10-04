PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

ExprComponent = require("mwater-expressions-ui").ExprComponent

# Edits the orderings of a chart
# Orderings are an array of { axis: axis to order by, direction: "asc"/"desc" }
# NOTE: no longer uses complete axis, just the expr
module.exports = class OrderingsComponent extends React.Component
  @propTypes: 
    orderings: PropTypes.array.isRequired
    onOrderingsChange: PropTypes.func.isRequired
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired
    table: PropTypes.string # Current table

  handleAdd: =>
    orderings = @props.orderings.slice()
    orderings.push({ axis: null, direction: "asc" })
    @props.onOrderingsChange(orderings)

  handleOrderingRemove: (index) =>
    orderings = @props.orderings.slice()
    orderings.splice(index, 1)
    @props.onOrderingsChange(orderings)

  handleOrderingChange: (index, ordering) =>
    orderings = @props.orderings.slice()
    orderings[index] = ordering
    @props.onOrderingsChange(orderings)

  render: ->
    R 'div', null,
      _.map @props.orderings, (ordering, i) => 
        R(OrderingComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          ordering: ordering
          table: @props.table
          onOrderingChange: @handleOrderingChange.bind(null, i)
          onOrderingRemove: @handleOrderingRemove.bind(null, i))

      R 'button', type: "button", className: "btn btn-sm btn-default", onClick: @handleAdd, key: "add",
        R 'span', className: "glyphicon glyphicon-plus"
        " Add Ordering"

class OrderingComponent extends React.Component
  @propTypes: 
    ordering: PropTypes.object.isRequired
    onOrderingChange: PropTypes.func.isRequired
    onOrderingRemove: PropTypes.func.isRequired
    schema: PropTypes.object.isRequired
    dataSource: PropTypes.object.isRequired
    table: PropTypes.string # Current table

  handleAxisChange: (axis) =>
    @props.onOrderingChange(_.extend({}, @props.ordering, axis: axis))

  handleExprChange: (expr) =>
    axis = _.extend({}, @props.ordering.axis or {}, expr: expr)
    @handleAxisChange(axis)

  handleDirectionChange: (ev) =>
    @props.onOrderingChange(_.extend({}, @props.ordering, direction: if ev.target.checked then "desc" else "asc"))

  render: ->
    R 'div', style: { marginLeft: 5 },
      R 'div', style: { textAlign: "right" },
        R 'button', className: "btn btn-xs btn-link", type: "button", onClick: @props.onOrderingRemove,
          R 'span', className: "glyphicon glyphicon-remove"
      R ExprComponent,
        schema: @props.schema
        dataSource: @props.dataSource
        table: @props.table
        types: ['text', 'number', 'boolean', 'date', 'datetime']
        aggrStatuses: ['individual', 'aggregate']
        value: @props.ordering.axis?.expr
        onChange: @handleExprChange
      R 'div', null, 
        R 'div', className: "checkbox-inline",
          R 'label', null,
            R 'input', type: "checkbox", checked: @props.ordering.direction == "desc", onChange: @handleDirectionChange
            "Reverse"
