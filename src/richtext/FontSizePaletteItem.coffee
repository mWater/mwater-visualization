PropTypes = require('prop-types')
React = require 'react'
R = React.createElement
_ = require 'lodash'

ClickOutHandler = require('react-onclickout')

# Palette item that allows picking a size from dropdown
module.exports = class FontSizePaletteItem extends React.Component
  @propTypes:
    onSetSize: PropTypes.func.isRequired  # Called with "125%", etc.
    position: PropTypes.string # should the popup be under or over?

  @defaultProps:
    position: "under"

  constructor: (props) ->
    super(props)
    @state = {
      open: false
    }

  handleMouseDown: (ev) => 
    # Don't lose focus from editor
    ev.preventDefault()
    @setState(open: not @state.open)

  renderSize: (label, value) ->
    R 'div', 
      className: "font-size-palette-menu-item"
      onMouseDown: (ev) => 
        ev.preventDefault()
        @props.onSetSize(value)
        @setState(open: false)
      key: value,
        label

  renderSizes: ->
    R 'div', null,
      @renderSize("Tiny", "50%")
      @renderSize("Small", "66%")
      @renderSize("Normal", "100%")
      @renderSize("Large", "150%")
      @renderSize("Huge", "200%")

  render: ->
    popupPosition = {
      position: 'absolute'
      left: 0
      zIndex: 1000
      backgroundColor: "white"
      border: "solid 1px #AAA"
      borderRadius: 3
    }

    if @props.position == "under"
      popupPosition['top'] = 26
    else 
      popupPosition['bottom'] = 26

    R ClickOutHandler, onClickOut: (=> @setState(open: false)),
      R 'div', 
        className: "mwater-visualization-text-palette-item"
        onMouseDown: @handleMouseDown
        style: { position: "relative" },
          R 'style', null, '''
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
            R 'div', style: popupPosition,
              @renderSizes()

          R 'i', className: "fa fa-arrows-v"


class ColorPaletteComponent extends React.Component
  @propTypes:
    onSetColor: PropTypes.func.isRequired

  renderColor: (color) ->
    R 'td', null,
      R 'div', 
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
    R 'div', style: { padding: 5 },
      R 'table', null,
        R 'tbody', null,
          # Grey shades
          R 'tr', null,
            _.map _.range(0, 8), (i) =>
              @renderColor(Color(r: i * 255 / 7, g: i * 255 / 7, b: i * 255 / 7).hex())
          R 'tr', style: { height: 5 }
          # Base colors
          R 'tr', null,
            _.map baseColors, (c) => @renderColor(c)
          R 'tr', style: { height: 5 }
          R 'tr', null,
            _.map baseColors, (c) => @renderColor(Color(c).lighten(0.7).hex())
          R 'tr', null,
            _.map baseColors, (c) => @renderColor(Color(c).lighten(0.5).hex())
          R 'tr', null,
            _.map baseColors, (c) => @renderColor(Color(c).lighten(0.3).hex())
          R 'tr', null,
            _.map baseColors, (c) => @renderColor(Color(c).darken(0.3).hex())
          R 'tr', null,
            _.map baseColors, (c) => @renderColor(Color(c).darken(0.5).hex())
          R 'tr', null,
            _.map baseColors, (c) => @renderColor(Color(c).darken(0.7).hex())
