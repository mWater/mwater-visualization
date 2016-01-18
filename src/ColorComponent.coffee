React = require 'react'
H = React.DOM

ColorPicker = require("react-color")

# Simple color well with popup
module.exports = class ColorComponent extends React.Component
  @propTypes: 
    color: React.PropTypes.string
    onChange: React.PropTypes.func

  constructor: ->
    super
    @state = { open: false }

  handleClick: =>
    @setState(open: not @state.open)

  handleClose: (color) =>
    @setState(open: false)
    @props.onChange("#" + color.hex)

  render: ->
    style = {
      height: 20
      width: 20
      border: "solid 2px #888"
      borderRadius: 4
      backgroundColor: @props.color
      cursor: "pointer"
      display: "inline-block"
    }

    popupPosition = {
      position: 'absolute'
      top: 0
      left: 30
    }

    H.div style: { position: "relative", display: "inline-block" },
      H.div(style: style, onClick: @handleClick)
      " "
      H.a style: { cursor: "pointer" }, onClick: (=> @props.onChange(null)), "Clear"
      React.createElement(ColorPicker, display: @state.open, positionCSS: popupPosition, onClose: @handleClose)


