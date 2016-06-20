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

    if not @props.color
      # http://lea.verou.me/css3patterns/#diagonal-stripes
      style.backgroundColor = "#AAA"
      style.backgroundImage = "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,.7) 2px, rgba(255,255,255,.7) 4px)"

    popupPosition = {
      position: 'absolute'
      top: 0
      left: 30
      zIndex: 1000
      backgroundColor: "white"
      border: "solid 1px #DDD"
      borderRadius: 3
    }

    H.div style: { position: "relative", display: "inline-block" },
      H.div(style: style, onClick: @handleClick)
      if @state.open
        H.div style: popupPosition,
          H.button type: "button", className: "btn btn-link btn-sm", onClick: (=> @props.onChange(null)),
            H.span className: "glyphicon glyphicon-remove"
            " Reset Color"
          React.createElement(SketchPicker, type: "sketch", color: @props.color or undefined, onChangeComplete: @handleClose)


