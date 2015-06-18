React = require 'react'
H = React.DOM
ActionCancelModalComponent = require './ActionCancelModalComponent'
ScalarExprEditorComponent = require './ScalarExprEditorComponent'
ExpressionBuilder = require './ExpressionBuilder'
EditableLinkComponent = require './EditableLinkComponent'

# Component which displays a scalar expression and allows editing/selecting it
# by clicking.
module.exports = class ScalarExprComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired

    table: React.PropTypes.string # Optional table to restrict selections to (can still follow joins to other tables)
    types: React.PropTypes.array # Optional types to limit to
    editorTitle: React.PropTypes.string # Title of editor popup
    
    value: React.PropTypes.object # Current value of expression
    onChange: React.PropTypes.func.isRequired # Called when changes

  constructor: ->
    super
    # editorValue is set to the currently being edited value
    # editorOpen is true if editing
    @state = { editorValue: null, editorOpen: false }

  handleEditorOpen: => @setState(editorValue: @props.value, editorOpen: true)

  handleEditorCancel: => @setState(editorValue: null, editorOpen: false)

  handleEditorChange: (val) => 
    newVal = new ExpressionBuilder(@props.schema).cleanScalarExpr(val)
    @setState(editorValue: newVal)

  handleEditorSave: =>
    # TODO validate
    @props.onChange(@state.editorValue)
    @setState(editorOpen: false, editorValue: null)

  handleRemove: =>
    @props.onChange(null)

  render: ->
    exprBuilder = new ExpressionBuilder(@props.schema)

    # Display editor modal if editing
    if @state.editorOpen
      editor = React.createElement(ActionCancelModalComponent, { 
          title: @props.editorTitle
          onAction: @handleEditorSave
          onCancel: @handleEditorCancel
          },
            React.createElement(ScalarExprEditorComponent, 
              schema: @props.schema
              table: @props.table 
              types: @props.types
              value: @state.editorValue
              onChange: @handleEditorChange)
        )

    H.div style: { display: "inline-block" },
      editor
      React.createElement(EditableLinkComponent, 
        onClick: @handleEditorOpen
        onRemove: if @props.value then @handleRemove,
        if @props.value then exprBuilder.summarizeExpr(@props.value) else "Select..."
        )

