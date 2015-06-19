React = require 'react'
H = React.DOM
DragSource = require('react-dnd').DragSource
DropTarget = require('react-dnd').DropTarget
DragDropContext = require('react-dnd').DragDropContext
HTML5Backend = require('react-dnd/modules/backends/HTML5')

class LayoutEngine 
  constructor: (width, blocksAcross) ->
    @width = width
    @blocksAcross = blocksAcross
    @scale = @width / @blocksAcross

  # Get the bounds of a layout (x, y, width, height)
  getLayoutBounds: (layout) ->
    return {
      x: @scale * layout.x
      y: @scale * layout.y
      width: @scale * layout.w
      height: @scale * layout.h
    }

  # Inserts a rectangle (x, y, width, height)
  # Returns { layouts (modified to make room) and rectLayout (layout of new rectangle) }
  insertRect: (layouts, rect) ->
    # Just place in approximate location
    x = Math.round(rect.x / @scale)
    y = Math.round(rect.y / @scale)
    w = Math.round(rect.width / @scale)
    h = Math.round(rect.height / @scale)

    # Clip
    if x < 0 then x = 0 
    if y < 0 then y = 0 
    if x >= @blocksAcross then x = @blocksAcross - 1

    if w < 1 then w = 1
    if x + w > @blocksAcross then w = @blocksAcross - x

    if h < 1 then h = 1

    return { layouts: layouts, rectLayout: { x: x, y: y, w: w, h: h }}

class Widget extends React.Component
  render: ->
    style = {
      width: @props.width
      height: @props.height
      border: "solid 3px #35A"
      backgroundColor: "white"
      borderRadius: 5
      padding: 5
      position: "absolute"
    }

    resizeHandleStyle = {
      position: "absolute"
      right: 0
      bottom: 0
      backgroundColor: "green"
      width: 20
      height: 20
    }

    return @props.connectMoveHandle(
      H.div style: style,
        "Hello! #{@props.text}"
        @props.connectResizeHandle(
          H.div style: resizeHandleStyle
          )
      )

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
    blocks: React.PropTypes.array.isRequired # Array of { id, contents, elem, layout }
    width: React.PropTypes.number.isRequired # width in pixels
    height: React.PropTypes.number.isRequired # height in pixels
    connectDropTarget: React.PropTypes.func.isRequired # Injected by react-dnd wrapper
    onAddBlock: React.PropTypes.func.isRequired # Called with { content, layout } to add a block
    onUpdateBlocks: React.PropTypes.func.isRequired # Called with array of { id, layout } to update layouts
    onRemoveBlock: React.PropTypes.func.isRequired # Called with id of block to remove

  constructor: (props) ->
    super
    @state = { moveHover: null, resizeHover: null }

  setMoveHover: (hoverInfo) ->
    @setState(moveHover: hoverInfo)

  setResizeHover: (hoverInfo) -> 
    console.log hoverInfo
    @setState(resizeHover: hoverInfo)

  # Called when a block is dropped
  dropMoveBlock: (dropInfo) -> 
    # Stop hover
    @setState(moveHover: null)

    # Remove existing block if matches
    if _.findWhere(@props.blocks, { id: dropInfo.dragInfo.id })
      @props.onRemoveBlock(dropInfo.dragInfo.id)

    # Get remaining blocks
    existingBlocks = _.reject(@props.blocks, (block) => block.id == dropInfo.dragInfo.id)

    hoveredBlockRect = {
      x: dropInfo.x
      y: dropInfo.y
      width: dropInfo.dragInfo.bounds.width
      height: dropInfo.dragInfo.bounds.height
    }

    # Insert new block using layout
    { layouts, rectLayout } = @props.layoutEngine.insertRect(_.pluck(existingBlocks, "layout"), hoveredBlockRect)

    # Update existing blocks layouts
    @props.onUpdateBlocks(_.map(_.range(0, layouts.length), (index) => { id: existingBlocks[index].id, layout: layouts[index] }))

    # Add new block
    @props.onAddBlock({ contents: dropInfo.dragInfo.contents, layout: rectLayout })
  
  dropResizeBlock: (dropInfo) ->
    # Stop hover
    @setState(resizeHover: null)

    # TODO very duplicate code
    # Remove existing block if matches
    if _.findWhere(@props.blocks, { id: dropInfo.dragInfo.id })
      @props.onRemoveBlock(dropInfo.dragInfo.id)

    # Get remaining blocks
    existingBlocks = _.reject(@props.blocks, (block) => block.id == dropInfo.dragInfo.id)

    hoveredBlockRect = {
      x: dropInfo.dragInfo.bounds.x
      y: dropInfo.dragInfo.bounds.y
      width: dropInfo.width
      height: dropInfo.height
    }

    # Insert new block using layout
    { layouts, rectLayout } = @props.layoutEngine.insertRect(_.pluck(existingBlocks, "layout"), hoveredBlockRect)

    # Update existing blocks layouts
    @props.onUpdateBlocks(_.map(_.range(0, layouts.length), (index) => { id: existingBlocks[index].id, layout: layouts[index] }))

    # Add new block
    @props.onAddBlock({ contents: dropInfo.dragInfo.contents, layout: rectLayout })

  componentWillReceiveProps: (nextProps) ->
    # Reset hover blocks if not over
    if not nextProps.isOver
      # Defer to prevent "Cannot dispatch in the middle of a dispatch." error
      _.defer () =>
        @setState(moveHover: null, resizeHover: null)

  renderPlaceholder: (bounds) ->
    H.div style: { 
      position: "absolute", 
      left: bounds.x
      top: bounds.y
      width: bounds.width
      height: bounds.height
      border: "dashed 3px #DDD"
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
      id: block.id
      contents: block.contents
      bounds: bounds
    }

    # Clone element, injecting width, height and enclosing in a dnd block
    return H.div style: style,
      React.createElement(MoveResizeBlock, { dragInfo: dragInfo }, 
        React.cloneElement(block.elem, width: bounds.width, height: bounds.height))

  renderBlocks: ->
    elems = []

    # Get hovered block if present
    hoveredBlockId = null
    hoveredBlockRect = null  # Non-snapped version of hover rectangle
    if @state.moveHover
      hoveredBlockId = @state.moveHover.dragInfo.id
      hoveredBlockRect = {
        x: @state.moveHover.x
        y: @state.moveHover.y
        width: @state.moveHover.dragInfo.bounds.width
        height: @state.moveHover.dragInfo.bounds.height
      }

    if @state.resizeHover
      hoveredBlockId = @state.resizeHover.dragInfo.id
      hoveredBlockRect = {
        x: @state.resizeHover.dragInfo.bounds.x
        y: @state.resizeHover.dragInfo.bounds.y
        width: @state.resizeHover.width
        height: @state.resizeHover.height
      }

    # Skip blocks that are hovering
    renderableBlocks = _.reject(@props.blocks, (block) => block.id == hoveredBlockId)
    
    # If hovering, displace other blocks
    if hoveredBlockId
      { layouts, rectLayout } = @props.layoutEngine.insertRect(_.pluck(renderableBlocks, "layout"), hoveredBlockRect)
    else
      # Unchanged if not hovering
      layouts = _.pluck(renderableBlocks, "layout")
      rectLayout = null

    # Render renderable blocks
    for block in renderableBlocks
      elems.push(@renderBlock(block))

    # Add placeholder if hovering
    if rectLayout
      # Show placeholder
      elems.push(@renderPlaceholder(@props.layoutEngine.getLayoutBounds(rectLayout)))

    return elems

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

DropContainer = DropTarget(["block-move", "block-resize"], targetSpec, targetCollect)(Container)

class Root extends React.Component
  constructor: ->
    super
    @nextBlockId = 2

    @state = {
      blocks: [
        { id: 0, contents: "hi", elem: React.createElement(Widget, text: "hi"), layout: { x: 1, y: 2, w: 3, h: 2 } }
        { id: 1, contents: "there", elem: React.createElement(Widget, text: "tim"), layout: { x: 5, y: 4, w: 3, h: 1 } }
      ] 
    }

  handleAddBlock: (add) =>
    blocks = @state.blocks.slice()
    blocks.push({
      id: @nextBlockId
      contents: add.contents
      elem: React.createElement(Widget, text: add.contents)
      layout: add.layout
      })
    @nextBlockId += 1
    @setState(blocks: blocks)

  handleUpdateBlocks: (updates) =>
    blocks = @state.blocks.slice()
    for update in updates
      index = _.findIndex(blocks, (block) => block.id == update.id)
      # Copy over layout
      if index >= 0
        blocks[index] = _.extend({}, blocks[index], { layout: update.layout })
    @setState(blocks: blocks)

  handleRemoveBlock: (id) =>
    @setState(blocks: _.reject(@state.blocks, (block) => block.id == id))

  render: ->
    layoutEngine = new LayoutEngine(600, 12)
    H.div null, 
      React.createElement(DropContainer, 
        layoutEngine: layoutEngine,
        blocks: @state.blocks
        onAddBlock: @handleAddBlock
        onUpdateBlocks: @handleUpdateBlocks
        onRemoveBlock: @handleRemoveBlock
        width: 600, 
        height: 400)


DragDropRoot = DragDropContext(HTML5Backend)(Root)

$ ->
  sample = React.createElement(DragDropRoot)
  React.render(sample, document.getElementById('root'))
