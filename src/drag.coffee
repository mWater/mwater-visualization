React = require 'react'
H = React.DOM
LegoLayoutEngine = require './LegoLayoutEngine'
DragDropContainer = require './DragDropContainer'
BarChartViewComponent = require './BarChartViewComponent'

data = [{"x":"broken","y":"48520"},{"x":null,"y":"2976"},{"x":"ok","y":"173396"},{"x":"maint","y":"12103"},{"x":"missing","y":"3364"}]

class Widget extends React.Component
  render: ->
    style = {
      width: @props.width
      height: @props.height
      border: "solid 2px #35A"
      backgroundColor: "white"
      borderRadius: 3
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

    myData = _.cloneDeep(data)
    myData[0].y = @props.data
    return @props.connectMoveHandle(
      H.div style: style,
        React.createElement(BarChartViewComponent, width: @props.width - 10, height: @props.height - 10, data: myData)
        # "#{@props.text}"
        @props.connectResizeHandle(
          H.div style: resizeHandleStyle
          )
      )

class Root extends React.Component
  constructor: ->
    super
    @state = {
      blocks: [
        { contents: 40000, layout: { x: 0, y: 0, w: 4, h: 3 } }
        { contents: 80000, layout: { x: 4, y: 0, w: 4, h: 3 } }
        { contents: 120000, layout: { x: 8, y: 0, w: 4, h: 3 } }
      ] 
    }

  handleLayoutUpdate: (blocks) =>
    @setState(blocks: blocks)

  render: ->
    layoutEngine = new LegoLayoutEngine(800, 12)

    # Create elems
    elems = _.map(@state.blocks, (block) => React.createElement(Widget, data: block.contents))

    H.div style: { backgroundColor: "#CCC", width: 800 }, 
      React.createElement(DragDropContainer, 
        layoutEngine: layoutEngine
        blocks: @state.blocks
        elems: elems
        onLayoutUpdate: @handleLayoutUpdate
        width: 800, 
        height: 600)

$ ->
  sample = React.createElement(Root)
  React.render(sample, document.getElementById('root'))
