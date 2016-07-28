React = require 'react'
H = React.DOM
R = React.createElement

DragSource = require('react-dnd').DragSource
DropTarget = require('react-dnd').DropTarget

# Block which can be dragged around in block layout.
class DraggableBlockComponent extends React.Component
  @propTypes:
    block: React.PropTypes.object.isRequired # Block to display

    onBlockDrop: React.PropTypes.func.isRequired # Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right
    style: React.PropTypes.object # Merge in style

    onlyBottom: React.PropTypes.bool # True to only allow dropping at bottom (root block)

    # Injected by React-dnd
    isDragging: React.PropTypes.bool.isRequired # internally used for tracking if an item is being dragged
    isOver: React.PropTypes.bool.isRequired # internally used to check if an item is over the current component

    connectDragSource: React.PropTypes.func.isRequired # the drag source connector, supplied by React DND
    connectDropTarget: React.PropTypes.func.isRequired # the drop target connector, supplied by React DND
    connectDragPreview: React.PropTypes.func.isRequired # the drag preview connector, supplied by React DND

  constructor: (props) ->
    super(props)

    @state = {
      hoverSide: null
    }

  renderHover: ->
    lineStyle = { position: "absolute" }

    # Show
    if @props.isOver
      # style.backgroundColor = "#DDF"
      switch @state.hoverSide
        when "left"
          lineStyle.borderLeft = "solid 3px #38D"
          lineStyle.top = 0
          lineStyle.bottom = 0
          lineStyle.left = 0
        when "right"
          lineStyle.borderRight = "solid 3px #38D"
          lineStyle.top = 0
          lineStyle.right = 0
          lineStyle.bottom = 0
        when "top"
          lineStyle.borderTop = "solid 3px #38D"
          lineStyle.top = 0
          lineStyle.left = 0
          lineStyle.right = 0
        when "bottom"
          lineStyle.borderBottom = "solid 3px #38D"
          lineStyle.bottom = 0
          lineStyle.left = 0
          lineStyle.right = 0

      return H.div style: lineStyle
    else
      return null

  render: ->
    style = { } 

    # Hide if dragging
    if @props.isDragging
      style.visibility = "hidden"

    return @props.connectDropTarget(H.div style: @props.style,
      H.div style: { position: "relative" },
        @renderHover()
        React.cloneElement(React.Children.only(@props.children), {
          connectDragSource: @props.connectDragSource
          connectDragPreview: @props.connectDragPreview
        })
    )

# Gets the drop side (top, left, right, bottom)
getDropSide = (monitor, component) ->
  # Get underlying component
  blockComponent = component.getDecoratedComponentInstance()

  # Get bounds of component
  hoverBoundingRect = ReactDOM.findDOMNode(blockComponent).getBoundingClientRect()

  clientOffset = monitor.getClientOffset()

  # Get position within hovered item
  hoverClientX = clientOffset.x - hoverBoundingRect.left
  hoverClientY = clientOffset.y - hoverBoundingRect.top

  # Determine if over is more left, right, top or bottom
  fractionX = hoverClientX / (hoverBoundingRect.right - hoverBoundingRect.left)
  fractionY = hoverClientY / (hoverBoundingRect.bottom - hoverBoundingRect.top)

  if fractionX > fractionY  # top or right
    if (1 - fractionX) > fractionY # top or left
      pos = "top"
    else
      pos = "right"
  else # bottom or left
    if (1 - fractionX) > fractionY # top or left
      pos = "left"
    else
      pos = "bottom"

  return pos

blockTargetSpec =
  # Called when an block hovers over this component
  hover: (props, monitor, component) ->
    # Hovering over self does nothing
    hoveringId = monitor.getItem().block.id
    myId = props.block.id
    if hoveringId == myId
      return

    if props.onlyBottom
      side = "bottom"
    else
      side = getDropSide(monitor, component)

    # Set the state
    component.getDecoratedComponentInstance().setState(hoverSide: side)

  canDrop: (props, monitor) ->
    hoveringId = monitor.getItem().block.id
    myId = props.block.id
    if hoveringId == myId
      return false

    return true

  drop: (props, monitor, component) ->
    if monitor.didDrop()
      return

    side = component.getDecoratedComponentInstance().state.hoverSide
    props.onBlockDrop(monitor.getItem().block, props.block, side)

blockSourceSpec = {
  beginDrag: (props, monitor, component) ->
    return {
      block: props.block
    }

  isDragging: (props, monitor) ->
    return props.block.id == monitor.getItem().block.id
}

collectTarget = (connect, monitor) ->
  return {
    connectDropTarget: connect.dropTarget()
    isOver: monitor.isOver({ shallow: true })
    canDrop: monitor.canDrop()
  }


collectSource = (connect, monitor) ->
  return {
    connectDragSource: connect.dragSource()
    connectDragPreview: connect.dragPreview()
    isDragging: monitor.isDragging()
  }


module.exports = _.flow(DragSource("block", blockSourceSpec, collectSource), DropTarget("block", blockTargetSpec, collectTarget))(DraggableBlockComponent)
