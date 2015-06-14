H = React.DOM
ReactSelect = require 'react-select'
ScalarExprTreeBuilder = require './ScalarExprTreeBuilder'
ScalarExprTreeComponent = require './ScalarExprTreeComponent'
ExpressionBuilder = require './ExpressionBuilder'

# Component which appears in popup to allow editing scalar expression
module.exports = class ScalarExprEditorComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired
    value: React.PropTypes.object.isRequired
    startTable: React.PropTypes.string # Optional start table to restrict selections to

  handleTreeChange: (val) =>
    # Set table and joins and expr
    newVal = _.extend({}, @props.value or { type: "scalar" }, val)

    # Clean 
    newVal = new ExpressionBuilder(@props.schema).cleanScalarExpr(newVal)

    @props.onChange(newVal)

  handleAggrChange: (aggr) =>
    # Set table and joins and expr
    newVal = _.extend({}, @props.value, { aggr: aggr })

    # Clean 
    newVal = new ExpressionBuilder(@props.schema).cleanScalarExpr(newVal)

    @props.onChange(newVal)

  renderTree: ->
    # Create tree 
    treeBuilder = new ScalarExprTreeBuilder(@props.schema)
    tree = treeBuilder.getTree(startTable: @props.startTable)

    # Create tree component with value of table and path
    return React.createElement(ScalarExprTreeComponent, 
      tree: tree,
      value: _.pick(@props.value, "table", "joins", "expr")
      onChange: @handleTreeChange
      )

  render: ->
    exprBuilder = new ExpressionBuilder(@props.schema)

    H.div null, 
      H.label null, "Select Field"
      H.div style: { overflowY: "scroll", height: 350, border: "solid 1px #CCC" },
        @renderTree()

      if @props.value and @props.value.aggr
        options = _.map(exprBuilder.getAggrs(@props.value.expr), (aggr) -> { value: aggr.id, label: aggr.name })
        aggrs = H.div null,
          H.br()
          H.label null, "Aggregate by"
          React.createElement(ReactSelect, { 
            value: @props.value.aggr, 
            options: options 
            onChange: @handleAggrChange
          })


#   handleJoinExprSelect: (joinExpr) ->
#     # Create new expr
#     scalar = _.extend({}, @props.value, { type: "scalar", baseTableId: @props.baseTableId, expr: joinExpr.expr, joinIds: joinExpr.joinIds })

#     # Clean
#     scalar = new DesignValidator(@props.schema).cleanScalarExpr(scalar)

#     @props.onChange(scalar)

#   handleAggrChange: (aggrId) ->
#     # Create new expr
#     scalar = _.extend({}, @props.value, { aggrId: aggrId })

#     # Clean
#     scalar = new DesignValidator(@props.schema).cleanScalarExpr(scalar)
    
#     @props.onChange(scalar)

#   handleWhereChange: (where) ->
#     # Create new expr
#     scalar = _.extend({}, @props.value, { where: where })

#     # Clean
#     scalar = new DesignValidator(@props.schema).cleanScalarExpr(scalar)
    
#     @props.onChange(scalar)

#   render: ->
#     # Create tree 
#     tree = @props.schema.getJoinExprTree({ baseTableId: @props.baseTableId })

#     # Create list of aggregates
#     # Hide if uuid expression as can only be counted (TODO: use primary key instead?)
#     if @props.value and @props.schema.isAggrNeeded(@props.value.joinIds) and @props.schema.getExprType(@props.value.expr) != "uuid"
#       options = _.map(@props.schema.getAggrs(@props.value.expr), (aggr) -> { value: aggr.id, label: aggr.name })
#       aggrs = H.div null,
#         H.br()
#         H.label null, "Aggregate by"
#         React.createElement(ReactSelect, { 
#           value: @props.value.aggrId, 
#           options: options 
#           onChange: @handleAggrChange
#         })

#     # TODO remove as well as hide this
#     if @props.value and @props.schema.isAggrNeeded(@props.value.joinIds)
#       LogicalExprComponent = require './LogicalExprComponent'
#       whereElem = H.div null,
#         H.br()
#         H.label null, "Filter Aggregation"
#         React.createElement(LogicalExprComponent, 
#           schema: @props.schema, 
#           baseTableId: @props.schema.getExprTable(@props.value.expr).id,
#           expr: @props.value.where
#           onChange: @handleWhereChange
#           )

#     H.div null, 
#       H.label null, "Expression"
#       H.div style: { overflowY: "scroll", height: 350, border: "solid 1px #CCC" },
#         React.createElement(JoinExprTreeComponent, 
#           tree: tree, 
#           onSelect: @handleJoinExprSelect, 
#           selectedValue: (if @props.value then { expr: @props.value.expr, joinIds: @props.value.joinIds }))
#       H.div style: { width: "20em" }, aggrs
#       H.br()
#       whereElem
# }
