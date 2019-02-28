PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
_ = require 'lodash'

ContentEditableComponent = require('mwater-expressions-ui').ContentEditableComponent
ItemsHtmlConverter = require './ItemsHtmlConverter'
FloatAffixed = require 'react-float-affixed'
FontColorPaletteItem = require './FontColorPaletteItem'
FontSizePaletteItem = require './FontSizePaletteItem'

module.exports = class RichTextComponent extends React.Component
  @propTypes: 
    # Items (content) to display. See ItemsHtmlConverter
    items: PropTypes.array
    onItemsChange: PropTypes.func # Called with new items

    onItemClick: PropTypes.func

    className: PropTypes.string  # Optional className of editor wrapper
    style: PropTypes.object  # Optional style of editor wrapper

    # Converter to use for editing
    itemsHtmlConverter: PropTypes.object

    # True (default) to include heading h1, h2 in palette
    includeHeadings: PropTypes.bool

    # Extra buttons to put in palette
    extraPaletteButtons: PropTypes.node

  @defaultProps:
    includeHeadings: true
    items: []
    itemsHtmlConverter: new ItemsHtmlConverter()

  constructor: (props) ->
    super(props)

    @state = {
      focused: false
    }

  handleClick: (ev) =>
    # If click is in component or in palette component, ignore, otherwise remove focus
    if not @entireComponent.contains(ev.target) and (not @paletteComponent or not @paletteComponent.contains(ev.target))
      @setState(focused: false)

  # Paste HTML in
  pasteHTML: (html) ->
    @contentEditable.pasteHTML(html)

  focus: ->
    @contentEditable.focus()

  handleInsertExpr: (item) =>
    html = '''<div data-embed="''' + _.escape(JSON.stringify(item)) + '''"></div>'''

    @contentEditable.pasteHTML(html)

  handleSetFontSize: (size) =>
    # Requires a selection
    html = @contentEditable.getSelectedHTML()
    if not html
      return alert("Please select text first to set size")

    # Clear existing font-size styles. This is clearly a hack, but font sizes are absolute in execCommand which
    # doesn't mix with our various dashboard stylings, so we need to use percentages
    html = html.replace(/font-size:\s*\d+%;?/g, "")

    @contentEditable.pasteHTML("<span style=\"font-size:#{size}\">" + html + "</span>")

  handleSetFontColor: (color) =>
    # Requires a selection
    html = @contentEditable.getSelectedHTML()
    if not html
      return alert("Please select text first to set color")

    @handleCommand("foreColor", color)

  handleChange: (elem) =>
    items =  @props.itemsHtmlConverter.convertElemToItems(elem)

    # Check if changed
    if not _.isEqual(items, @props.items)
      @props.onItemsChange(items)
    else
      # Re-render as HTML may have been mangled and needs a round-trip
      @forceUpdate()

  handleFocus: => @setState(focused: true)
  handleBlur: => @setState(focused: false)  

  # Perform a command such as bold, underline, etc.
  handleCommand: (command, param, ev) =>
    # Don't lose focus
    ev?.preventDefault()

    # Use CSS for some commands 
    if command in ['foreColor']
      document.execCommand("styleWithCSS", null, true)
      document.execCommand(command, false, param)
      document.execCommand("styleWithCSS", null, false)
    else
      document.execCommand(command, false, param)

  handleCreateLink: (ev) =>
    # Don't lose focus
    ev.preventDefault()

    # Ask for url
    url = window.prompt("Enter URL to link to")
    if url
      document.execCommand("createLink", false, url)

  handleEditorClick: (ev) =>
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
    return R FloatAffixed, style: {zIndex: 9999}, edges: "over,under,left,right", align: "center", render: @renderPaletteContent

  renderPaletteContent: (schemeName, {edges}) =>
    return R 'div', key: "palette", className: "mwater-visualization-text-palette", ref: ((c) => @paletteComponent = c),
        R 'div', key: "bold", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "bold", null),
          R 'b', null, "B"
        R 'div', key: "italic", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "italic", null),
          R 'i', null, "I"
        R 'div', key: "underline", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "underline", null),
          R 'span', style: { textDecoration: "underline" }, "U"
        R FontColorPaletteItem, key: "foreColor", onSetColor: @handleSetFontColor, position: if schemeName == "over" then "under" else "over"
        R FontSizePaletteItem, key: "fontSize", onSetSize: @handleSetFontSize, position: if schemeName == "over" then "under" else "over"
        R 'div', key: "link", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCreateLink,
          R 'i', className: "fa fa-link"
        R 'div', key: "justifyLeft", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "justifyLeft", null),
          R 'i', className: "fa fa-align-left"
        R 'div', key: "justifyCenter", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "justifyCenter", null),
          R 'i', className: "fa fa-align-center"
        R 'div', key: "justifyRight", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "justifyRight", null),
          R 'i', className: "fa fa-align-right"
        R 'div', key: "justifyFull", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "justifyFull", null),
          R 'i', className: "fa fa-align-justify"
        R 'div', key: "insertUnorderedList", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "insertUnorderedList", null),
          R 'i', className: "fa fa-list-ul"
        R 'div', key: "insertOrderedList", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "insertOrderedList", null),
          R 'i', className: "fa fa-list-ol"
        if @props.includeHeadings
          [
            R 'div', key: "h1", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "formatBlock", "<H1>"),
              R 'i', className: "fa fa-header"
            R 'div', key: "h2", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "formatBlock", "<H2>"),
              R 'i', className: "fa fa-header", style: { fontSize: "80%" }
            R 'div', key: "p", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "formatBlock", "<div>"),
              "\u00b6"
          ]
        R 'div', key: "removeFormat", className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "removeFormat", null), style: { paddingLeft: 5, paddingRight: 5 },
          R 'img', src: removeFormatIcon, style: { height: 20 }
        @props.extraPaletteButtons

  refContentEditable = (c) => @contentEditable = c
    
  renderHtml: ->
    if @props.onItemsChange?
      return R 'div', key: "contents", style: @props.style, className: @props.className,
        R ContentEditableComponent, 
          ref: @refContentEditable
          style: { outline: "none" }
          html: @createHtml()
          onChange: @handleChange
          onClick: @handleEditorClick
          onFocus: @handleFocus
          onBlur: @handleBlur
        if not @props.items?[0]?
          R 'div', key: "placeholder", style: { color: "#DDD", position: "absolute", top: 0, left: 0, right: 0, pointerEvents: "none" }, "Click to Edit"

    else
      return R 'div', key: "contents", style: @props.style, className: @props.className, dangerouslySetInnerHTML: { __html: @createHtml() }

  render: ->
    R 'div', style: { position: "relative" }, ref: ((c) => @entireComponent = c),
      @renderHtml()
      if @state.focused
        @renderPalette()


removeFormatIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAr0lEQVQ4y91U2w3CMAy8VB0kbFA2YYVuABOZbsAmGaFscnzgSlGSBgfCB1g6OXbkkx+yHUn0lgFfkN8hHSt/lma71kxdhIv6Dom/HGicflB97NVTD2ACsPQc1En1zUpqKb+pdEumzaVbSNPSRRFL7iNZQ1BstvApsmODZJXUa8A58W9Ea4nwFWkNa0Sc/Q+F1dyDRD30AO6qJV/wtgxNPR3fOEJXALO+5092/0+P9APt7i9xOIlepwAAAABJRU5ErkJggg=="