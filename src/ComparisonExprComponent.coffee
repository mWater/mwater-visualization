H = React.DOM
ScalarExprComponent = require './ScalarExprComponent'
literalComponents = require './literalComponents'

module.exports = ComparisonExprComponent = React.createClass {
  propTypes: {
    expr: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired 
    schema: React.PropTypes.object.isRequired
    baseTableId: React.PropTypes.string.isRequired 
  }

  handleLhsChange: (lhs) ->
    @props.onChange(_.extend({}, @props.expr, lhs: lhs))

  handleOpChange: (ev) ->
    @props.onChange(_.extend({}, @props.expr, op: ev.target.value))

  handleRhsChange: (rhs) ->
    @props.onChange(_.extend({}, @props.expr, rhs: rhs))

  render: ->
    # Create LHS
    lhsControl = React.createElement(ScalarExprComponent, 
      key: "lhs",
      schema: @props.schema, 
      baseTableId: @props.baseTableId, 
      expr: @props.expr.lhs,
      onChange: @handleLhsChange)

    # Create op if LHS present
    lhsType = @props.schema.getExprType(@props.expr.lhs)
    if lhsType
      ops = @props.schema.getComparisonOps(lhsType)
      opControl = H.select 
        key: "op",
        className: "form-control input-sm",
        style: { width: "auto", display: "inline-block", marginRight: 3 }
        value: @props.expr.op
        onChange: @handleOpChange,
          _.map(ops, (op) -> H.option(key: op.id, value: op.id, op.name))

    if lhsType and @props.expr.op
      rhsType = @props.schema.getComparisonRhsType(lhsType, @props.expr.op)
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
            enumValues: @props.schema.getExprValues(@props.expr.lhs)
            onChange: @handleRhsChange)

    return H.div style: { display: "inline-block" },
      lhsControl,
      opControl,
      rhsControl
}

