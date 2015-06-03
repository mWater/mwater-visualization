React = require 'react'
H = React.DOM
DragSource = require('react-dnd').DragSource
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
    }
    return @props.connectDragSource(
      H.div style: style,
        "Hello!"
      )

spec = {
  beginDrag: (props) -> {}
}

collect = (connect, monitor) ->
  return { connectDragSource: connect.dragSource() }

DragWidget = DragSource("widget", spec, collect)(Widget)

class Container extends React.Component
  render: ->
    style = {
      width: "100%"
      height: 500
      backgroundColor: "#CCC"
    }
    H.div style: style, 
      React.createElement(DragWidget, width: 100, height: 80)

class Root extends React.Component
  render: ->
    H.div null, 
      React.createElement(Container)

DragDropRoot = DragDropContext(HTML5Backend)(Root)

$ ->
  sample = React.createElement(DragDropRoot)
  React.render(sample, document.getElementById('root'))
