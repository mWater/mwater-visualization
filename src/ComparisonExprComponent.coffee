React = require 'react'
H = React.DOM
ScalarExprComponent = require './ScalarExprComponent'
literalComponents = require './literalComponents'
ExpressionBuilder = require './ExpressionBuilder'
EditableLinkComponent = require './EditableLinkComponent'

module.exports = class ComparisonExprComponent extends React.Component
  @propTypes: 
    value: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired 
    schema: React.PropTypes.object.isRequired
    table: React.PropTypes.string.isRequired 
  
  handleLhsChange: (lhs) =>
    @props.onChange(_.extend({}, @props.value or { type: "comparison", table: @props.table }, lhs: lhs))

  handleOpChange: (op) =>
    @props.onChange(_.extend({}, @props.value, op: op))

  handleRhsChange: (rhs) =>
    @props.onChange(_.extend({}, @props.value, rhs: rhs))

  render: ->
    exprBuilder = new ExpressionBuilder(@props.schema)

    # Create LHS
    lhsControl = React.createElement(ScalarExprComponent, 
      key: "lhs"
      schema: @props.schema
      table: @props.table
      value: @props.value.lhs
      onChange: @handleLhsChange
      editorTitle: "Filter By"
      editorInitiallyOpen: not @props.value.lhs  # Open editor if no value
      )

    # Create op if LHS present
    lhsType = exprBuilder.getExprType(@props.value.lhs)
    if lhsType
      ops = exprBuilder.getComparisonOps(lhsType)
      currentOp = _.findWhere(ops, id: @props.value.op)

      opControl = React.createElement(EditableLinkComponent, 
        dropdownItems: ops
        onDropdownItemClicked: @handleOpChange
        if currentOp then currentOp.name
        )

    if lhsType and @props.value.op
      rhsType = exprBuilder.getComparisonRhsType(lhsType, @props.value.op)
      switch rhsType
        when "text"
          rhsControl = React.createElement(literalComponents.TextComponent, key: "rhs", value: @props.value.rhs, onChange: @handleRhsChange)
        when "integer"
          rhsControl = React.createElement(literalComponents.IntegerComponent, key: "rhs", value: @props.value.rhs, onChange: @handleRhsChange)
        when "decimal"
          rhsControl = React.createElement(literalComponents.DecimalComponent, key: "rhs", value: @props.value.rhs, onChange: @handleRhsChange)
        when "date"
          rhsControl = React.createElement(literalComponents.DateComponent, key: "rhs", value: @props.value.rhs, onChange: @handleRhsChange)
        when "enum"
          rhsControl = React.createElement(literalComponents.EnumComponent, 
            key: "rhs", 
            value: @props.value.rhs, 
            enumValues: exprBuilder.getExprValues(@props.value.lhs)
            onChange: @handleRhsChange)
        when "enum[]"
          rhsControl = React.createElement(literalComponents.EnumArrComponent, 
            key: "rhs", 
            value: @props.value.rhs, 
            enumValues: exprBuilder.getExprValues(@props.value.lhs)
            onChange: @handleRhsChange)

    return H.div style: { display: "inline-block" },
      lhsControl
      " "
      opControl
      " "
      rhsControl


