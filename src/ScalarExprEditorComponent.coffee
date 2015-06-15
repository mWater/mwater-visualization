H = React.DOM
ReactSelect = require 'react-select'
ScalarExprTreeBuilder = require './ScalarExprTreeBuilder'
ScalarExprTreeComponent = require './ScalarExprTreeComponent'
ExpressionBuilder = require './ExpressionBuilder'

# Component which appears in popup to allow editing scalar expression
module.exports = class ScalarExprEditorComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired
    value: React.PropTypes.object
    table: React.PropTypes.string # Optional table to restrict selections to (can still follow joins to other tables)

  handleTreeChange: (val) =>
    # Set table and joins and expr
    @props.onChange(_.extend({}, @props.value or { type: "scalar" }, val))

  handleAggrChange: (aggr) =>
    # Set table and joins and expr
    @props.onChange(_.extend({}, @props.value, { aggr: aggr }))

  handleWhereChange: (where) =>
    # Set table and joins and expr
    @props.onChange(_.extend({}, @props.value, { where: where }))

  renderTree: ->
    # Create tree 
    treeBuilder = new ScalarExprTreeBuilder(@props.schema)
    tree = treeBuilder.getTree(table: @props.table)

    # Create tree component with value of table and path
    return React.createElement(ScalarExprTreeComponent, 
      tree: tree,
      value: _.pick(@props.value, "table", "joins", "expr")
      onChange: @handleTreeChange
      )

  renderAggr: ->
    exprBuilder = new ExpressionBuilder(@props.schema)
    if @props.value and @props.value.aggr
      # Do not render if only possible aggregation is count
      if exprBuilder.getExprType(@props.value.expr) == "id"
        return 
        
      options = _.map(exprBuilder.getAggrs(@props.value.expr), (aggr) -> { value: aggr.id, label: aggr.name })
      return H.div null,
        H.br()
        H.label null, "Aggregate by"
        React.createElement(ReactSelect, { 
          value: @props.value.aggr, 
          options: options 
          onChange: @handleAggrChange
        })

  renderWhere: ->
    exprBuilder = new ExpressionBuilder(@props.schema)

    if @props.value and @props.value.aggr
      # Prevent circularity problems in browserify
      LogicalExprComponent = require './LogicalExprComponent'

      return H.div null,
        H.br()
        H.label null, "Filter Aggregation"
        React.createElement(LogicalExprComponent, 
          schema: @props.schema, 
          table: @props.value.expr.table,
          value: @props.value.where
          onChange: @handleWhereChange
          )

  render: ->
    exprBuilder = new ExpressionBuilder(@props.schema)

    H.div null, 
      H.label null, "Select Field"
      H.div style: { overflowY: "scroll", height: 350, border: "solid 1px #CCC" },
        @renderTree()
      @renderAggr()
      @renderWhere()
