React = require 'react'
H = React.DOM
ScalarExprTreeBuilder = require './ScalarExprTreeBuilder'
ScalarExprTreeComponent = require './ScalarExprTreeComponent'
ExpressionBuilder = require './ExpressionBuilder'
EditableLinkComponent = require '../EditableLinkComponent'

# Component which appears in popup to allow editing scalar expression
module.exports = class ScalarExprEditorComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
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
      height: 350
      )

  renderAggr: ->
    exprBuilder = new ExpressionBuilder(@props.schema)
    if @props.value and @props.value.aggr
      # Use lower case to fit in sentense
      options = _.map(exprBuilder.getAggrs(@props.value.expr), (aggr) -> { id: aggr.id, name: aggr.name.toLowerCase() })

      # Do not render if only possible aggregation is count
      if options.length == 1 and options[0].id == "count"
        return 

      currentOption = _.findWhere(options, id: @props.value.aggr)
        
      return H.div null,
        H.br()
        H.div null, 
          H.label null, "Aggregation"
        "When there are multiple values, use the "
        React.createElement(EditableLinkComponent, 
          dropdownItems: options
          onDropdownItemClicked: @handleAggrChange
          if currentOption then currentOption.name
          )

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
          schema: @props.schema
          dataSource: @props.dataSource
          table: whereTable
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
