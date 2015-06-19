React = require 'react'
H = React.DOM
LegoLayoutEngine = require './LegoLayoutEngine'
DragDropContainer = require './DragDropContainer'

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
    layoutEngine = new LegoLayoutEngine(600, 12)

    # Create elems
    elems = _.map(@state.blocks, (block) => React.createElement(Widget, text: block.contents))

    H.div null, 
      React.createElement(DragDropContainer, 
        layoutEngine: layoutEngine
        blocks: @state.blocks
        elems: elems
        onLayoutUpdate: @handleLayoutUpdate
        width: 600, 
        height: 400)

$ ->
  sample = React.createElement(Root)
  React.render(sample, document.getElementById('root'))
