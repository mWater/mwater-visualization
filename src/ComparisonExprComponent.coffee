H = React.DOM
ScalarExprComponent = require './ScalarExprComponent'
literalComponents = require './literalComponents'
ExpressionBuilder = require './ExpressionBuilder'

module.exports = class ComparisonExprComponent extends React.Component
  @propTypes: 
    value: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired 
    schema: React.PropTypes.object.isRequired
    table: React.PropTypes.string.isRequired 
  
  handleLhsChange: (lhs) =>
    @props.onChange(_.extend({}, @props.value or { type: "comparison", table: @props.table }, lhs: lhs))

  handleOpChange: (ev) =>
    @props.onChange(_.extend({}, @props.value, op: ev.target.value))

  handleRhsChange: (rhs) =>
    @props.onChange(_.extend({}, @props.value, rhs: rhs))

  render: ->
    exprBuilder = new ExpressionBuilder(@props.schema)

    # Create LHS
    lhsControl = React.createElement(ScalarExprComponent, 
      key: "lhs",
      schema: @props.schema, 
      table: @props.table, 
      value: @props.value.lhs,
      onChange: @handleLhsChange)

    # Create op if LHS present
    lhsType = exprBuilder.getExprType(@props.value.lhs)
    if lhsType
      ops = exprBuilder.getComparisonOps(lhsType)
      opControl = H.select 
        key: "op",
        className: "form-control input-sm",
        style: { width: "auto", display: "inline-block", marginRight: 3 }
        value: @props.value.op
        onChange: @handleOpChange,
          _.map(ops, (op) -> H.option(key: op.id, value: op.id, op.name))

    if lhsType and @props.value.op
      rhsType = exprBuilder.getComparisonRhsType(lhsType, @props.value.op)
      switch rhsType
        when "text"
          rhsControl = React.createElement(literalComponents.TextComponent, key: "rhs", expr: @props.value.rhs, onChange: @handleRhsChange)
        when "integer"
          rhsControl = React.createElement(literalComponents.IntegerComponent, key: "rhs", expr: @props.value.rhs, onChange: @handleRhsChange)
        when "decimal"
          rhsControl = React.createElement(literalComponents.DecimalComponent, key: "rhs", expr: @props.value.rhs, onChange: @handleRhsChange)
        when "date"
          rhsControl = React.createElement(literalComponents.DateComponent, key: "rhs", expr: @props.value.rhs, onChange: @handleRhsChange)
        when "enum"
          rhsControl = React.createElement(literalComponents.EnumComponent, 
            key: "rhs", 
            expr: @props.value.rhs, 
            enumValues: exprBuilder.getExprValues(@props.value.lhs)
            onChange: @handleRhsChange)

    return H.div style: { display: "inline-block" },
      lhsControl,
      opControl,
      rhsControl


