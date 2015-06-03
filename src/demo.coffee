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
    return @props.connectDragSource(
      H.div style: style,
        "Hello!"
      )

widgetSpec = {
  beginDrag: (props) -> {}
}

widgetCollect = (connect, monitor) ->
  return { connectDragSource: connect.dragSource() }

DragWidget = DragSource("widget", widgetSpec, widgetCollect)(Widget)

# class GridSquare extends React.Component
#   render: ->
#     console.log "OOPS"
#     @props.connectDropTarget(
#       H.div style: { 
#         position: "absolute", 
#         top: @props.height/12*@props.y
#         left: @props.width/12*@props.x,
#         width: @props.width/12, 
#         height: @props.height/12
#         border: if @props.isOver then "solid 1px #F00" else "solid 1px #EEE"
#         }
#       )

#   componentWillReceiveProps: (nextProps) ->
#     console.log nextProps

# gridSpec = {
#   drop: (props, monitor, component) ->
#     console.log arguments
#   hover: (props, monitor, component) ->
#     console.log monitor.getClientOffset()
# }

# gridCollect = (connect, monitor) ->
#   return {
#     connectDropTarget: connect.dropTarget()
#     isOver: monitor.isOver()
#     clientOffset: monitor.getClientOffset()
#   }

# DropGridSquare = DropTarget("widget", gridSpec, gridCollect)(GridSquare)

class Container extends React.Component
  constructor: (props) ->
    super
    @state = {}

  renderWidget: (x,y) ->
    H.div style: { 
      position: "absolute", 
      top: @props.height/12*y
      left: @props.width/12*x },
      React.createElement(DragWidget, 
        width: @props.width/12*2, 
        height: @props.height/12*2)

  renderPlaceholder: (x,y) ->
    H.div style: { 
      position: "absolute", 
      top: @props.height/12*y
      left: @props.width/12*x
      width: @props.width/12*2
      height: @props.height/12*2
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

    if @state.pos
      snappedX = Math.round(@state.pos.x/@props.width*12)
      snappedY = Math.round(@state.pos.y/@props.height*12)
      if snappedX < 0 then snappedX = 0
      if snappedY < 0 then snappedY = 0

      snapped = @renderPlaceholder(snappedX, snappedY)
    console.log @state
    @props.connectDropTarget(
      H.div style: style, 
        if not snapped
          @renderWidget(2,2)
        snapped
    )

targetSpec = {
  drop: (props, monitor, component) ->
    console.log arguments
    component.setState(pos: null)
  hover: (props, monitor, component) ->
    component.setState(pos: {
      x: monitor.getClientOffset().x - (monitor.getInitialClientOffset().x - monitor.getInitialSourceClientOffset().x)
      y: monitor.getClientOffset().y - (monitor.getInitialClientOffset().y - monitor.getInitialSourceClientOffset().y)
      })
}

targetCollect = (connect, monitor) ->
  return {
    connectDropTarget: connect.dropTarget()
    isOver: monitor.isOver()
    clientOffset: monitor.getClientOffset()
  }

DropContainer = DropTarget("widget", targetSpec, targetCollect)(Container)


class Root extends React.Component
  render: ->
    H.div null, 
      React.createElement(DropContainer, width: 600, height: 400)

DragDropRoot = DragDropContext(HTML5Backend)(Root)

$ ->
  sample = React.createElement(DragDropRoot)
  React.render(sample, document.getElementById('root'))
