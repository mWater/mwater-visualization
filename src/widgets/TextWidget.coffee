React = require 'react'
H = React.DOM
R = React.createElement
_ = require 'lodash'

Widget = require './Widget'
SimpleWidgetComponent = require './SimpleWidgetComponent'
ContentEditableComponent = require('mwater-expressions-ui').ContentEditableComponent

module.exports = class MarkdownWidget extends Widget
  # Creates a React element that is a view of the widget 
  # options:
  #  schema: schema to use
  #  dataSource: data source to use
  #  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
  #  design: widget design
  #  onRemove: called when widget is removed
  #  onDuplicate: called when widget is duplicated
  #  scope: scope of the widget (when the widget self-selects a particular scope)
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  #  onScopeChange: called with scope of widget
  #  onDesignChange: called with new design. null/undefined for readonly
  #
  # Element will have the following props injected:
  #  width: width in pixels on screen
  #  height: height in pixels on screen
  #  standardWidth: standard width of the widget in pixels. If greater than width, widget should scale up, if less, should scale down.
  #  connectMoveHandle:  Connects move handle for dragging (see WidgetContainerComponent)
  #  connectResizeHandle: Connects resize handle for dragging (see WidgetContainerComponent)
  createViewElement: (options) ->
    return R TextWidgetComponent,
      design: options.design
      onDesignChange: options.onDesignChange
      onRemove: options.onRemove # TODO Remove, ironically

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

  renderEditor: ->
    R TextWidgetDesignerComponent,
      design: @props.design
      onDesignChange: @props.onDesignChange

  renderView: (scale) ->
    R TextWidgetViewComponent, 
      design: @props.design

  render: ->
    dropdownItems = []
    if @props.onDesignChange?
      dropdownItems.push({ label: "Edit", icon: "pencil", onClick: @handleStartEditing })
    if @props.onRemove? # TODO remove
      dropdownItems.push({ label: [H.span(className: "glyphicon glyphicon-remove"), " Remove"], onClick: @props.onRemove })

    # Wrap in a simple widget
    return H.div onClick: @handleStartEditing, 
      if @state.editing
        @renderEditor()
      else
        @renderView()


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

        # Special case for self-closing tags
        if item.tag in ['br']
          html += "<#{item.tag}>"
        else
          html += "<#{item.tag}>" + @designToHtml(item) + "</#{item.tag}>"

    # If empty, put placeholder
    if html.length == 0
      html = '&#x2060;'

    console.log "createHtml: #{html}"
    return html

  elemToDesign: (elem) ->
    # Walk DOM tree, adding strings and expressions
    items = []

    for node in elem.childNodes
      console.log node.nodeType

      if node.nodeType == 1 # Element
        item = { type: "element", tag: node.tagName.toLowerCase(), items: @elemToDesign(node) }
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
   
    return items


class TextWidgetViewComponent extends React.Component
  createHtml: ->
    new TextDesignHtmlConverter().designToHtml(@props.design)

  render: ->
    H.div dangerouslySetInnerHTML: { __html: @createHtml() }

class TextWidgetDesignerComponent extends React.Component
  createHtml: ->
    new TextDesignHtmlConverter().designToHtml(@props.design)

  handleChange: (elem) =>
    @props.onDesignChange(items: new TextDesignHtmlConverter().elemToDesign(elem))

  handleCommand: (command) =>
    document.execCommand(command)
    @refs.contentEditable.focus()

  renderMenu: ->
    H.div className: "mwater-visualization-text-palette",
      H.button type: "button", className: "btn btn-xs", onClick: @handleCommand.bind(null, "bold"),
        H.b null, "B"
      H.button type: "button", className: "btn btn-xs", onClick: @handleCommand.bind(null, "italic"),
        H.i null, "I"
      H.button type: "button", className: "btn btn-xs", onClick: @handleCommand.bind(null, "underline"),
        H.span style: { textDecoration: "underline" }, "U"
  
  render: ->
    H.div style: { position: "relative" },
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
