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
      borderRadius: 10
      padding: 5
      position: "absolute"
    }

    handleStyle = {
      position: "absolute"
      right: 0
      bottom: 0
      backgroundColor: "green"
      width: 20
      height: 20
    }

    return @props.connectDragSource(
      H.div style: style,
        "Hello!"
        @props.connectResizeSource(
          H.div style: handleStyle
          )
      )

dragSpec = {
  beginDrag: (props) -> { type: "drag" }
}

dragCollect = (connect, monitor) ->
  return { connectDragSource: connect.dragSource() }

DragWidget = DragSource("widget", dragSpec, dragCollect)(Widget)

resizeSpec = {
  beginDrag: (props) -> { type: "resize" }
}

resizeCollect = (connect, monitor) ->
  return { connectResizeSource: connect.dragSource() }

DragResizeWidget = DragSource("widget-resize", resizeSpec, resizeCollect)(DragWidget)

class Container extends React.Component
  constructor: (props) ->
    super
    @state = {}

  renderWidget: (x, y, w, h) ->
    H.div style: { 
      position: "absolute", 
      top: @props.height/12*y
      left: @props.width/12*x },
      React.createElement(DragResizeWidget, 
        width: @props.width/12*w, 
        height: @props.height/12*h)

  renderPlaceholder: (x, y, w, h) ->
    H.div style: { 
      position: "absolute", 
      top: @props.height/12*y
      left: @props.width/12*x
      width: @props.width/12*w
      height: @props.height/12*h
      border: "dashed 3px #DDD"
      borderRadius: 10
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

    console.log @state.resize

    @props.connectDropTarget(
      H.div style: style, 
        if not snapped
          @renderWidget(2,2, 3, 2)
        snapped
    )

targetSpec = {
  drop: (props, monitor, component) ->
    console.log arguments
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
    H.div null, 
      React.createElement(DropContainer, width: 600, height: 400)

DragDropRoot = DragDropContext(HTML5Backend)(Root)

$ ->
  sample = React.createElement(DragDropRoot)
  React.render(sample, document.getElementById('root'))
