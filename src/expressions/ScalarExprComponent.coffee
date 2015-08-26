React = require 'react'
H = React.DOM
ActionCancelModalComponent = require './../ActionCancelModalComponent'
ScalarExprEditorComponent = require './ScalarExprEditorComponent'
ExpressionBuilder = require './ExpressionBuilder'
EditableLinkComponent = require './../EditableLinkComponent'

# Component which displays a scalar expression and allows editing/selecting it
# by clicking.
module.exports = class ScalarExprComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired

    table: React.PropTypes.string # Optional table to restrict selections to (can still follow joins to other tables)
    types: React.PropTypes.array # Optional types to limit to

    # Includes count at root level of a table. Means that an extra entry will be present
    # that is "Number of {table name}" that will have no aggregate and a count expression. 
    includeCount: React.PropTypes.bool

    editorTitle: React.PropTypes.any # Title of editor popup. Any element
    
    value: React.PropTypes.object # Current value of expression
    onChange: React.PropTypes.func.isRequired # Called when changes

    preventRemove: React.PropTypes.bool # True to prevent removal/clearing of value

    editorInitiallyOpen: React.PropTypes.bool # True to open editor as soon as created

  constructor: (props) ->
    super(props)

    # editorValue is set to the currently being edited value
    # editorOpen is true if editing
    if props.editorInitiallyOpen
      @state = { editorValue: props.value, editorOpen: true }
    else
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

  handleDropdownItemClicked: (expr) =>
    # Convert to scalar if not
    if expr and expr.type == "field"
      expr = { type: "scalar", expr: expr, table: expr.table, joins: [] }
      
    # Handle advanced
    if not expr
      @handleEditorOpen()
    else
      @props.onChange(expr)

  renderEditableLink: ->
    exprBuilder = new ExpressionBuilder(@props.schema)

    if @props.value
      summary = exprBuilder.summarizeExpr(@props.value)

    # Get named expressions
    namedExprs = @props.schema.getNamedExprs(@props.table)

    # Filter by type
    if @props.types
      namedExprs = _.filter(namedExprs, (ne) => exprBuilder.getExprType(ne.expr) in @props.types)

    # Simple click if no named expressions
    linkProps = {
      onRemove: if @props.value and not @props.preventRemove then @handleRemove
    }

    if namedExprs.length == 0
      linkProps.onClick = @handleEditorOpen
    else
      linkProps.dropdownItems = _.map(namedExprs, (ne) => { id: ne.expr, name: ne.name })

      # Add advanced
      linkProps.dropdownItems.push({ id: null, name: null }) # Divider has null name
      linkProps.dropdownItems.push({ id: null, name: "Advanced..." })
      linkProps.onDropdownItemClicked = @handleDropdownItemClicked

    return React.createElement(EditableLinkComponent, linkProps, 
        if summary then summary else H.i(null, "None")
      )

  render: ->
    # Display editor modal if editing
    if @state.editorOpen
      editor = React.createElement(ActionCancelModalComponent, { 
          title: @props.editorTitle
          onAction: @handleEditorSave
          onCancel: @handleEditorCancel
          },
            React.createElement(ScalarExprEditorComponent, 
              schema: @props.schema
              dataSource: @props.dataSource
              table: @props.table 
              types: @props.types
              includeCount: @props.includeCount
              value: @state.editorValue
              onChange: @handleEditorChange)
        )

    H.div style: { display: "inline-block" },
      editor
      @renderEditableLink()

