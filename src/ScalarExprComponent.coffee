H = React.DOM
DesignValidator = require './DesignValidator'
ActionCancelModalComponent = require './ActionCancelModalComponent'
ScalarExprEditorComponent = require './ScalarExprEditorComponent'
ExpressionBuilder = require './ExpressionBuilder'

# Component which displays a scalar expression and allows editing/selecting it
# by clicking.
module.exports = class ScalarExprComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired

    startTable: React.PropTypes.string # Optional start table to restrict selections to
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

  handleEditorChange: (val) => @setState(editorValue: val)

  handleEditorSave: =>
    # TODO validate
    @props.onChange(@state.editorValue)
    @setState(editorOpen: false, editorValue: null)

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
              schema: @props.schema, 
              startTable: @props.startTable, 
              value: @state.editorValue
              onChange: @handleEditorChange)
        )

    H.div null, 
      editor
      H.input 
        type: "text", 
        className: "form-control input-sm",
        readOnly: true, 
        style: { backgroundColor: "white", cursor: "pointer" }
        value: if @props.value then exprBuilder.summarizeExpr(@props.value)
        placeholder: "Click to select..."
        onClick: @handleEditorOpen


