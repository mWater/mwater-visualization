React = require 'react'
H = React.DOM

SketchPicker = require("react-color").SketchPicker

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
    @props.onChange(color.hex)

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
      zIndex: 1000
    }

    H.div style: { position: "relative", display: "inline-block" },
      if @props.color? 
        H.div null,
          H.div(style: style, onClick: @handleClick)
          " ",
          H.a style: { cursor: "pointer" }, onClick: (=> @props.onChange(null)), "Reset"
      else
        H.a style: { cursor: "pointer"}, onClick: @handleClick, "Customize"
      if @state.open
        H.div style: popupPosition,
          React.createElement(SketchPicker, type: "sketch", color: @props.color or undefined, onChangeComplete: @handleClose)


