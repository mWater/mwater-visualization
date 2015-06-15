H = React.DOM
ScalarExprComponent = require './ScalarExprComponent'
literalComponents = require './literalComponents'
ExpressionBuilder = require './ExpressionBuilder'

module.exports = class ComparisonExprComponent extends React.Component
  @propTypes: 
    expr: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired 
    schema: React.PropTypes.object.isRequired
    table: React.PropTypes.string.isRequired 
  
  handleLhsChange: (lhs) =>
    @props.onChange(_.extend({}, @props.expr or { type: "comparison", table: @props.table }, lhs: lhs))

  handleOpChange: (ev) =>
    @props.onChange(_.extend({}, @props.expr, op: ev.target.value))

  handleRhsChange: (rhs) =>
    @props.onChange(_.extend({}, @props.expr, rhs: rhs))

  render: ->
    exprBuilder = new ExpressionBuilder(@props.schema)

    # Create LHS
    lhsControl = React.createElement(ScalarExprComponent, 
      key: "lhs",
      schema: @props.schema, 
      table: @props.table, 
      value: @props.expr.lhs,
      onChange: @handleLhsChange)

    # Create op if LHS present
    lhsType = exprBuilder.getExprType(@props.expr.lhs)
    if lhsType
      ops = exprBuilder.getComparisonOps(lhsType)
      opControl = H.select 
        key: "op",
        className: "form-control input-sm",
        style: { width: "auto", display: "inline-block", marginRight: 3 }
        value: @props.expr.op
        onChange: @handleOpChange,
          _.map(ops, (op) -> H.option(key: op.id, value: op.id, op.name))

    if lhsType and @props.expr.op
      rhsType = exprBuilder.getComparisonRhsType(lhsType, @props.expr.op)
      switch rhsType
        when "text"
          rhsControl = React.createElement(literalComponents.TextComponent, key: "rhs", expr: @props.expr.rhs, onChange: @handleRhsChange)
        when "integer"
          rhsControl = React.createElement(literalComponents.IntegerComponent, key: "rhs", expr: @props.expr.rhs, onChange: @handleRhsChange)
        when "decimal"
          rhsControl = React.createElement(literalComponents.DecimalComponent, key: "rhs", expr: @props.expr.rhs, onChange: @handleRhsChange)
        when "date"
          rhsControl = React.createElement(literalComponents.DateComponent, key: "rhs", expr: @props.expr.rhs, onChange: @handleRhsChange)
        when "enum"
          rhsControl = React.createElement(literalComponents.EnumComponent, 
            key: "rhs", 
            expr: @props.expr.rhs, 
            enumValues: exprBuilder.getExprValues(@props.expr.lhs)
            onChange: @handleRhsChange)

    return H.div style: { display: "inline-block" },
      lhsControl,
      opControl,
      rhsControl


