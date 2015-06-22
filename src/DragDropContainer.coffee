React = require 'react'
H = React.DOM
DragSource = require('react-dnd').DragSource
DropTarget = require('react-dnd').DropTarget
DragDropContext = require('react-dnd').DragDropContext
HTML5Backend = require('react-dnd/modules/backends/HTML5')

# Render a child element as draggable, resizable block, injecting handle connectors
# to child element
class Block extends React.Component
  @propTypes:
    dragInfo: React.PropTypes.object.isRequired  # Opaque information to be used when a block is dragged

  render: ->
    React.cloneElement(React.Children.only(@props.children), {
      connectMoveHandle: @props.connectMoveHandle
      connectResizeHandle: @props.connectResizeHandle      
      })

moveSpec = {
  beginDrag: (props, monitor, component) -> 
    return props.dragInfo
}

moveCollect = (connect, monitor) ->
  return { connectMoveHandle: connect.dragSource() }

MoveBlock = DragSource("block-move", moveSpec, moveCollect)(Block)

resizeSpec = {
  beginDrag: (props, monitor, component) ->
    return props.dragInfo
}

resizeCollect = (connect, monitor) ->
  return { connectResizeHandle: connect.dragSource() }

MoveResizeBlock = DragSource("block-resize", resizeSpec, resizeCollect)(MoveBlock)

# Container contains blocks to layout
class Container extends React.Component
  @propTypes:
    layoutEngine: React.PropTypes.object.isRequired
    blocks: React.PropTypes.array.isRequired # Array of { id, contents, layout }
    elems: React.PropTypes.object.isRequired # Lookup of id -> elem
    width: React.PropTypes.number.isRequired # width in pixels
    height: React.PropTypes.number.isRequired # height in pixels
    connectDropTarget: React.PropTypes.func.isRequired # Injected by react-dnd wrapper
    onLayoutUpdate: React.PropTypes.func.isRequired # Called with array of { id, content, layout } 

  constructor: (props) ->
    super
    @state = { moveHover: null, resizeHover: null }

  setMoveHover: (hoverInfo) ->
    @setState(moveHover: hoverInfo)

  setResizeHover: (hoverInfo) -> 
    @setState(resizeHover: hoverInfo)

  dropBlock: (block, droppedBlockRect) ->
    # Stop hover
    @setState(moveHover: null, resizeHover: null)

    # Get blocks by id
    blockLookup = _.indexBy(@props.blocks, "id")

    # Convert rect to layout
    droppedBlockLayout = @props.layoutEngine.rectToLayout(droppedBlockRect)

    # Insert dropped block
    blockLookup[block.id] = _.extend({}, block, layout: droppedBlockLayout)

    # Perform layout, first extracting layouts
    layouts = _.mapValues(blockLookup, (b) -> b.layout)
    layouts = @props.layoutEngine.performLayout(layouts, block.id)

    # Update blocks layouts
    blocks = []
    for key, value of layouts
      blocks.push(_.extend({}, blockLookup[key], layout: value))

    @props.onLayoutUpdate(blocks)
  
  # Called when a block is dropped
  dropMoveBlock: (dropInfo) -> 
    # Get rectangle of dropped block
    droppedBlockRect = {
      x: dropInfo.x
      y: dropInfo.y
      width: dropInfo.dragInfo.bounds.width   # width and height are from drop info
      height: dropInfo.dragInfo.bounds.height
    }

    @dropBlock(dropInfo.dragInfo.block, droppedBlockRect)
  
  dropResizeBlock: (dropInfo) ->
    # Get rectangle of hovered block
    droppedBlockRect = {
      x: dropInfo.dragInfo.bounds.x
      y: dropInfo.dragInfo.bounds.y
      width: dropInfo.width
      height: dropInfo.height
    }

    @dropBlock(dropInfo.dragInfo.block, droppedBlockRect)

  componentWillReceiveProps: (nextProps) ->
    # Reset hover blocks if not over
    if not nextProps.isOver
      # Defer to prevent "Cannot dispatch in the middle of a dispatch." error
      _.defer () =>
        @setState(moveHover: null, resizeHover: null)

  renderPlaceholder: (bounds) ->
    H.div key: "placeholder", style: { 
      position: "absolute", 
      left: bounds.x
      top: bounds.y
      width: bounds.width
      height: bounds.height
      border: "dashed 3px #AAA"
      borderRadius: 5
      padding: 5
      position: "absolute"
    }

  renderBlock: (block) =>
    # Calculate bounds
    bounds = @props.layoutEngine.getLayoutBounds(block.layout)

    # Position absolutely
    style = { 
      position: "absolute"
      left: bounds.x
      top: bounds.y
    }

    # Create dragInfo which is all the info needed to drop the block
    dragInfo = {
      block: block
      bounds: bounds
    }

    # Clone element, injecting width, height and enclosing in a dnd block
    return H.div style: style, key: block.id,
      React.createElement(MoveResizeBlock, { dragInfo: dragInfo }, 
        React.cloneElement(@props.elems[block.id], width: bounds.width, height: bounds.height))

  renderBlocks: ->
    renderElems = []

    # Get hovered block if present
    hoveredDragInfo = null
    hoveredBlockLayout = null  # Layout of hovered block
    if @state.moveHover
      hoveredDragInfo = @state.moveHover.dragInfo
      hoveredBlockRect = {
        x: @state.moveHover.x
        y: @state.moveHover.y
        width: @state.moveHover.dragInfo.bounds.width
        height: @state.moveHover.dragInfo.bounds.height
      }
      hoveredBlockLayout = @props.layoutEngine.rectToLayout(hoveredBlockRect)

    if @state.resizeHover
      hoveredDragInfo = @state.resizeHover.dragInfo
      hoveredBlockRect = {
        x: @state.resizeHover.dragInfo.bounds.x
        y: @state.resizeHover.dragInfo.bounds.y
        width: @state.resizeHover.width
        height: @state.resizeHover.height
      }
      hoveredBlockLayout = @props.layoutEngine.rectToLayout(hoveredBlockRect)

    blockLookup = _.indexBy(@props.blocks, "id")

    # Add hovered block to blocks
    if hoveredDragInfo
      blockLookup[hoveredDragInfo.block.id] = _.extend({}, hoveredDragInfo.block, layout: hoveredBlockLayout)

    # Perform layout, first extracting layouts
    layouts = _.mapValues(blockLookup, (b) -> b.layout)
    layouts = @props.layoutEngine.performLayout(layouts, if hoveredDragInfo then hoveredDragInfo.block.id)

    # Update blocks layouts
    blocks = []
    for key, value of layouts
      blocks.push(_.extend({}, blockLookup[key], layout: value))

    # Render blocks in their adjusted position
    for block in blocks
      if not hoveredBlockLayout or block.id != hoveredDragInfo.block.id
        renderElems.push(@renderBlock(block))
      else
        renderElems.push(@renderPlaceholder(@props.layoutEngine.getLayoutBounds(hoveredBlockLayout)))

    return renderElems

  render: ->
    style = {
      width: @props.width
      height: @props.height
      position: "relative"
    }

    # Connect as a drop target
    @props.connectDropTarget(
      H.div style: style, 
        @renderBlocks()
    )

targetSpec = {
  drop: (props, monitor, component) ->
    if monitor.getItemType() == "block-move"
      component.dropMoveBlock(
        dragInfo: monitor.getItem()
        x: monitor.getClientOffset().x - (monitor.getInitialClientOffset().x - monitor.getInitialSourceClientOffset().x)
        y: monitor.getClientOffset().y - (monitor.getInitialClientOffset().y - monitor.getInitialSourceClientOffset().y)
        )
    if monitor.getItemType() == "block-resize"
      component.dropResizeBlock({
        dragInfo: monitor.getItem()
        width: monitor.getItem().bounds.width + monitor.getDifferenceFromInitialOffset().x
        height: monitor.getItem().bounds.height + monitor.getDifferenceFromInitialOffset().y
        })
  hover: (props, monitor, component) ->
    if monitor.getItemType() == "block-move"
      component.setMoveHover(
        dragInfo: monitor.getItem()
        x: monitor.getClientOffset().x - (monitor.getInitialClientOffset().x - monitor.getInitialSourceClientOffset().x)
        y: monitor.getClientOffset().y - (monitor.getInitialClientOffset().y - monitor.getInitialSourceClientOffset().y)
        )
    if monitor.getItemType() == "block-resize"
      component.setResizeHover({
        dragInfo: monitor.getItem()
        width: monitor.getItem().bounds.width + monitor.getDifferenceFromInitialOffset().x
        height: monitor.getItem().bounds.height + monitor.getDifferenceFromInitialOffset().y
        })
}

targetCollect = (connect, monitor) ->
  return {
    connectDropTarget: connect.dropTarget()
    isOver: monitor.isOver()
    clientOffset: monitor.getClientOffset()
  }

module.exports = DragDropContainer = DragDropContext(HTML5Backend)(DropTarget(["block-move", "block-resize"], targetSpec, targetCollect)(Container))
