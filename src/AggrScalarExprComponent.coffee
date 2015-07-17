React = require 'react'
H = React.DOM
ScalarExprComponent = require './ScalarExprComponent'
ExpressionBuilder = require './ExpressionBuilder'
EditableLinkComponent = require './EditableLinkComponent'

# Aggregated scalar component. Displays a single component that gets 
module.exports = class AggrScalarExprComponent extends React.Component
  @propTypes:
    editorTitle: React.PropTypes.any.isRequired # Title for display and popups
    schema: React.PropTypes.object.isRequired # schema to use

    table: React.PropTypes.string # Limits table to this table
    types: React.PropTypes.array # Optional types to limit to

    value: React.PropTypes.object # { expr: scalar expression, aggr: aggregate }
    onChange: React.PropTypes.func.isRequired # Called when changes

  handleExprChange: (expr) =>
    @props.onChange(_.extend({}, @props.value, { expr: expr }))

  handleAggrChange: (aggr) =>
    @props.onChange(_.extend({}, @props.value, { aggr: aggr }))

  renderAggr: ->
    exprBuilder = new ExpressionBuilder(@props.schema)

    # Only render if has a real expr with a type (not a count(*))
    if @props.value and @props.value.expr and exprBuilder.getExprType(@props.value.expr)
      exprBuilder = new ExpressionBuilder(@props.schema)
      aggrs = exprBuilder.getAggrs(@props.value.expr)

      # Remove latest, as it is tricky to group by. TODO
      aggrs = _.filter(aggrs, (aggr) -> aggr.id != "last")
      currentAggr = _.findWhere(aggrs, id: @props.value.aggr)

      return React.createElement(EditableLinkComponent, 
        dropdownItems: aggrs
        onDropdownItemClicked: @handleAggrChange
        if currentAggr then currentAggr.name + " of\u00A0"
        )

  render: ->
    H.div style: { display: "inline-block" }, 
      @renderAggr()
      React.createElement(ScalarExprComponent, 
        editorTitle: @props.editorTitle
        schema: @props.schema
        table: @props.table
        types: @props.types # TODO take into account aggregation
        onChange: @handleExprChange
        includeCount: true
        value: if @props.value then @props.value.expr)  

