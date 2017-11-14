PropTypes = require('prop-types')
React = require 'react'
H = React.DOM
R = React.createElement
_ = require 'lodash'

ClickOutHandler = require('react-onclickout')

# Palette item that allows picking a size from dropdown
module.exports = class FontSizePaletteItem extends React.Component
  @propTypes:
    onSetSize: PropTypes.func.isRequired  # Called with "125%", etc.

  constructor: ->
    super
    @state = {
      open: false
    }

  handleMouseDown: (ev) => 
    # Don't lose focus from editor
    ev.preventDefault()
    @setState(open: not @state.open)

  renderSize: (label, value) ->
    H.div 
      className: "font-size-palette-menu-item"
      onMouseDown: (ev) => 
        ev.preventDefault()
        @props.onSetSize(value)
        @setState(open: false)
      key: value,
        label

  renderSizes: ->
    H.div null,
      @renderSize("Tiny", "50%")
      @renderSize("Small", "66%")
      @renderSize("Normal", "100%")
      @renderSize("Large", "150%")
      @renderSize("Huge", "200%")

  render: ->
    popupPosition = {
      position: 'absolute'
      top: 26
      left: 0
      zIndex: 1000
      backgroundColor: "white"
      border: "solid 1px #AAA"
      borderRadius: 3
    }

    R ClickOutHandler, onClickOut: (=> @setState(open: false)),
      H.div 
        className: "mwater-visualization-text-palette-item"
        onMouseDown: @handleMouseDown
        style: { position: "relative" },
          H.style null, '''
          .font-size-palette-menu-item {
            color: black;
            background-color: white;
            text-align: left;
            padding: 5px 15px 5px 15px;
            cursor: pointer;
          }
          .font-size-palette-menu-item:hover {
            background-color: #DDD;
          }
          '''
          if @state.open
            H.div style: popupPosition,
              @renderSizes()

          H.i className: "fa fa-arrows-v"


class ColorPaletteComponent extends React.Component
  @propTypes:
    onSetColor: PropTypes.func.isRequired

  renderColor: (color) ->
    H.td null,
      H.div 
        style: { width: 16, height: 15, backgroundColor: color, margin: 1 }
        onMouseDown: (ev) =>
          ev.preventDefault()
          @props.onSetColor.bind(null, color)

  render: ->
    baseColors = [
      "#FF0000" # red
      "#FFAA00" # orange
      "#FFFF00" # yellow
      "#00FF00" # green
      "#00FFFF" # cyan
      "#0000FF" # blue
      "#9900FF" # purple
      "#FF00FF" # magenta
    ]
    H.div style: { padding: 5 },
      H.table null,
        H.tbody null,
          # Grey shades
          H.tr null,
            _.map _.range(0, 8), (i) =>
              @renderColor(Color(r: i * 255 / 7, g: i * 255 / 7, b: i * 255 / 7).hex())
          H.tr style: { height: 5 }
          # Base colors
          H.tr null,
            _.map baseColors, (c) => @renderColor(c)
          H.tr style: { height: 5 }
          H.tr null,
            _.map baseColors, (c) => @renderColor(Color(c).lighten(0.7).hex())
          H.tr null,
            _.map baseColors, (c) => @renderColor(Color(c).lighten(0.5).hex())
          H.tr null,
            _.map baseColors, (c) => @renderColor(Color(c).lighten(0.3).hex())
          H.tr null,
            _.map baseColors, (c) => @renderColor(Color(c).darken(0.3).hex())
          H.tr null,
            _.map baseColors, (c) => @renderColor(Color(c).darken(0.5).hex())
          H.tr null,
            _.map baseColors, (c) => @renderColor(Color(c).darken(0.7).hex())
