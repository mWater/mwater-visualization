React = require 'react'
H = React.DOM
R = React.createElement

DragSource = require('react-dnd').DragSource
DropTarget = require('react-dnd').DropTarget
DragDropContext = require('react-dnd').DragDropContext

HTML5Backend = require('react-dnd-html5-backend')
NestableDragDropContext = require  "react-library/lib/NestableDragDropContext"

class BlocksDesignerComponent extends React.Component
  render: ->
    H.div null,
      R DraggableBlockComponent, key: "a", block: { id: "a"}
      R DraggableBlockComponent, key: "b", block: { id: "b"}
      R DraggableBlockComponent, key: "c", block: { id: "c"}
      R DraggableBlockComponent, key: "d", block: { id: "d"}
      R DraggableBlockComponent, key: "e", block: { id: "e"}
      R DraggableBlockComponent, key: "f", block: { id: "f"}
      R DraggableBlockComponent, key: "g", block: { id: "g"}
      R DraggableBlockComponent, key: "h", block: { id: "h"}
      R DraggableBlockComponent, key: "i", block: { id: "i"}
      R DraggableBlockComponent, key: "j", block: { id: "j"}
      R DraggableBlockComponent, key: "k", block: { id: "k"}
      R DraggableBlockComponent, key: "l", block: { id: "l"}
      R DraggableBlockComponent, key: "m", block: { id: "m"}
      R DraggableBlockComponent, key: "n", block: { id: "n"}

module.exports = NestableDragDropContext(HTML5Backend)(BlocksDesignerComponent)

blockTargetSpec =
  # Called when an block hovers over this component
  hover: (props, monitor, component) ->
    # Hovering over self does nothing
    hoveringId = monitor.getItem().block.id
    myId = props.block.id
    if hoveringId == myId
      return

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

    blockComponent.setState(hoverPos: pos)
    # blockComponent.setState(hoverOffset: { x: hoverClientX, y: hoverClientY })
    # hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2


    # console.log "setting hoverOffset in #{JSON.stringify(component.props)}"

    # # If the list ID of the item being dragged is not the same as the list ID of current component, do nothing
    # if props.constrainTo != monitor.getItem().constrainTo
    #   return

    # hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect()

    # hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
    # clientOffset = monitor.getClientOffset()

    # # Get position within hovered item
    # hoverClientY = clientOffset.y - hoverBoundingRect.top

    # # If is in top half, and is within the height of the dragged item
    # if (hoverClientY < hoverMiddleY) and (hoverClientY < monitor.getItem().height)
    #   # Put before
    #   props.onPutBefore(myId, hoveringId)
    #   return

    # # If is in bottom half, and is within the height of the dragged item
    # if (hoverClientY > hoverMiddleY) and (hoverClientY > hoverBoundingRect.height - monitor.getItem().height)
    #   # Put before
    #   props.onPutAfter(myId, hoveringId)
    #   return

  # canDrop: (props, monitor) ->
    # If the list ID of the item being dragged is not the same as the list ID of current component, do nothing
    # props.constrainTo == monitor.getItem().constrainTo


blockSourceSpec = {
  beginDrag: (props, monitor, component) ->
    return {
      block: props.block
      # # Save height of dragged component 
      # height: ReactDOM.findDOMNode(component).getBoundingClientRect().height
    }

  isDragging: (props, monitor) ->
    return props.block.id == monitor.getItem().block.id

  # endDrag: (props, monitor, component) ->
  #   props.onEndDrag()
}


collectTarget = (connect, monitor) ->
  return {
    connectDropTarget: connect.dropTarget()
    isOver: monitor.isOver({ shallow: true }) # and monitor.canDrop()
    canDrop: monitor.canDrop()
  }


collectSource = (connect, monitor) ->
  return {
    connectDragSource: connect.dragSource()
    connectDragPreview: connect.dragPreview()
    isDragging: monitor.isDragging()
  }


class DraggableBlockComponent extends React.Component
  @propTypes:
    block: React.PropTypes.object.isRequired # Block to display
    isDragging: React.PropTypes.bool.isRequired # internally used for tracking if an item is being dragged
    isOver: React.PropTypes.bool.isRequired # internally used to check if an item is over the current component
    canDrop: React.PropTypes.bool.isRequired # internally used as a flag it the item being dragged can be dropped in place of the item it is over
    # clientOffset: React.PropTypes.
    connectDragSource: React.PropTypes.func.isRequired # the drag source connector, supplied by React DND
    connectDropTarget: React.PropTypes.func.isRequired # the drop target connector, supplied by React DND
    connectDragPreview: React.PropTypes.func.isRequired # the drag preview connector, supplied by React DND

  constructor: (props) ->
    super(props)

    @state = {
      hoverPos: null
    }

  render: ->
    outerStyle = {
      padding: 3
    }

    # Show
    if @props.isOver
      # style.backgroundColor = "#DDF"
      switch @state.hoverPos
        when "left"
          outerStyle.borderLeft = "solid 3px #38D"
        when "right"
          outerStyle.borderRight = "solid 3px #38D"
        when "top"
          outerStyle.borderTop = "solid 3px #38D"
        when "bottom"
          outerStyle.borderBottom = "solid 3px #38D"

    style = { 
      padding: 5
      margin: 5
      border: "solid 1px #AAA"
      borderRadius: 5 
      height: 100
    } 

    # Hide if dragging
    if @props.isDragging
      style.visibility = "hidden"

    elem = H.div style: outerStyle,
      H.div style: style, 
        @props.block.id
        if @state.hoverOffset and @props.isOver
          " #{@state.hoverOffset.x},#{@state.hoverOffset.y}"

    return @props.connectDragSource(@props.connectDragPreview(@props.connectDropTarget(elem)))


DraggableBlockComponent = _.flow(DragSource("block", blockSourceSpec, collectSource), DropTarget("block", blockTargetSpec, collectTarget))(DraggableBlockComponent)

