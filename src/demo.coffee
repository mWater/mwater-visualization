React = require 'react'
H = React.DOM
DragSource = require('react-dnd').DragSource
DropTarget = require('react-dnd').DropTarget
DragDropContext = require('react-dnd').DragDropContext
HTML5Backend = require('react-dnd/modules/backends/HTML5')

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

class Block extends React.Component
  render: ->
    return @props.widgetFactory(
      widget: @props.widget
      width: @props.width
      height: @props.height
      connectMoveHandle: @props.connectMoveHandle
      connectResizeHandle: @props.connectResizeHandle
      )

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

# Container contains blocks, each with a widget inside
class Container extends React.Component
  constructor: (props) ->
    super
    @state = {}

  renderBlock: (block, hidden) ->
    H.div style: { 
      position: "absolute", 
      display: if hidden then "none" else "block"
      top: @props.height / @props.blocksAcross * block.y
      left: @props.width / @props.blocksAcross * block.x },
      React.createElement(MoveResizeBlock, 
        # onBeginMove: @handleBeginMoveBlock.bind(this, block)
        # onEndMove: @handleEndMoveBlock
        # onBeginResize: -> console.log "BEGIN"
        # onEndResize: (success) -> console.log "END #{success}"
        width: @props.width / @props.blocksAcross * block.width, 
        height: @props.height / @props.blocksAcross * block.height
        widgetFactory: @props.widgetFactory
        widget: block.widget
        block: block
        )

  renderPlaceholder: (x, y, width, height) ->
    H.div style: { 
      position: "absolute", 
      left: @props.width/@props.blocksAcross*x
      top: @props.height/@props.blocksAcross*y
      width: @props.width/@props.blocksAcross*width
      height: @props.height/@props.blocksAcross*height
      border: "dashed 3px #DDD"
      borderRadius: 5
      padding: 5
      position: "absolute"
    }

  # # Move block to new x, y
  # setMoveBlock: (block, x, y) ->
  #   return
  componentWillReceiveProps: (nextProps) ->
    # Reset hover blocks if not over
    if not nextProps.isOver
      if @state.moveHover
        @setState(moveHover: null)
      if @state.resizeHover
        @setState(resizeHover: null)

  setMoveHover: (dragInfo) ->
    @setState(moveHover: dragInfo)

  setResizeHover: (dragInfo) ->
    @setState(resizeHover: dragInfo)

  dropBlock: (dragInfo) ->
    # TODO
    console.log dragInfo

  render: ->
    style = {
      width: @props.width
      height: @props.height
      position: "relative"
    }

    if @state.moveHover
      snappedX = Math.round(@state.moveHover.x/@props.width*12)
      snappedY = Math.round(@state.moveHover.y/@props.height*12)
      if snappedX < 0 then snappedX = 0
      if snappedY < 0 then snappedY = 0

      placeholder = @renderPlaceholder(snappedX, snappedY, 3, 2)

    # if @state.resize
    #   snappedX = Math.round(@state.resize.x/@props.width*12)
    #   snappedY = Math.round(@state.resize.y/@props.height*12)

    #   snapped = @renderPlaceholder(2, 2, snappedX + 3, snappedY + 2)

    # Skip rendering moving blocks
    blocks = @props.blocks

    blockElems = _.map blocks, (block) =>
      if @state.moveHover
        hoverBlock = @state.moveHover.block
      if @state.resizeHover
        hoverBlock = @state.resizeHover.block
      @renderBlock(block, block == hoverBlock)

    @props.connectDropTarget(
      H.div style: style, 
        if blockElems.length > 0 then blockElems
        placeholder
    )

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

    H.div null, 
      React.createElement(DropContainer, 
        width: 600, 
        height: 400, 
        blocksAcross: 12
        blocks: blocks,
        widgetFactory: widgetFactory)

DragDropRoot = DragDropContext(HTML5Backend)(Root)

$ ->
  sample = React.createElement(DragDropRoot)
  React.render(sample, document.getElementById('root'))
