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
        "Hello!"
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
  beginDrag: (props) -> 
    props.onBeginMove()
    return { type: "block" } # TODO
  endDrag: (props, monitor, component) ->
    props.onEndMove(monitor.didDrop())
}

moveCollect = (connect, monitor) ->
  return { connectMoveHandle: connect.dragSource() }

MoveBlock = DragSource("widget", moveSpec, moveCollect)(Block)

resizeSpec = {
  beginDrag: (props) -> { type: "resize" }
}

resizeCollect = (connect, monitor) ->
  return { connectResizeHandle: connect.dragSource() }

MoveResizeBlock = DragSource("widget-resize", resizeSpec, resizeCollect)(MoveBlock)

# Container contains blocks, each with a widget inside
class Container extends React.Component
  constructor: (props) ->
    super
    @state = {}

  renderBlock: (block) ->
    H.div style: { 
      position: "absolute", 
      top: @props.height/12*block.y
      left: @props.width/12*block.x },
      React.createElement(MoveResizeBlock, 
        onBeginMove: -> console.log "BEGIN"
        onEndMove: (success) -> console.log "END #{success}"
        width: @props.width/12*block.width, 
        height: @props.height/12*block.height
        widgetFactory: @props.widgetFactory
        widget: block.widget
        )

  renderPlaceholder: (x, y, w, h) ->
    H.div style: { 
      position: "absolute", 
      top: @props.height/12*y
      left: @props.width/12*x
      width: @props.width/12*w
      height: @props.height/12*h
      border: "dashed 3px #DDD"
      borderRadius: 5
      padding: 5
      position: "absolute"
    }

  render: ->
    style = {
      width: @props.width
      height: @props.height
      position: "relative"
    }

    if @state.drag
      snappedX = Math.round(@state.drag.x/@props.width*12)
      snappedY = Math.round(@state.drag.y/@props.height*12)
      if snappedX < 0 then snappedX = 0
      if snappedY < 0 then snappedY = 0

      snapped = @renderPlaceholder(snappedX, snappedY, 3, 2)

    if @state.resize
      snappedX = Math.round(@state.resize.x/@props.width*12)
      snappedY = Math.round(@state.resize.y/@props.height*12)

      snapped = @renderPlaceholder(2, 2, snappedX + 3, snappedY + 2)

    blockElems = _.map @props.blocks, (block) =>
      @renderBlock(block)

    @props.connectDropTarget(
      H.div style: style, 
        blockElems
        snapped
    )

targetSpec = {
  drop: (props, monitor, component) ->
    console.log "DROP"
    component.setState(drag: null, resize: null)
  hover: (props, monitor, component) ->
    if monitor.getItemType() == "widget"
      component.setState(drag: {
        x: monitor.getClientOffset().x - (monitor.getInitialClientOffset().x - monitor.getInitialSourceClientOffset().x)
        y: monitor.getClientOffset().y - (monitor.getInitialClientOffset().y - monitor.getInitialSourceClientOffset().y)
        })
    if monitor.getItemType() == "widget-resize"
      component.setState(resize: {
        x: monitor.getDifferenceFromInitialOffset().x
        y: monitor.getDifferenceFromInitialOffset().y
        })
}

targetCollect = (connect, monitor) ->
  return {
    connectDropTarget: connect.dropTarget()
    isOver: monitor.isOver()
    clientOffset: monitor.getClientOffset()
  }

DropContainer = DropTarget(["widget", "widget-resize"], targetSpec, targetCollect)(Container)


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
        blocks: blocks,
        widgetFactory: widgetFactory)

DragDropRoot = DragDropContext(HTML5Backend)(Root)

$ ->
  sample = React.createElement(DragDropRoot)
  React.render(sample, document.getElementById('root'))
