H = React.DOM
DesignValidator = require './DesignValidator'
ActionCancelModalComponent = require './ActionCancelModalComponent'
ScalarExprEditorComponent = require './ScalarExprEditorComponent'

# Component which displays a scalar expression and allows editing/selecting it
# by clicking.
module.exports = class ScalarExprComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired
    # expressionBuilder: React.PropTypes.object.isRequired

    startTable: React.PropTypes.string # Optional start table to restrict selections to
    editorTitle: React.PropTypes.string # Title of editor popup
    
    value: React.PropTypes.object # Current value of expression
    onChange: React.PropTypes.func.isRequired # Called when changes

  constructor: ->
    super
    # Editing is set to the currently being edited value
    @state = { editing: null }

  handleEditorOpen: => @setState(editing: @props.value or {})

  handleEditorCancel: => @setState(editing: null)

  handleEditorChange: (val) => @setState(editing: val)

  handleEditorSave: =>
    # TODO validate
    @props.onChange(@state.editing)
    @setState(editing: null)

  render: ->
    # Display editor modal if editing
    if @state.editing
      editor = React.createElement(ActionCancelModalComponent, { 
          title: @props.editorTitle
          onAction: @handleEditorSave
          onCancel: @handleEditorCancel
          },
            React.createElement(ScalarExprEditorComponent, 
              schema: @props.schema, 
              startTable: @props.startTable, 
              value: @state.editing
              onChange: @handleEditorChange)
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


