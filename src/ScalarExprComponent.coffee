H = React.DOM
JoinExprTreeComponent = require './JoinExprTreeComponent' 
ReactSelect = require 'react-select'
DesignValidator = require './DesignValidator'
SaveCancelModalComponent = require './SaveCancelModalComponent'
HoverEditComponent = require './HoverEditComponent'

module.exports = ScalarExprComponent = React.createClass {
  render: ->
    editor = React.createElement(SaveCancelModalComponent, { 
        title: "Select Expression"
        initialValue: @props.expr
        onChange: @props.onChange
        # onValidate: (data) =>
        #   designValidator.validateExpr(data)
        },
          React.createElement(ScalarExprEditorComponent, schema: @props.schema, baseTableId: @props.baseTableId)
      )

    React.createElement HoverEditComponent, 
      editor: editor,
        H.input 
          className: "form-control input-sm",
          readOnly: true, 
          type: "text", 
          style: { backgroundColor: "white", cursor: "pointer" }
          value: @props.schema.summarizeExpr(@props.expr)  
}

ScalarExprEditorComponent = React.createClass {
  handleJoinExprSelect: (joinExpr) ->
    # Create new expr
    scalar = _.extend({}, @props.value, { type: "scalar", baseTableId: @props.baseTableId, expr: joinExpr.expr, joinIds: joinExpr.joinIds })

    # Clean
    scalar = new DesignValidator(@props.schema).cleanScalarExpr(scalar)

    @props.onChange(scalar)

  handleAggrChange: (aggrId) ->
    # Create new expr
    scalar = _.extend({}, @props.value, { aggrId: aggrId })

    # Clean
    scalar = new DesignValidator(@props.schema).cleanScalarExpr(scalar)
    
    @props.onChange(scalar)

  handleWhereChange: (where) ->
    # Create new expr
    scalar = _.extend({}, @props.value, { where: where })

    # Clean
    scalar = new DesignValidator(@props.schema).cleanScalarExpr(scalar)
    
    @props.onChange(scalar)

  render: ->
    # Create tree 
    tree = @props.schema.getJoinExprTree({ baseTableId: @props.baseTableId })

    # Create list of aggregates
    if @props.value and @props.schema.isAggrNeeded(@props.value.joinIds)
      options = _.map(@props.schema.getAggrs(@props.value.expr), (aggr) -> { value: aggr.id, label: aggr.name })
      aggrs = H.div null,
        H.br()
        H.br()
        H.label null, "Aggregate by"
        React.createElement(ReactSelect, { 
          value: @props.value.aggrId, 
          options: options 
          onChange: @handleAggrChange
        })

    if @props.value
      LogicalExprComponent = require './LogicalExprComponent'
      whereElem = React.createElement(LogicalExprComponent, 
        schema: @props.schema, 
        baseTableId: @props.schema.getExprTable(@props.value.expr).id,
        expr: @props.value.where
        onChange: @handleWhereChange
        )

    H.div null, 
      H.label null, "Expression"
      H.div style: { overflowY: "scroll", height: 350 },
        React.createElement(JoinExprTreeComponent, 
          tree: tree, 
          onSelect: @handleJoinExprSelect, 
          selectedValue: (if @props.value then { expr: @props.value.expr, joinIds: @props.value.joinIds }))
      H.div style: { width: "20em" }, aggrs
      whereElem
}
