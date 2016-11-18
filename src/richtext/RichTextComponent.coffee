React = require 'react'
H = React.DOM
R = React.createElement
_ = require 'lodash'

ContentEditableComponent = require('mwater-expressions-ui').ContentEditableComponent
ClickOutHandler = require('react-onclickout')
ItemsHtmlConverter = require './ItemsHtmlConverter'

module.exports = class RichTextComponent extends React.Component
  @propTypes: 
    # Items (content) to display. See ItemsHtmlConverter
    items: React.PropTypes.array
    onItemsChange: React.PropTypes.func # Called with new items

    onItemClick: React.PropTypes.func

    className: React.PropTypes.string  # Optional className of editor wrapper
    style: React.PropTypes.object  # Optional style of editor wrapper

    # Converter to use for editing
    itemsHtmlConverter: React.PropTypes.object

    # True (default) to include heading h1, h2 in palette
    includeHeadings: React.PropTypes.bool

    # Extra buttons to put in palette
    extraPaletteButtons: React.PropTypes.node

  @defaultProps:
    includeHeadings: true
    items: []
    itemsHtmlConverter: new ItemsHtmlConverter()

  constructor: (props) ->
    super(props)

    @state = {
      focused: false
    }

  # Paste HTML in
  pasteHTML: (html) ->
    @refs.contentEditable.pasteHTML(html)

  focus: ->
    @refs.contentEditable.focus()

  handleInsertExpr: (item) =>
    html = '''<div data-embed="''' + _.escape(JSON.stringify(item)) + '''"></div>'''

    @refs.contentEditable.pasteHTML(html)

  handleChange: (elem) =>
    items =  @props.itemsHtmlConverter.convertElemToItems(elem)

    # Check if changed
    if not _.isEqual(items, @props.items)
      @props.onItemsChange(items)
    else
      # Re-render as HTML may have been mangled and needs a round-trip
      @forceUpdate()

  handleFocus: => @setState(focused: true)
  # handleClickOut: => @setState(focused: false)
  handleBlur: => @setState(focused: false)

  # Perform a command such as bold, underline, etc.
  handleCommand: (command, param, ev) =>
    # Shift args
    if param.preventDefault
      ev = param
      param = null

    # Don't lose focus
    ev.preventDefault()
    document.execCommand(command, false, param)

  handleCreateLink: (ev) =>
    # Don't lose focus
    ev.preventDefault()

    # Ask for url
    url = window.prompt("Enter URL to link to")
    if url
      document.execCommand("createLink", false, url)

  handleClick: (ev) =>
    # Be sure focused
    if not @state.focused
      @setState(focused: true)

    if ev.target.dataset?.embed or ev.target.parentElement?.dataset?.embed
      item = JSON.parse(ev.target.dataset?.embed or ev.target.parentElement?.dataset?.embed)
      if item?
        @props.onItemClick?(item)

  createHtml: ->
    @props.itemsHtmlConverter.convertItemsToHtml(@props.items)

  renderPalette: ->
    H.div key: "palette", className: "mwater-visualization-text-palette",
      H.div key: "bold", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "bold"),
        H.b null, "B"
      H.div key: "italic", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "italic"),
        H.i null, "I"
      H.div key: "underline", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "underline"),
        H.span style: { textDecoration: "underline" }, "U"
      H.div key: "link", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCreateLink,
        H.i className: "fa fa-link"
      H.div key: "justifyLeft", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "justifyLeft"),
        H.i className: "fa fa-align-left"
      H.div key: "justifyCenter", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "justifyCenter"),
        H.i className: "fa fa-align-center"
      H.div key: "justifyRight", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "justifyRight"),
        H.i className: "fa fa-align-right"
      H.div key: "justifyFull", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "justifyFull"),
        H.i className: "fa fa-align-justify"
      H.div key: "insertUnorderedList", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "insertUnorderedList"),
        H.i className: "fa fa-list-ul"
      H.div key: "insertOrderedList", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "insertOrderedList"),
        H.i className: "fa fa-list-ol"
      if @props.includeHeadings
        [
          H.div key: "h1", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "formatBlock", "<H1>"),
            H.i className: "fa fa-header"
          H.div key: "h2", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "formatBlock", "<H2>"),
            H.i className: "fa fa-header", style: { fontSize: "80%" }
          H.div key: "p", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "formatBlock", "<div>"),
            "\u00b6"
        ]
      @props.extraPaletteButtons
    
  renderHtml: ->
    if @props.onItemsChange?
      return H.div key: "contents", style: @props.style, className: @props.className,
        R ContentEditableComponent, 
          ref: "contentEditable"
          style: { outline: "none" }
          html: @createHtml()
          onChange: @handleChange
          onClick: @handleClick
          onFocus: @handleFocus
          onBlur: @handleBlur
        if not @props.items?[0]?
          H.div key: "placeholder", style: { color: "#DDD", position: "absolute", top: 0, left: 0, right: 0, pointerEvents: "none" }, "Click to Edit"

    else
      return H.div key: "contents", style: @props.style, className: @props.className, dangerouslySetInnerHTML: { __html: @createHtml() }

  render: ->
    # R ClickOutHandler, onClickOut: @handleClickOut,
    H.div style: { position: "relative" },
      @renderHtml()
      if @state.focused
        @renderPalette()
