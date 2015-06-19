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
    blocks: React.PropTypes.array.isRequired # Array of { contents, layout }
    elems: React.PropTypes.array.isRequired # Array of block elements
    width: React.PropTypes.number.isRequired # width in pixels
    height: React.PropTypes.number.isRequired # height in pixels
    connectDropTarget: React.PropTypes.func.isRequired # Injected by react-dnd wrapper
    onLayoutUpdate: React.PropTypes.func.isRequired # Called with array of { content, layout } 

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

    blocks = @props.blocks.slice()

    # Remove existing block if dropped from same container
    if dropInfo.dragInfo.container == this
      # Remove block and element
      blocks.splice(dropInfo.dragInfo.index, 1)

    hoveredBlockRect = {
      x: dropInfo.x
      y: dropInfo.y
      width: dropInfo.dragInfo.bounds.width
      height: dropInfo.dragInfo.bounds.height
    }

    # Insert new block using layout
    layouts = _.pluck(blocks, "layout")
    { layouts, rectLayout } = @props.layoutEngine.insertRect(layouts, hoveredBlockRect)

    # Update existing blocks layouts
    blocks = _.map(blocks, (eb, i) => { contents: eb.contents, layout: layouts[i] })

    # Add new block
    blocks.push({ contents: dropInfo.dragInfo.contents, layout: rectLayout })
    @props.onLayoutUpdate(blocks)
  
  dropResizeBlock: (dropInfo) ->
    # Stop hover
    @setState(resizeHover: null)

    blocks = @props.blocks.slice()

    # TODO very duplicate code
    # Remove existing block if dropped from same container
    if dropInfo.dragInfo.container == this
      # Remove block and element
      blocks.splice(dropInfo.dragInfo.index, 1)

    hoveredBlockRect = {
      x: dropInfo.dragInfo.bounds.x
      y: dropInfo.dragInfo.bounds.y
      width: dropInfo.width
      height: dropInfo.height
    }

    # Insert new block using layout
    layouts = _.pluck(blocks, "layout")
    { layouts, rectLayout } = @props.layoutEngine.insertRect(layouts, hoveredBlockRect)

    # Update existing blocks layouts
    blocks = _.map(blocks, (eb, i) => { contents: eb.contents, layout: layouts[i] })

    # Add new block
    blocks.push({ contents: dropInfo.dragInfo.contents, layout: rectLayout })
    @props.onLayoutUpdate(blocks)

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

  renderBlock: (block, elem, index) =>
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
      contents: block.contents
      container: this  # To know if dropping on same container
      index: index # Index of the block in the container
      bounds: bounds
    }

    # Clone element, injecting width, height and enclosing in a dnd block
    return H.div style: style, key: "" + index,
      React.createElement(MoveResizeBlock, { dragInfo: dragInfo }, 
        React.cloneElement(elem, width: bounds.width, height: bounds.height))

  renderBlocks: ->
    renderElems = []

    # Get hovered block if present
    hoveredDragInfo = null
    hoveredBlockRect = null  # Non-snapped version of hover rectangle
    if @state.moveHover
      hoveredDragInfo = @state.moveHover.dragInfo
      hoveredBlockRect = {
        x: @state.moveHover.x
        y: @state.moveHover.y
        width: @state.moveHover.dragInfo.bounds.width
        height: @state.moveHover.dragInfo.bounds.height
      }

    if @state.resizeHover
      hoveredDragInfo = @state.resizeHover.dragInfo
      hoveredBlockRect = {
        x: @state.resizeHover.dragInfo.bounds.x
        y: @state.resizeHover.dragInfo.bounds.y
        width: @state.resizeHover.width
        height: @state.resizeHover.height
      }

    blocks = @props.blocks.slice()
    elems = @props.elems.slice()
    
    # Skip blocks that are hovering if from same container
    if hoveredDragInfo and hoveredDragInfo.container == this
      # Remove block and element
      blocks.splice(hoveredDragInfo.index, 1)
      elems.splice(hoveredDragInfo.index, 1)

    # If hovering, displace other blocks
    layouts = _.pluck(blocks, "layout")
    if hoveredBlockRect
      { layouts, rectLayout } = @props.layoutEngine.insertRect(layouts, hoveredBlockRect)
    else
      rectLayout = null

    # Render blocks in their adjusted position
    for i in [0...blocks.length]
      renderElems.push(@renderBlock({ contents: blocks[i].contents, layout: layouts[i] }, elems[i], i))

    # Add placeholder if hovering
    if rectLayout
      # Show placeholder
      renderElems.push(@renderPlaceholder(@props.layoutEngine.getLayoutBounds(rectLayout)))

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

DropContainer = DropTarget(["block-move", "block-resize"], targetSpec, targetCollect)(Container)

class Root extends React.Component
  constructor: ->
    super
    @state = {
      blocks: [
        { contents: "hi", layout: { x: 1, y: 2, w: 3, h: 2 } }
        { contents: "there", layout: { x: 5, y: 4, w: 3, h: 1 } }
      ] 
    }

  handleLayoutUpdate: (blocks) =>
    @setState(blocks: blocks)

  render: ->
    layoutEngine = new LayoutEngine(600, 12)

    # Create elems
    elems = _.map(@state.blocks, (block) => React.createElement(Widget, text: block.contents))

    H.div null, 
      React.createElement(DropContainer, 
        layoutEngine: layoutEngine
        blocks: @state.blocks
        elems: elems
        onLayoutUpdate: @handleLayoutUpdate
        width: 600, 
        height: 400)


DragDropRoot = DragDropContext(HTML5Backend)(Root)

$ ->
  sample = React.createElement(DragDropRoot)
  React.render(sample, document.getElementById('root'))
