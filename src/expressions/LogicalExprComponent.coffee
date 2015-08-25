React = require 'react'
H = React.DOM
ComparisonExprComponent = require './ComparisonExprComponent'

# Displays a logical expression, which is a series of comparison 
# expressions anded or ored together. Shows a simple "+ Add Filter" button
# if no expressions
module.exports = class LogicalExprComponent extends React.Component
  @propTypes: 
    value: React.PropTypes.object
    onChange: React.PropTypes.func.isRequired 
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    table: React.PropTypes.string.isRequired 

  handleExprChange: (i, expr) =>
    # Replace exprs
    exprs = @props.value.exprs.slice()
    exprs[i] = expr
    @props.onChange(_.extend({}, @props.value, exprs: exprs))

  handleAdd: (newExpr) =>
    expr = @props.value or { type: "logical", table: @props.table, op: "and", exprs: [] }

    # Convert field expression to scalar to be consistent and since scalar expression editor
    # expects scalar expressions in the comparison expr.
    if newExpr and newExpr.type == "field"
      newExpr = { type: "scalar", table: newExpr.table, expr: newExpr, joins: [] }

    exprs = expr.exprs.concat([{ type: "comparison", table: @props.table, lhs: newExpr }])
    @props.onChange(_.extend({}, expr, exprs: exprs))

  handleRemove: (i) =>
    exprs = @props.value.exprs.slice()
    exprs.splice(i, 1)
    @props.onChange(_.extend({}, @props.value, exprs: exprs))    

  renderAdd: ->
    # Get named expressions
    namedExprs = @props.schema.getNamedExprs(@props.table)

    # Simple button if no named expressions
    if namedExprs.length == 0
      return H.button type: "button", className: "btn btn-sm btn-default", onClick: @handleAdd.bind(null, null),
        H.span className: "glyphicon glyphicon-plus"
        " Add Filter"

    return H.div className: "btn-group",
      H.button type: "button", "data-toggle": "dropdown", className: "btn btn-default dropdown-toggle",
        H.span className: "glyphicon glyphicon-plus"
        " Add Filter"
      H.ul className: "dropdown-menu",
        _.map(namedExprs, (ne) =>
          H.li key: ne.id,
            H.a onClick: @handleAdd.bind(null, ne.expr), ne.name
          )
        H.li key: "_divider", className: "divider"
        H.li key: "_advanced",
          H.a onClick: @handleAdd.bind(null, null), "Advanced..."

  renderDropdownItem: (icon, label, onClick) ->
    return H.li key: label,
      H.a onClick: onClick, 
        if icon then H.span(className: "glyphicon glyphicon-#{icon} text-muted")
        if icon then " "
        label

  renderGearMenu: (i) ->
    return H.div style: { float: "right", position: "relative" }, className: "hover-display-child",
      H.div "data-toggle": "dropdown", 
        H.div style: { color: "#337ab7" },
          H.span className: "glyphicon glyphicon-cog"
      H.ul className: "dropdown-menu dropdown-menu-right", 
        @renderDropdownItem("remove", "Remove", @handleRemove.bind(null, i))

  render: ->
    if @props.value
      childElems = _.map @props.value.exprs, (e, i) =>
        H.div key: "#{i}", className: "hover-display-parent", style: { marginBottom: 20 },
          @renderGearMenu(i)
          React.createElement(ComparisonExprComponent, 
            value: e
            schema: @props.schema
            dataSource: @props.dataSource
            table: @props.table
            onChange: @handleExprChange.bind(null, i))
 
    # Render all expressions (comparisons for now)
    H.div null,
      childElems
      H.div style: { marginTop: 5 },
        @renderAdd()

