React = require 'react'
H = React.DOM
R = React.createElement
_ = require 'lodash'

uuid = require 'node-uuid'

ClickOutHandler = require('react-onclickout')
Widget = require '../Widget'
ContentEditableComponent = require('mwater-expressions-ui').ContentEditableComponent

ExprInsertModalComponent = require './ExprInsertModalComponent'
ItemsHtmlConverter = require './ItemsHtmlConverter'

module.exports = class TextWidget extends Widget
  # Creates a React element that is a view of the widget 
  # options:
  #  schema: schema to use
  #  dataSource: data source to use
  #  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
  #  design: widget design
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  #  onScopeChange: called with scope of widget
  #  onDesignChange: called with new design. null/undefined for readonly
  #  width: width in pixels on screen
  #  height: height in pixels on screen
  #  standardWidth: standard width of the widget in pixels. If greater than width, widget should scale up, if less, should scale down.
  createViewElement: (options) ->
    return R TextWidgetComponent,
      schema: options.schema
      dataSource: options.dataSource
      widgetDataSource: options.widgetDataSource
      design: options.design
      onDesignChange: options.onDesignChange
      width: options.width
      height: options.height
      standardWidth: options.standardWidth

  # Determine if widget is auto-height, which means that a vertical height is not required.
  isAutoHeight: -> true

class TextWidgetComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func # Called with new design. null/undefined for readonly

    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use for chart
    widgetDataSource: React.PropTypes.object.isRequired

    width: React.PropTypes.number
    height: React.PropTypes.number
    standardWidth: React.PropTypes.number

  constructor: (props) ->
    super
    @state = { 
      # True when editing
      editing: false
    }  

  handleStartEditing: =>
    if @props.onDesignChange? and not @state.editing
      @setState(editing: true)

  handleStopEditing: => 
    @setState(editing: false)

  refEditor: (elem) ->
    if elem
      elem.focus()

  renderEditor: ->
    R TextWidgetDesignerComponent,
      ref: @refEditor
      design: @props.design
      onDesignChange: @props.onDesignChange
      schema: @props.schema
      dataSource: @props.dataSource
      onStopEditing: @handleStopEditing

  renderView: ->
    R TextWidgetViewComponent, 
      design: @props.design
      schema: @props.schema
      dataSource: @props.dataSource
      # TODO schema, etc.

  render: ->
    dropdownItems = []
    if @props.onDesignChange?
      dropdownItems.push({ label: "Edit", icon: "pencil", onClick: @handleStartEditing })

    # Wrap in a simple widget
    return H.div onClick: @handleStartEditing, style: { width: @props.width, height: @props.height },
      if @state.editing
        # R ClickOutHandler, onClickOut: @handleStopEditing,
        @renderEditor()
      else
        @renderView()


class TextWidgetViewComponent extends React.Component
  createHtml: ->
    new ItemsHtmlConverter(@props.schema).itemsToHtml(@props.design.items)

  render: ->
    if @props.design.items?[0]?
      H.div className: "mwater-visualization-text-widget-style-#{@props.design.style or "default"}", dangerouslySetInnerHTML: { __html: @createHtml() }
    else
      H.div className: "mwater-visualization-text-widget-style-#{@props.design.style or "default"} text-muted", 
        "Click to Edit"

class TextWidgetDesignerComponent extends React.Component
  @propTypes: 
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func # Called with new design. null/undefined for readonly
    onStopEditing: React.PropTypes.func
    
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use for chart

  focus: ->
    @refs.contentEditable.focus()

  createHtml: ->
    new ItemsHtmlConverter(@props.schema).itemsToHtml(@props.design.items)

  handleChange: (elem) =>
    @props.onDesignChange(_.extend({}, @props.design, items: new ItemsHtmlConverter(@props.schema).elemToItems(elem)))

  handleCommand: (command, ev) =>
    # Don't lose focus
    ev.preventDefault()
    document.execCommand(command)

  handleInsertExpr: (expr) =>
    @handleInsertEmbed({ type: "expr", id: uuid.v4(), expr: expr })

  # Put in an embedded item
  handleInsertEmbed: (item) =>
    @refs.contentEditable.pasteHTML('''
      <div data-embed="''' + _.escape(JSON.stringify(item)) + '''"></div>
    ''')

  renderMenu: ->
    H.div className: "mwater-visualization-text-palette",
      H.div className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "bold"),
        H.b null, "B"
      H.div className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "italic"),
        H.i null, "I"
      H.div className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "underline"),
        H.span style: { textDecoration: "underline" }, "U"
      H.div className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "justifyLeft"),
        H.i className: "fa fa-align-left"
      H.div className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "justifyCenter"),
        H.i className: "fa fa-align-center"
      H.div className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "justifyRight"),
        H.i className: "fa fa-align-right"
      H.div className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "justifyFull"),
        H.i className: "fa fa-align-justify"
      H.div className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "insertUnorderedList"),
        H.i className: "fa fa-list-ul"
      H.div className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "insertOrderedList"),
        H.i className: "fa fa-list-ol"
      H.div className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "insertOrderedList"),
        H.i className: "fa fa-list-ol"
      H.div className: "mwater-visualization-text-palette-item", onClick: (ev) =>
        @refs.exprModal.open()
      , "fx"
      # H.div className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "undo"),
      #   H.i className: "fa fa-undo"
      # H.div className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "redo"),
      #   H.i className: "fa fa-repeat"
      if @props.onStopEditing
        H.div className: "mwater-visualization-text-palette-item", onClick: @props.onStopEditing,
          "Close"

  renderExprInsertModal: ->
    R ExprInsertModalComponent, key: "exprModal", ref: "exprModal", schema: @props.schema, dataSource: @props.dataSource, onInsert: @handleInsertExpr
  
  render: ->
    H.div style: { position: "relative" },
      @renderExprInsertModal()
      H.div className: "mwater-visualization-text-widget-style-#{@props.design.style or "default"}", 
        R ContentEditableComponent, 
          ref: "contentEditable"
          style: { outline: "none" }
          html: @createHtml()
          onChange: @handleChange
      @renderMenu()


# getHTMLOfSelection = ->
#   if document.selection && document.selection.createRange
#     range = document.selection.createRange()
#     return range.htmlText
#   else if window.getSelection
#     selection = window.getSelection()
#     if selection.rangeCount > 0
#       range = selection.getRangeAt(0)
#       clonedSelection = range.cloneContents()
#       div = document.createElement('div')
#       div.appendChild(clonedSelection)
#       return div.innerHTML
#     else 
#       return ''
#   else 
#     return ''

