React = require 'react'
H = React.DOM
R = React.createElement
_ = require 'lodash'

uuid = require 'node-uuid'

ContentEditableComponent = require('mwater-expressions-ui').ContentEditableComponent
ExprInsertModalComponent = require './ExprInsertModalComponent'
ExprUpdateModalComponent = require './ExprUpdateModalComponent'

ItemsHtmlConverter = require './ItemsHtmlConverter'

module.exports = class TextWidgetDesignerComponent extends React.Component
  @propTypes: 
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func # Called with new design. null/undefined for readonly
    onStopEditing: React.PropTypes.func
    
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # Data source to use for chart

  focus: ->
    @refs.contentEditable.focus()

  createHtml: ->
    new ItemsHtmlConverter(@props.schema, true).itemsToHtml(@props.design.items)

  handleChange: (elem) =>
    design = _.extend({}, @props.design, items: new ItemsHtmlConverter(@props.schema, true).elemToItems(elem))
    if not _.isEqual(design, @props.design)
      @props.onDesignChange(design)
    else
      # Re-render as HTML may have been mangled and needs a round-trip
      @forceUpdate()

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

  replaceItem: (item) ->
    replaceItemInItems = (items, item) ->
      return _.map(items, (i) ->
        if i.id == item.id
          return item
        else if i.items
          return _.extend({}, i, items: replaceItemInItems(i.items, item))
        else
          return i
        )

    items = replaceItemInItems(@props.design.items or [], item)
    @props.onDesignChange(_.extend({}, @props.design, items: items))

  handleClick: (ev) =>
    if ev.target.dataset?.embed
      item = JSON.parse(ev.target.dataset?.embed)
      @refs.exprUpdateModal.open(item.expr, (expr) =>
        item.expr = expr

        # Replace in items
        @replaceItem(item)
      )

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
        @refs.exprInsertModal.open()
      , H.span(null, "f", H.sub(null, "x"))
      # H.div className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "undo"),
      #   H.i className: "fa fa-undo"
      # H.div className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "redo"),
      #   H.i className: "fa fa-repeat"
      if @props.onStopEditing
        H.div className: "mwater-visualization-text-palette-item", onClick: @props.onStopEditing,
          "Close"

  renderModals: ->
    [
      R ExprInsertModalComponent, key: "exprInsertModal", ref: "exprInsertModal", schema: @props.schema, dataSource: @props.dataSource, onInsert: @handleInsertExpr
      R ExprUpdateModalComponent, key: "exprUpdateModal", ref: "exprUpdateModal", schema: @props.schema, dataSource: @props.dataSource
    ]
  
  render: ->
    H.div style: { position: "relative" },
      @renderModals()
      H.div className: "mwater-visualization-text-widget-style-#{@props.design.style or "default"}", 
        R ContentEditableComponent, 
          ref: "contentEditable"
          style: { outline: "none" }
          html: @createHtml()
          onChange: @handleChange
          onClick: @handleClick
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

