React = require 'react'
H = React.DOM

ColorPicker = require('react-color')

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
      height: 30
      width: 30
      border: "solid 2px #888"
      borderRadius: 4
      backgroundColor: @props.color
    }

    popupPosition = {
      position: 'absolute'
      top: 0
      left: 30
    }

    H.div style: { position: "relative" },
      H.div(style: style, onClick: @handleClick)
      React.createElement(ColorPicker, display: @state.open, positionCSS: popupPosition, onClose: @handleClose)


