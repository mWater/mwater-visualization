React = require 'react'
H = React.DOM

# Simple widget that can be selected, dragged and resized
# Injects inner width and height to child element
module.exports = class SimpleWidgetComponent extends React.Component
  @propTypes:
    width: React.PropTypes.number.isRequired
    height: React.PropTypes.number.isRequired

    selected: React.PropTypes.bool # true if selected
    onSelect: React.PropTypes.func # called when selected
    onRemove: React.PropTypes.func # called when widget is removed
    
    connectMoveHandle: React.PropTypes.func # Connects move handle for dragging (see WidgetContainerComponent)
    connectResizeHandle: React.PropTypes.func # Connects resize handle for dragging (see WidgetContainerComponent)

  handleClick: (ev) =>
    ev.stopPropagation()
    @props.onSelect()

  handleRemove: (ev) =>
    ev.stopPropagation()
    @props.onRemove()

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

  renderRemoveButton: ->
    removeButtonStyle = {
      position: "absolute"
      right: 5
      top: 5
      cursor: "pointer"
    }

    if @props.onRemove
      H.div style: removeButtonStyle, className: "mwater-visualization-simple-widget-remove-button", onClick: @handleRemove,
        H.span className: "glyphicon glyphicon-remove"

  render: ->
    style = { 
      width: @props.width
      height: @props.height 
      padding: 10
    }
    
    if @props.selected
      style.border = "dashed 2px #AAA"

    contents = H.div style: { position: "absolute", left: 10, top: 10, right: 10, bottom: 10 }, 
      React.cloneElement(React.Children.only(@props.children), 
        width: @props.width - 20, height: @props.height - 20)

    elem = H.div className: "mwater-visualization-simple-widget", style: style, onClick: @handleClick,
      contents
      @renderResizeHandle()
      @renderRemoveButton()

    if @props.connectMoveHandle
      elem = @props.connectMoveHandle(elem)

    return elem
