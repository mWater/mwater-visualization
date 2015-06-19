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
  render: ->
    React.cloneElement(React.Children.only(@props.children), {
      connectMoveHandle: @props.connectMoveHandle
      connectResizeHandle: @props.connectResizeHandle      
      })

moveSpec = {
  beginDrag: (props, monitor, component) -> 
    # props.onBeginMove()

    return { 
      block: props.block
      width: props.width
      height: props.height
    }
  endDrag: (props, monitor, component) ->
    # props.onEndMove(monitor.didDrop())
}

moveCollect = (connect, monitor) ->
  return { connectMoveHandle: connect.dragSource() }

MoveBlock = DragSource("block-move", moveSpec, moveCollect)(Block)

resizeSpec = {
  beginDrag: (props, monitor, component) ->
    return { 
      block: props.block
      width: props.width
      height: props.height
    }
    # # props.onBeginResize()
    # return { type: "resize" } # TODO
  endDrag: (props, monitor, component) ->
    # props.onEndResize(monitor.didDrop())
}

resizeCollect = (connect, monitor) ->
  return { connectResizeHandle: connect.dragSource() }

MoveResizeBlock = DragSource("block-resize", resizeSpec, resizeCollect)(MoveBlock)

# Container contains layout elements
class Container extends React.Component
  @propTypes:
    layoutEngine: React.PropTypes.object.isRequired
    layoutElems: React.PropTypes.array.isRequired # Array of { elem, layout }
    width: React.PropTypes.number.isRequired # width in pixels
    height: React.PropTypes.number.isRequired # height in pixels
    connectDropTarget: React.PropTypes.func.isRequired # Injected by react-dnd wrapper

  constructor: (props) ->
    super
    @state = {}

  renderElem: (layoutElem) =>
    # Calculate bounds
    bounds = @props.layoutEngine.getLayoutBounds(layoutElem.layout)

    # Position absolutely
    style = { 
      position: "absolute"
      top: bounds.x
      left: bounds.y
    }

    # Clone element, injecting width, height and enclosing in a dnd block
    return H.div style: style,
      React.createElement(MoveResizeBlock, {}, 
        React.cloneElement(layoutElem.elem, width: bounds.width, height: bounds.height))

  renderElems: ->
    return _.map @props.layoutElems, @renderElem

  render: ->
    style = {
      width: @props.width
      height: @props.height
      position: "relative"
    }

    # Connect as a drop target
    @props.connectDropTarget(
      H.div style: style, 
        @renderElems()
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

  # renderPlaceholder: (x, y, width, height) ->
  #   H.div style: { 
  #     position: "absolute", 
  #     left: @props.width/@props.blocksAcross*x
  #     top: @props.height/@props.blocksAcross*y
  #     width: @props.width/@props.blocksAcross*width
  #     height: @props.height/@props.blocksAcross*height
  #     border: "dashed 3px #DDD"
  #     borderRadius: 5
  #     padding: 5
  #     position: "absolute"
  #   }

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

  # setMoveHover: (dragInfo) ->
  #   @setState(moveHover: dragInfo)

  # setResizeHover: (dragInfo) ->
  #   @setState(resizeHover: dragInfo)

  # dropMoveBlock: (dragInfo) ->
  #   # TODO
  #   console.log dragInfo

  # dropResizeBlock: (dragInfo) ->
  #   # TODO
  #   console.log dragInfo


targetSpec = {
  drop: (props, monitor, component) ->
    if monitor.getItemType() == "block-move"
      component.dropMoveBlock(
        x: monitor.getClientOffset().x - (monitor.getInitialClientOffset().x - monitor.getInitialSourceClientOffset().x)
        y: monitor.getClientOffset().y - (monitor.getInitialClientOffset().y - monitor.getInitialSourceClientOffset().y)
        width: monitor.getItem().width
        height: monitor.getItem().height
        block: monitor.getItem().block
        )
    if monitor.getItemType() == "block-resize"
      component.dropResizeBlock({
        block: monitor.getItem().block
        width: monitor.getItem().width + monitor.getDifferenceFromInitialOffset().x
        height: monitor.getItem().width + monitor.getDifferenceFromInitialOffset().y
        })
  hover: (props, monitor, component) ->
    if monitor.getItemType() == "block-move"
      component.setMoveHover(
        block: monitor.getItem().block
        x: monitor.getClientOffset().x - (monitor.getInitialClientOffset().x - monitor.getInitialSourceClientOffset().x)
        y: monitor.getClientOffset().y - (monitor.getInitialClientOffset().y - monitor.getInitialSourceClientOffset().y)
        width: monitor.getItem().width
        height: monitor.getItem().height
        )
    if monitor.getItemType() == "block-resize"
      component.setResizeHover({
        block: monitor.getItem().block
        width: monitor.getItem().width + monitor.getDifferenceFromInitialOffset().x
        height: monitor.getItem().width + monitor.getDifferenceFromInitialOffset().y
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
      { x: 1, y: 2, width: 3, height: 2, widget: { text: "A" }}
    ]

    widgetFactory = (options) =>
      return React.createElement(Widget, 
        text: options.widget.text, 
        width: options.width, 
        height: options.height
        connectMoveHandle: options.connectMoveHandle
        connectResizeHandle: options.connectResizeHandle)

    layoutElems = [
      { elem: React.createElement(Widget, text: "hi"), layout: { x: 1, y: 2, w: 3, h: 2 } }
    ]

    layoutEngine = new LayoutEngine(600, 12)
    H.div null, 
      React.createElement(DropContainer, 
        layoutEngine: layoutEngine,
        layoutElems: layoutElems
        width: 600, 
        height: 400)


DragDropRoot = DragDropContext(HTML5Backend)(Root)

$ ->
  sample = React.createElement(DragDropRoot)
  React.render(sample, document.getElementById('root'))
