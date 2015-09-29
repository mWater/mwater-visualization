React = require 'react'
H = React.DOM
ScalarExprComponent = require '../ScalarExprComponent'
ExpressionBuilder = require '../ExpressionBuilder'
ExpressionCompiler = require '../ExpressionCompiler'
EditableLinkComponent = require '../../EditableLinkComponent'
AxisBuilder = require './AxisBuilder'
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
    @checkMinMaxComputation(@props)

  componentWillReceiveProps: (nextProps) ->
    @checkMinMaxComputation(nextProps)

  # Compute min and max if xform of bin and not already present
  checkMinMaxComputation: (props) ->
    exprCompiler = new ExpressionCompiler(props.schema)

    value = props.value

    if value and value.xform and value.xform.type == "bin" and (not value.xform.min? or not value.xform.max?)
      numBins = value.xform.numBins

      # Compile expression
      expr = exprCompiler.compileExpr(expr: value.expr, tableAlias: "main")

      # Create query to get percentiles
      # To do so, split into numBins + 2 percentile sections and exclude first and last
      # That will give a nice distribution when using width_bucket so that all are used
      # select max(inner.val), min(inner.val) f
      # from (select expression as val, ntile(numBins + 2) over (order by expression asc) as ntilenum
      # from the_table where exprssion is not null)
      # where inner.ntilenum > 1 and inner.ntilenum < numBins + 2
      # Inspired by: http://dba.stackexchange.com/questions/17086/fast-general-method-to-calculate-percentiles
      query = {
        type: "query"
        selects: [
          { type: "select", expr: { type: "op", op: "min", exprs: [{ type: "field", tableAlias: "inner", column: "val" }]}, alias: "min" }
          { type: "select", expr: { type: "op", op: "max", exprs: [{ type: "field", tableAlias: "inner", column: "val" }]}, alias: "max" }
        ]
        from: {
          type: "subquery"
          query: {
            type: "query"
            selects: [
              { type: "select", expr: expr, alias: "val" }
              { 
                type: "select"
                expr: { 
                  type: "op"
                  op: "ntile"
                  exprs: [numBins + 2]
                }
                over: { 
                  orderBy: [{ expr: expr, direction: "asc" }]
                } 
                alias: "ntilenum" 
              }
            ]
            from: { type: "table", table: props.table, alias: "main" }
            where: {
              type: "op"
              op: "is not null"
              exprs: [expr]
            }

          }
          alias: "inner"
        }
        where: {
          type: "op"
          op: "between"
          exprs: [{ type: "field", tableAlias: "inner", column: "ntilenum" }, 2, numBins + 1]
        }
      }

      props.dataSource.performQuery(query, (error, rows) =>
        if not error and rows.length > 0
          # Check that didn't change and that max and min are different
          if value == props.value and rows[0].min and rows[0].min != rows[0].max
            # Parse as string gets returned sometimes TODO
            props.onChange(update(value, xform: { min: { $set: parseFloat(rows[0].min) }, max: { $set: parseFloat(rows[0].max) }}))
        )

  handleExprChange: (expr) =>
    # If no expression, reset
    if not expr
      @props.onChange(null)
      return
      
    # Set expression and clear xform
    @props.onChange({ expr: expr, xform: null, aggr: null })

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
    axisBuilder = new AxisBuilder(schema: @props.schema)

    H.div style: { display: "inline-block" }, 
      @renderAggr()
      React.createElement(ScalarExprComponent, 
        editorTitle: @props.editorTitle
        schema: @props.schema
        dataSource: @props.dataSource
        table: @props.table
        types: axisBuilder.getExprTypes(@props.types, @props.aggrNeed)
        onChange: @handleExprChange
        includeCount: @props.aggrNeed != "none"
        value: if @props.value then @props.value.expr)  
