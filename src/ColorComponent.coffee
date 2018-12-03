PropTypes = require('prop-types')
React = require 'react'
R = React.createElement

ClickOutHandler = require('react-onclickout')
SketchPicker = require("react-color").SketchPicker
SwatchesPicker = require('react-color').SwatchesPicker

# Simple color well with popup
module.exports = class ColorComponent extends React.Component
  @propTypes: 
    color: PropTypes.string
    onChange: PropTypes.func

  constructor: (props) ->
    super(props)
    @state = { open: false, advanced: false }

  handleClick: =>
    @setState(open: not @state.open, advanced: false)

  handleClose: (color) =>
    @props.onChange(color.hex)

  handleReset: =>
    @setState(open: false)
    @props.onChange(null)

  handleTransparent: =>
    @setState(open: false)
    @props.onChange("transparent")

  handleAdvanced: =>
    @setState(advanced: not @state.advanced)

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

    R 'div', style: { position: "relative", display: "inline-block" },
      R('div', style: style, onClick: @handleClick)
      if @state.open
        React.createElement ClickOutHandler, onClickOut: (=> @setState(open: false)),
          R 'div', style: popupPosition,
            R 'button', type: "button", className: "btn btn-link btn-sm", onClick: @handleReset,
              R 'i', className: "fa fa-undo"
              " Reset Color"
            # R 'button', type: "button", className: "btn btn-link btn-sm", onClick: @handleTransparent,
            #   R 'i', className: "fa fa-ban"
            #   " None"
            R 'button', type: "button", className: "btn btn-link btn-sm", onClick: @handleAdvanced,
              if @state.advanced then "Basic" else "Advanced"
              
            if @state.advanced
              React.createElement(SketchPicker, color: @props.color or undefined, disableAlpha: true, onChangeComplete: @handleClose)
            else
              React.createElement(SwatchesPicker, color: @props.color or undefined, onChangeComplete: @handleClose)


