React = require 'react'
H = React.DOM
Draggable = require 'react-draggable'

module.exports = class FloatingWindowComponent extends React.Component
  @propTypes:
    initialBounds: React.PropTypes.object.isRequired  # x, y, width, height
    title: React.PropTypes.string

  constructor: (props) ->
    super
    @state = { x: 10, y: 10, width: 500, height: 700 }

  render: ->
    windowStyle = {
      width: @state.width
      height: @state.height
      borderRadius: 10
      border: "solid 1px #aaa"
      backgroundColor: "#FFF"
      boxShadow: "5px 5px 12px 0px rgba(0,0,0,0.5)"
      position: "absolute"
      left: @state.x
      top: @state.y
    }

    headerStyle = {
      height: 30
      backgroundColor: "#DDD"
      padding: 5
      textAlign: "center"
      borderBottom: "solid 1px #AAA"
      borderTopLeftRadius: 10
      borderTopRightRadius: 10
      fontWeight: "bold"
    }

    contentsStyle = {
      overflowY: "auto"
      padding: 10  
      height: @state.height - 35
    }

    React.createElement(Draggable, {},
      H.div style: windowStyle,
        H.div style: headerStyle,
          @props.title
        H.div style: contentsStyle,
          @props.children
    )