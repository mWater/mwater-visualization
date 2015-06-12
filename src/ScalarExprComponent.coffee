H = React.DOM
JoinExprTreeComponent = require './JoinExprTreeComponent' 
ReactSelect = require 'react-select'
DesignValidator = require './DesignValidator'
ActionCancelModalComponent = require './ActionCancelModalComponent'

module.exports = class ScalarExprComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired
    expressionBuilder: React.PropTypes.object.isRequired
    editorTitle: React.PropTypes.string # Title of editor popup
    
    value: React.PropTypes.object # Current value of expression
    onChange: React.PropTypes.func.isRequired # Called when changes

  constructor: ->
    super
    # Editing is set to the currently being edited value
    @state = { editing: null }

  handleEditorOpen: => @setState(editing: @props.value or {})

  handleEditorCancel: => @setState(editing: null)

  handleEditorSave: =>
    # TODO validate
    @props.onChange(@state.editing)
    @setState(editing: null)

  render: ->
    if @state.editing
      editor = React.createElement(ActionCancelModalComponent, { 
          title: @props.editorTitle
          onAction: @handleEditorSave
          onCancel: @handleEditorCancel
          },
            React.createElement(ScalarExprEditorComponent, schema: @props.schema, startTable: @props.baseTableId)
        )

    H.div null, 
      editor
      H.input 
        type: "text", 
        className: "form-control input-sm",
        readOnly: true, 
        style: { backgroundColor: "white", cursor: "pointer" }
        value: if @props.value then @props.expressionBuilder.summarizeExpr(@props.value) 
        placeholder: "Click to select..."
        onClick: @handleEditorOpen


ScalarExprEditorComponent = React.createClass {
  render: ->
    H.div null, "TODO"
}
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
