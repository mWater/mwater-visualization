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

  constructor: (props) ->
    super
    @state = { moveHover: null, resizeHover: null }

  setMoveHover: (hoverInfo) ->
    @setState(moveHover: hoverInfo)

  setResizeHover: (hoverInfo) -> 
    console.log hoverInfo
    @setState(resizeHover: hoverInfo)

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

        # if blockElems.length > 0 then blockElems
        # placeholder
    # if @state.moveHover
    #   snappedX = Math.round(@state.moveHover.x/@props.width*12)
    #   snappedY = Math.round(@state.moveHover.y/@props.height*12)
    #   if snappedX < 0 then snappedX = 0
    #   if snappedY < 0 then snappedY = 0

    #   placeholder = @renderPlaceholder(snappedX, snappedY, 3, 2)

    # # if @state.resize
    # #   snappedX = Math.round(@state.resize.x/@props.width*12)
    # #   snappedY = Math.round(@state.resize.y/@props.height*12)

    # #   snapped = @renderPlaceholder(2, 2, snappedX + 3, snappedY + 2)

    # # Skip rendering moving blocks
    # blocks = @props.blocks

    # blockElems = _.map blocks, (block) =>
    #   if @state.moveHover
    #     hoverBlock = @state.moveHover.block
    #   if @state.resizeHover
    #     hoverBlock = @state.resizeHover.block
    #   @renderBlock(block, block == hoverBlock)


  # renderElem: (block, hidden) ->
  #   H.div style: { 
  #     position: "absolute", 
  #     display: if hidden then "none" else "block"
  #     top: @props.height / @props.blocksAcross * block.y
  #     left: @props.width / @props.blocksAcross * block.x },
  #     React.createElement(MoveResizeBlock, 
  #       # onBeginMove: @handleBeginMoveBlock.bind(this, block)
  #       # onEndMove: @handleEndMoveBlock
  #       # onBeginResize: -> console.log "BEGIN"
  #       # onEndResize: (success) -> console.log "END #{success}"
  #       width: @props.width / @props.blocksAcross * block.width, 
  #       height: @props.height / @props.blocksAcross * block.height
  #       widgetFactory: @props.widgetFactory
  #       widget: block.widget
  #       block: block
  #       )


  # # Move block to new x, y
  # setMoveBlock: (block, x, y) ->
  #   return
  # componentWillReceiveProps: (nextProps) ->
  #   # Reset hover blocks if not over
  #   if not nextProps.isOver
  #     if @state.moveHover
  #       @setState(moveHover: null)
  #     if @state.resizeHover
  #       @setState(resizeHover: null)

  dropMoveBlock: (data) -> 
    @setState(draggingIndex: null)
    console.log "DROP"
    console.log data
  dropResizeBlock: (data) -> console.log data

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
        width: monitor.getItem().width + monitor.getDifferenceFromInitialOffset().x
        height: monitor.getItem().width + monitor.getDifferenceFromInitialOffset().y
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
  render: ->
    blocks = [
      { id: 1, contents: "hi", elem: React.createElement(Widget, text: "hi"), layout: { x: 1, y: 2, w: 3, h: 2 } }
      { id: 2, contents: "there", elem: React.createElement(Widget, text: "tim"), layout: { x: 5, y: 4, w: 3, h: 1 } }
    ]

    layoutEngine = new LayoutEngine(600, 12)
    H.div null, 
      React.createElement(DropContainer, 
        layoutEngine: layoutEngine,
        blocks: blocks
        width: 600, 
        height: 400)


DragDropRoot = DragDropContext(HTML5Backend)(Root)

$ ->
  sample = React.createElement(DragDropRoot)
  React.render(sample, document.getElementById('root'))
