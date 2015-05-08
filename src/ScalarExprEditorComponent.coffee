H = React.DOM
JoinExprTreeComponent = require './JoinExprTreeComponent' 
ReactSelect = require 'react-select'

module.exports = ScalarExprEditorComponent = React.createClass {
  handleJoinExprSelect: (joinExpr) ->
    @props.scalar.expr = joinExpr.expr
    @props.scalar.joinIds = joinExpr.joinIds
    @props.onChange()

  handleAggrSelect: (aggr) ->
    @props.scalar.aggr = aggr
    @props.onChange()

  render: ->
    # Create tree 
    tree = @props.schema.getJoinExprTree({ baseTableId: @props.scalar.baseTableId })

    # Create list of aggregates
    if @props.scalar.expr and @props.schema.isAggrNeeded(@props.scalar.joinIds)
      options = _.map(@props.schema.getAggrs(@props.scalar.expr), (aggr) -> { value: aggr.id, label: aggr.name })
      aggrs = H.div null,
        H.br()
        H.br()
        H.label null, "Aggregate by"
        React.createElement(ReactSelect, { 
          value: @props.scalar.aggr, 
          options: options 
          onChange: @handleAggrSelect
        })

    H.div null, 
      H.label null, "Expression"
      H.div style: { overflowY: "scroll", height: 350 },
        React.createElement(JoinExprTreeComponent, tree: tree, onSelect: @handleJoinExprSelect, selectedValue: { expr: @props.scalar.expr, joinIds: @props.scalar.joinIds })
      H.div style: { width: "20em" }, aggrs
}
