React = require 'react'
H = React.DOM
R = React.createElement

# Block decorated with drag/remove hover controls
module.exports = class DecoratedBlockComponent extends React.Component
  @propTypes:
    onBlockRemove: React.PropTypes.func.isRequired # Called when block is removed

    connectDragSource: React.PropTypes.func.isRequired # the drag source connector, supplied by React DND
    connectDragPreview: React.PropTypes.func.isRequired # the drag preview connector, supplied by React DND

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
    elem = @props.connectDragPreview(H.div className: "mwater-visualization-block",
      if not @props.isDragging and @props.connectDragSource?
        @props.connectDragSource(H.div key: "move", className: "mwater-visualization-block-move",
          H.i className: "fa fa-arrows")

      if not @props.isDragging and @props.onBlockRemove?
        H.div key: "remove", className: "mwater-visualization-block-remove", onClick: @props.onBlockRemove,
          H.i className: "fa fa-times"

      if not @props.isDragging and @props.onAspectRatioChange?
        # TODO sometimes drags (onDragStart) and so doesn't work. Disable dragging?
        H.div key: "aspect", className: "mwater-visualization-block-aspect", onMouseDown: @handleAspectMouseDown,
          H.i className: "fa fa-arrows-v"

      @renderAspectDrag()

      @props.children
    )

    return elem
