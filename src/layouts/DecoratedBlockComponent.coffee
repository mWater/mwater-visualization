React = require 'react'
H = React.DOM
R = React.createElement

# Block decorated with drag/remove hover controls
module.exports = class DecoratedBlockComponent extends React.Component
  @propTypes:
    style: React.PropTypes.object   # Style to add to outer div
    onBlockRemove: React.PropTypes.func.isRequired # Called when block is removed

    connectMoveHandle: React.PropTypes.func   # the move handle connector
    connectDragPreview: React.PropTypes.func   # the drag preview connector
    connectResizeHandle: React.PropTypes.func # Connects resize handle for dragging. Null to not render

    # Set to allow changing aspect ratio
    aspectRatio: React.PropTypes.number
    onAspectRatioChange: React.PropTypes.func

  constructor: ->
    super

    @state = {
      aspectDragY: null   # y position of aspect ratio drag
      initialAspectDragY: null   # Initial y position of aspect ratio drag
      initialClientY: null    # first y of mousemove (for calculating difference)
    }

  componentWillUnmount: ->
    # Remove listeners
    document.removeEventListener("mousemove", @handleMouseMove)
    document.removeEventListener("mouseup", @handleMouseUp)

  handleAspectMouseDown: (ev) =>
    # Get height of overall block
    @setState(aspectDragY: ev.currentTarget.parentElement.offsetHeight, initialAspectDragY: ev.currentTarget.parentElement.offsetHeight)

    document.addEventListener("mousemove", @handleMouseMove)
    document.addEventListener("mouseup", @handleMouseUp)

  handleMouseMove: (ev) =>
    if @state.initialClientY?
      aspectDragY = @state.initialAspectDragY + ev.clientY - @state.initialClientY
      if aspectDragY > 20
        @setState(aspectDragY: aspectDragY)
    else
      @setState(initialClientY: ev.clientY)

  handleMouseUp: (ev) =>
    # Remove listeners
    document.removeEventListener("mousemove", @handleMouseMove)
    document.removeEventListener("mouseup", @handleMouseUp)

    # Fire new aspect ratio
    @props.onAspectRatioChange(@props.aspectRatio / (@state.aspectDragY / @state.initialAspectDragY))
    @setState(aspectDragY: null, initialAspectDragY: null, initialClientY: null)

  renderAspectDrag: ->
    if @state.aspectDragY?
      lineStyle = { 
        position: "absolute"
        borderTop: "solid 3px #38D"
        top: @state.aspectDragY
        left: 0
        right: 0
      }
      return H.div style: lineStyle, key: "aspectDrag"
    else
      return null
  
  render: ->
    elem = H.div className: "mwater-visualization-block", style: @props.style,
      @props.children
    
      @renderAspectDrag()

      if not @props.isDragging and @props.connectMoveHandle?
        @props.connectMoveHandle(H.div key: "move", className: "mwater-visualization-block-move",
          H.i className: "fa fa-arrows")

      if not @props.isDragging and @props.onBlockRemove?
        H.div key: "remove", className: "mwater-visualization-block-remove", onClick: @props.onBlockRemove,
          H.i className: "fa fa-times"

      if not @props.isDragging and @props.onAspectRatioChange?
        # TODO sometimes drags (onDragStart) and so doesn't work. Disable dragging?
        H.div key: "aspect", className: "mwater-visualization-block-aspect", onMouseDown: @handleAspectMouseDown,
          H.i className: "fa fa-arrows-v"

      if not @props.isDragging and @props.connectResizeHandle?
        @props.connectResizeHandle(H.div key: "resize", className: "mwater-visualization-block-resize",
          H.i className: "fa fa-expand fa-rotate-90")

    if @props.connectDragPreview
      elem = @props.connectDragPreview(elem)

    return elem