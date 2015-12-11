_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

AxisComponent = require '../../axes/AxisComponent'

# Edits the orderings of a chart
# Orderings are an array of { axis: axis to order by, direction: "asc"/"desc" }
module.exports = class OrderingsComponent extends React.Component
  @propTypes: 
    orderings: React.PropTypes.array.isRequired
    onOrderingsChange: React.PropTypes.func.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    table: React.PropTypes.string # Current table

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
    H.div null,
      _.map @props.orderings, (ordering, i) => 
        R(OrderingComponent, 
          schema: @props.schema
          dataSource: @props.dataSource
          ordering: ordering
          table: @props.table
          onOrderingChange: @handleOrderingChange.bind(null, i)
          onOrderingRemove: @handleOrderingRemove.bind(null, i))

      H.button type: "button", className: "btn btn-sm btn-default", onClick: @handleAdd, key: "add",
        H.span className: "glyphicon glyphicon-plus"
        " Add Ordering"

class OrderingComponent extends React.Component
  @propTypes: 
    ordering: React.PropTypes.array.isRequired
    onOrderingChange: React.PropTypes.func.isRequired
    onOrderingRemove: React.PropTypes.func.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    table: React.PropTypes.string # Current table

  handleAxisChange: (axis) =>
    @props.onOrderingChange(_.extend({}, @props.ordering, axis: axis))

  handleDirectionChange: (ev) =>
    @props.onOrderingChange(_.extend({}, @props.ordering, direction: if ev.target.checked then "desc" else "asc"))

  render: ->
    H.div style: { marginLeft: 5 },
      H.button className: "btn btn-xs btn-link pull-right", type: "button", onClick: @props.onOrderingRemove,
        H.span className: "glyphicon glyphicon-remove"

      R AxisComponent,
        editorTitle: "Order"
        schema: @props.schema
        dataSource: @props.dataSource
        table: @props.table
        types: ['text', 'number', 'boolean', 'date', 'datetime']
        aggrNeed: 'optional'
        value: @props.ordering.axis
        onChange: @handleAxisChange
      H.div className: "checkbox",
        H.label null,
          H.input type: "checkbox", checked: @props.ordering.direction == "desc", onChange: @handleDirectionChange
          "Reverse"
