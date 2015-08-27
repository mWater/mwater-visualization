React = require 'react'
H = React.DOM
FloatingWindowComponent = require '../FloatingWindowComponent'

# Simple widget that can be dragged and resized
# Injects inner width and height to child element
# Contains a dropdown menu and a popout editor that is also draggable
# To display the editor, call displayEditor
module.exports = class SimpleWidgetComponent extends React.Component
  @propTypes:
    width: React.PropTypes.number
    height: React.PropTypes.number

    highlighted: React.PropTypes.bool # true if highlighted
    
    connectMoveHandle: React.PropTypes.func # Connects move handle for dragging (see WidgetContainerComponent)
    connectResizeHandle: React.PropTypes.func # Connects resize handle for dragging (see WidgetContainerComponent)

    editor: React.PropTypes.node # Editor in a floating window. Will only display when displayEditor is called

    dropdownItems: React.PropTypes.arrayOf(React.PropTypes.shape({
      label: React.PropTypes.node.isRequired
      icon: React.PropTypes.string # Glyphicon string. e.g. "remove"
      onClick: React.PropTypes.func.isRequired
      })).isRequired # A list of {label, icon, onClick} actions for the dropdown

    editorInitiallyDisplayed: React.PropTypes.bool  # True to open editor on load

  constructor: ->
    super
    # editorInitialBounds is not null if editing
    @state = { editorInitialBounds: null }

  componentDidMount: ->
    if @props.editorInitiallyDisplayed
      @displayEditor()

  displayEditor: ->
    # Determine initial bounds 
    myElem = React.findDOMNode(this)

    # Get x and y of right of widget
    width = 500
    height = 600
    editorInitialBounds = { x: myElem.offsetLeft + myElem.offsetWidth - 5, y: myElem.offsetTop + 5, width: width, height: height }

    # Get space to right of widget
    spaceRight = document.body.clientWidth - myElem.getBoundingClientRect().right

    # Move back from edge
    if spaceRight < width
      editorInitialBounds.x -= width - spaceRight

    @setState(editorInitialBounds: editorInitialBounds)

  handleCloseEditor: => 
    @setState(editorInitialBounds: null)

  handleRemove: (ev) =>
    ev.stopPropagation()
    @props.onRemove()

  renderEditor: ->
    if not @state.editorInitialBounds?
      return

    return React.createElement(FloatingWindowComponent,
      initialBounds: @state.editorInitialBounds
      title: "Designer"
      onClose: @handleCloseEditor,
        @props.editor
    )

  renderResizeHandle: ->
    resizeHandleStyle = {
      position: "absolute"
      right: 0
      bottom: 0
      backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAB3RJTUUH2AkPCjIF90dj7QAAAAlwSFlzAAAPYQAAD2EBqD+naQAAAARnQU1BAACxjwv8YQUAAABISURBVHjaY2QgABwcHMSBlAETEYpagPgIIxGKCg4cOPCVkZAiIObBajUWRZhW41CEajUuRShWE1AEsZoIRWCrQSbawDh42AwAdwQtJBOblO0AAAAASUVORK5CYII=')"
      backgroundRepeat: "no-repeat"
      backgroundPosition: "right bottom"
      width: 30
      height: 30
      cursor: "nwse-resize"
    }

    if @props.connectResizeHandle
      return @props.connectResizeHandle(
        H.div style: resizeHandleStyle, className: "mwater-visualization-simple-widget-resize-handle"
        )

  renderDropdownItem: (item, i) =>
    return H.li key: "#{i}",
      H.a onClick: item.onClick, 
        if item.icon then H.span(className: "glyphicon glyphicon-#{item.icon} text-muted")
        if item.icon then " "
        item.label

  renderDropdown: ->
    dropdownStyle = {
      position: "absolute"
      right: 5
      top: 5
      cursor: "pointer"
    }

    elem = H.div style: dropdownStyle, "data-toggle": "dropdown",
      H.div className: "mwater-visualization-simple-widget-gear-button",
        H.span className: "glyphicon glyphicon-cog"

    return H.div style: dropdownStyle,
      elem
      H.ul className: "dropdown-menu dropdown-menu-right", style: { top: 25 },
        _.map(@props.dropdownItems, @renderDropdownItem)        

  closeMenu: =>
    $(React.findDOMNode(this)).find('[data-toggle="dropdown"]').parent().removeClass('open')

  render: ->
    style = { 
      width: @props.width
      height: @props.height 
      padding: 10
    }
    
    if @props.highlighted
      style.border = "dashed 2px #337ab7"

    contents = H.div style: { position: "absolute", left: 10, top: 10, right: 10, bottom: 10 }, 
      React.cloneElement(React.Children.only(@props.children), 
        width: @props.width - 20, height: @props.height - 20)

    if @props.connectMoveHandle
      contents = @props.connectMoveHandle(contents)

    elem = H.div className: "mwater-visualization-simple-widget", style: style, onClick: @handleClick, onMouseLeave: @closeMenu,
      contents
      @renderResizeHandle()
      @renderDropdown()
      @renderEditor()

    return elem
