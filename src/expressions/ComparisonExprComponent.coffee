React = require 'react'
H = React.DOM
ScalarExprComponent = require './ScalarExprComponent'
literalComponents = require './literalComponents'
ExpressionBuilder = require './ExpressionBuilder'
EditableLinkComponent = require './../EditableLinkComponent'
TextArrayComponent = require './TextArrayComponent'
DateRangeComponent = require './DateRangeComponent'

module.exports = class ComparisonExprComponent extends React.Component
  @propTypes: 
    value: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired 
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
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
      dataSource: @props.dataSource
      table: @props.table
      value: @props.value.lhs
      onChange: @handleLhsChange
      preventRemove: true
      editorTitle: "Filter By"
      editorInitiallyOpen: not @props.value.lhs  # Open editor if no value
      )

    # Create op if LHS present
    lhsType = exprBuilder.getExprType(@props.value.lhs)
    if lhsType
      ops = exprBuilder.getComparisonOps(lhsType)
      currentOp = _.findWhere(ops, id: @props.value.op)

      # Hide if "is one of" for enum and text
      # Hide "between" for date and datetime
      hideOp = false
      if currentOp
        if currentOp.id == "= any" and lhsType in ['enum', 'text']
          hideOp = true
        if currentOp.id == "between" and lhsType in ['date', 'datetime']
          hideOp = true

      if not hideOp
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
        when "datetime"
          rhsControl = React.createElement(literalComponents.DatetimeComponent, key: "rhs", value: @props.value.rhs, onChange: @handleRhsChange)
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
        when "text[]"
          rhsControl = React.createElement(TextArrayComponent, 
            key: "rhs"
            value: @props.value.rhs
            expr: @props.value.lhs
            schema: @props.schema
            dataSource: @props.dataSource
            onChange: @handleRhsChange)
        when "daterange"
          rhsControl = React.createElement(DateRangeComponent, 
            key: "rhs"
            datetime: false
            value: @props.value.rhs
            onChange: @handleRhsChange)
        when "datetimerange"
          rhsControl = React.createElement(DateRangeComponent, 
            key: "rhs"
            datetime: true
            value: @props.value.rhs
            onChange: @handleRhsChange)

    return H.div null,
      lhsControl
      " "
      opControl
      " "
      rhsControl


