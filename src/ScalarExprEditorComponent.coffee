React = require 'react'
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
    types: React.PropTypes.array # Optional types to limit to
    includeCount: React.PropTypes.bool # Optionally include count at root level of a table

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
    tree = treeBuilder.getTree(table: @props.table, types: @props.types, includeCount: @props.includeCount, initialValue: @props.value)

    # Create tree component with value of table and path
    return React.createElement(ScalarExprTreeComponent, 
      tree: tree,
      value: _.pick(@props.value, "table", "joins", "expr")
      onChange: @handleTreeChange
      )

  renderAggr: ->
    exprBuilder = new ExpressionBuilder(@props.schema)
    if @props.value and @props.value.aggr
      options = _.map(exprBuilder.getAggrs(@props.value.expr), (aggr) -> { value: aggr.id, label: aggr.name })

      # Do not render if only possible aggregation is count
      if options.length == 1 and options[0].value == "count"
        return 
        
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

      # Determine table to be filtered (follow joins)
      whereTable = exprBuilder.followJoins(@props.value.table, @props.value.joins)

      return H.div null,
        H.br()
        H.label null, "Filter Aggregation"
        React.createElement(LogicalExprComponent, 
          schema: @props.schema, 
          table: whereTable,
          value: @props.value.where
          onChange: @handleWhereChange
          )

  render: ->
    exprBuilder = new ExpressionBuilder(@props.schema)

    H.div null, 
      H.label null, "Select Field"
      @renderTree()
      @renderAggr()
      @renderWhere()
