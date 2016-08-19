React = require 'react'
H = React.DOM

ClickOutHandler = require('react-onclickout')
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

  handleReset: =>
    @setState(open: false)
    @props.onChange(null)

  handleTransparent: =>
    @setState(open: false)
    @props.onChange("transparent")

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
        React.createElement ClickOutHandler, onClickOut: (=> @setState(open: false)),
          H.div style: popupPosition,
            H.button type: "button", className: "btn btn-link btn-sm", onClick: @handleReset,
              H.i className: "fa fa-undo"
              " Reset Color"
            H.button type: "button", className: "btn btn-link btn-sm", onClick: @handleTransparent,
              H.i className: "fa fa-ban"
              " Transparent"
            React.createElement(SketchPicker, type: "sketch", color: @props.color or undefined, onChangeComplete: @handleClose)


