React = require 'react'
H = React.DOM
R = React.createElement
_ = require 'lodash'

ClickOutHandler = require('react-onclickout')
Widget = require './Widget'
SimpleWidgetComponent = require './SimpleWidgetComponent'
ContentEditableComponent = require('mwater-expressions-ui').ContentEditableComponent

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

  renderView: ->
    R TextWidgetViewComponent, 
      design: @props.design

  render: ->
    dropdownItems = []
    if @props.onDesignChange?
      dropdownItems.push({ label: "Edit", icon: "pencil", onClick: @handleStartEditing })

    # Wrap in a simple widget
    return H.div onClick: @handleStartEditing, style: { width: @props.width, height: @props.height },
      if @state.editing
        R ClickOutHandler, onClickOut: @handleStopEditing,
          @renderEditor()
      else
        @renderView()


class TextWidgetViewComponent extends React.Component
  createHtml: ->
    new TextDesignHtmlConverter().designToHtml(@props.design)

  render: ->
    if @props.design.items?[0]?
      H.div className: "mwater-visualization-text-widget-#{@props.design.style or "default"}", dangerouslySetInnerHTML: { __html: @createHtml() }
    else
      H.div className: "mwater-visualization-text-widget-#{@props.design.style or "default"} text-muted", 
        "Click to Edit"

class TextWidgetDesignerComponent extends React.Component
  @propTypes: 
    design: React.PropTypes.object.isRequired
    onDesignChange: React.PropTypes.func # Called with new design. null/undefined for readonly

  focus: ->
    @refs.contentEditable.focus()

  createHtml: ->
    new TextDesignHtmlConverter().designToHtml(@props.design)

  handleChange: (elem) =>
    @props.onDesignChange(_.extend({}, @props.design, items: new TextDesignHtmlConverter().elemToDesign(elem)))

  handleCommand: (command, ev) =>
    # Don't lose focus
    ev.preventDefault()
    document.execCommand(command)

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
      # H.div className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "undo"),
      #   H.i className: "fa fa-undo"
      # H.div className: "mwater-visualization-text-palette-item", onMouseDown: @handleCommand.bind(null, "redo"),
      #   H.i className: "fa fa-repeat"
  
  render: ->
    H.div style: { position: "relative" },
      H.div className: "mwater-visualization-text-widget-#{@props.design.style or "default"}", 
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

class TextDesignHtmlConverter 
  designToHtml: (design) ->
    html = ""

    for item in (design.items or [])
      if _.isString(item)
        # Escape HTML
        html += _.escape(item)
      else if item.type == "element"
        if not item.tag.match(/^[a-z]+$/) or item.tag == "script"
          throw new Error("Invalid tag #{item.tag}")

        attrs = ""
        # Add style
        if item.style
          attrs += " style=\""
          first = true
          for key, value of item.style
            if not first
              attrs += " "
            attrs += _.escape(key) + ": " + _.escape(value) + ";"
            first = false

          attrs += "\""

        # Special case for self-closing tags
        if item.tag in ['br']
          html += "<#{item.tag}#{attrs}>"
        else
          html += "<#{item.tag}#{attrs}>" + @designToHtml(item) + "</#{item.tag}>"

    # If empty, put placeholder
    if html.length == 0
      html = '&#x2060;'

    console.log "createHtml: #{html}"
    return html

  elemToDesign: (elem) ->
    console.log elem.outerHTML
    
    # Walk DOM tree, adding strings and expressions
    items = []

    for node in elem.childNodes

      if node.nodeType == 1 # Element
        item = { type: "element", tag: node.tagName.toLowerCase(), items: @elemToDesign(node) }

        # Add style
        if node.style?
          for style in node.style
            item.style = item.style or {}
            item.style[style] = node.style[style]

        items.push(item)
        # # If expression, handle specially
        # if node.className and node.className.match(/inline-expr-block/)
        #   # Get expression decoded from comment which is first child
        #   commentNode = _.find(node.childNodes, (subnode) -> subnode.nodeType == 8)
        #   if commentNode
        #     text += "{" + index + "}" 
        #     exprs.push(JSON.parse(decodeURIComponent(commentNode.nodeValue)))
        #     index += 1
        #   return

        # # If div, add enter if not initial div
        # if not isFirst and not wasBr and node.tagName in ['div', 'DIV']
        #   text += "\n"

        # wasBr = false

      else if node.nodeType == 3
        text = node.nodeValue

        # Strip word joiner used to allow editing at end of string
        items.push(text.replace(/\u2060/g, ''))

    console.log JSON.stringify(items, null, 2)
   
    return items
