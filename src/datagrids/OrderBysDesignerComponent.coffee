_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

ExprUtils = require("mwater-expressions").ExprUtils
ExprComponent = require('mwater-expressions-ui').ExprComponent
ReactReorderable = require 'react-reorderable'

# Edits an orderBys which is a list of expressions and directions. See README.md
module.exports = class OrderBysDesignerComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired     # schema to use
    dataSource: React.PropTypes.object.isRequired # dataSource to use
    table: React.PropTypes.string.isRequired
    orderBys: React.PropTypes.array.isRequired     # Columns list See README.md of this folder
    onChange: React.PropTypes.func.isRequired # Called when columns changes

  @defaultProps:
    orderBys: []

  handleChange: (index, orderBy) =>
    orderBys = @props.orderBys.slice()
    orderBys[index] = orderBy
    @props.onChange(orderBys)

  handleRemove: (index) =>
    orderBys = @props.orderBys.slice()
    orderBys.splice(index, 1)
    @props.onChange(orderBys)

  handleAdd: =>
    orderBys = @props.orderBys.slice()
    orderBys.push({ expr: null, direction: "asc" })
    @props.onChange(orderBys)

  render: ->
    H.div null,
      _.map @props.orderBys, (orderBy, index) =>
        R OrderByDesignerComponent, 
          key: index
          schema: @props.schema
          table: @props.table
          dataSource: @props.dataSource
          orderBy: orderBy
          onChange: @handleChange.bind(null, index)
          onRemove: @handleRemove.bind(null, index)

      H.button
        key: "add"
        type: "button"
        className: "btn btn-link"
        onClick: @handleAdd,
          H.span className: "glyphicon glyphicon-plus"
          " Add Ordering"

class OrderByDesignerComponent extends React.Component
  @propTypes: 
    orderBy: React.PropTypes.array.isRequired
    onChange: React.PropTypes.func.isRequired
    onRemove: React.PropTypes.func.isRequired
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    table: React.PropTypes.string # Current table

  handleExprChange: (expr) =>
    @props.onChange(_.extend({}, @props.orderBy, expr: expr))

  handleDirectionChange: (ev) =>
    @props.onChange(_.extend({}, @props.orderBy, direction: if ev.target.checked then "desc" else "asc"))

  render: ->
    H.div className: "row",
      H.div className: "col-xs-7",
        R ExprComponent,
          schema: @props.schema
          dataSource: @props.dataSource
          table: @props.table
          types: ['text', 'number', 'boolean', 'date', 'datetime']
          aggrStatuses: ["individual", "literal", "aggregate"]
          value: @props.orderBy.expr
          onChange: @handleExprChange
      H.div className: "col-xs-3",
        H.div className: "checkbox-inline",
          H.label null,
            H.input type: "checkbox", checked: @props.orderBy.direction == "desc", onChange: @handleDirectionChange
            "Reverse"
      H.div className: "col-xs-1",
        H.button className: "btn btn-xs btn-link", type: "button", onClick: @props.onRemove,
          H.span className: "glyphicon glyphicon-remove"
