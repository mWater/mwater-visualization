React = require 'react'
H = React.DOM
ScalarExprComponent = require '../ScalarExprComponent'
ExpressionBuilder = require '../ExpressionBuilder'
ExpressionCompiler = require '../ExpressionCompiler'
EditableLinkComponent = require '../../EditableLinkComponent'
update = require 'update-object'

# Axis component that allows designing of an axis
module.exports = class AxisComponent extends React.Component
  @propTypes:
    editorTitle: React.PropTypes.any.isRequired # Title for display and popups
    schema: React.PropTypes.object.isRequired # schema to use
    dataSource: React.PropTypes.object.isRequired

    table: React.PropTypes.string.isRequired # Table to use
    types: React.PropTypes.array # Optional types to limit to

    aggrNeed: React.PropTypes.oneOf(['none', 'optional', 'required']).isRequired

    value: React.PropTypes.object # See Axis Design.md
    onChange: React.PropTypes.func.isRequired # Called when changes

  componentDidMount: ->
    @checkMinMaxComputation()

  componentWillReceiveProps: ->
    @checkMinMaxComputation()

  # Compute min and max if xform of bin and not already present
  checkMinMaxComputation: ->
    exprCompiler = new ExpressionCompiler(@props.schema)

    value = @props.value

    if value and value.xform and value.xform.type == "bin" and (not value.xform.min? or not value.xform.max?)
      # Compile expression
      expr = exprCompiler.compileExpr(value.expr)

      # Create query
      query = {
        type: "query"
        selects: [
          { expr: { type: "op", op: "min", exprs: [expr]}, alias: "min" }
          { expr: { type: "op", op: "max", exprs: [expr]}, alias: "max" }
        ]
        from: @props.table
      }

      @props.dataSource.performQuery(query, (error, rows) =>
        if not error and rows.length > 0
          # Check that didn't change
          if value == @props.value
            @props.onChange(update(value, xform: { min: { $set: rows[0].min }, max: { $set: rows[0].max }}))
        )

  handleExprChange: (expr) =>
    # If no expression, reset
    if not expr
      @props.onChange(null)
      return
      
    # Set expression and clear xform
    @props.onChange(update(@props.value, $merge: { expr: expr, xform: null, aggr: null }))

  handleAggrChange: (aggr) =>
    @props.onChange(update(@props.value, $merge: { aggr: aggr }))

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

