React = require 'react'
H = React.DOM
ScalarExprComponent = require '../ScalarExprComponent'
ExpressionBuilder = require '../ExpressionBuilder'
EditableLinkComponent = require '../../EditableLinkComponent'

# Axis component that allows designing of an axis
module.exports = class AxisComponent extends React.Component
  @propTypes:
    editorTitle: React.PropTypes.any.isRequired # Title for display and popups
    schema: React.PropTypes.object.isRequired # schema to use
    dataSource: React.PropTypes.object.isRequired

    table: React.PropTypes.string # Limits table to this table
    types: React.PropTypes.array # Optional types to limit to

    aggrNeed: React.PropTypes.oneOf(['none', 'optional', 'required']).isRequired

    value: React.PropTypes.object # { expr: scalar expression, aggr: aggregate }
    onChange: React.PropTypes.func.isRequired # Called when changes

  handleExprChange: (expr) =>
    @props.onChange(_.extend({}, @props.value, { expr: expr }))

  handleAggrChange: (aggr) =>
    @props.onChange(_.extend({}, @props.value, { aggr: aggr }))

  renderAggr: ->
    if @props.aggrNeed == "none"
      return
      
    exprBuilder = new ExpressionBuilder(@props.schema)

    # Only render aggregate if has a expr with a type that is not count
    if @props.value and exprBuilder.getExprType(@props.value.expr) != "count"
      exprBuilder = new ExpressionBuilder(@props.schema)
      aggrs = exprBuilder.getAggrs(@props.value.expr)

      # Remove latest, as it is tricky to group by. TODO
      aggrs = _.filter(aggrs, (aggr) -> aggr.id != "last")
      currentAggr = _.findWhere(aggrs, id: @props.value.aggr)

      return React.createElement(EditableLinkComponent, 
          dropdownItems: aggrs
          onDropdownItemClicked: @handleAggrChange
          if currentAggr then currentAggr.name
          )

  render: ->
    H.div style: { display: "inline-block" }, 
      @renderAggr()
      React.createElement(ScalarExprComponent, 
        editorTitle: @props.editorTitle
        schema: @props.schema
        dataSource: @props.dataSource
        table: @props.table
        types: @props.types # TODO take into account aggregation
        onChange: @handleExprChange
        includeCount: @props.aggrNeed != "none"
        value: if @props.value then @props.value.expr)  

