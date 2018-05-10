PropTypes = require('prop-types')
React = require 'react'
H = React.DOM
R = React.createElement

ColorSchemeFactory = require '../ColorSchemeFactory'

module.exports = class ColorPaletteCollectionComponent extends React.Component
  @propTypes:
    onPaletteSelected: PropTypes.func.isRequired
    axis: PropTypes.object.isRequired
    categories: PropTypes.array.isRequired
    onCancel: PropTypes.func.isRequired

  @palettes:
    [
      { type: "schemeSet1", reversed: false }
      { type: "schemeSet2", reversed: false }
      { type: "schemeSet3", reversed: false }
      { type: "schemeAccent", reversed: false }
      { type: "schemeDark2", reversed: false }
      { type: "schemePaired", reversed: false }
      { type: "schemePastel1", reversed: false }
      { type: "schemePastel2", reversed: false }
      { type: "interpolateSpectral", reversed: false }
      { type: "interpolateSpectral", reversed: true }
      { type: "interpolateBlues", reversed: false }
      { type: "interpolateBlues", reversed: true }
      { type: "interpolateGreens", reversed: false }
      { type: "interpolateGreens", reversed: true }
      { type: "interpolateGreys", reversed: false }
      { type: "interpolateGreys", reversed: true }
      { type: "interpolateOranges", reversed: false }
      { type: "interpolateOranges", reversed: true }
      { type: "interpolatePurples", reversed: false }
      { type: "interpolatePurples", reversed: true }
      { type: "interpolateReds", reversed: false }
      { type: "interpolateReds", reversed: true }
      { type: "interpolateBuGn", reversed: false }
      { type: "interpolateBuGn", reversed: true }
      { type: "interpolateBuPu", reversed: false }
      { type: "interpolateBuPu", reversed: true }
      { type: "interpolateGnBu", reversed: false }
      { type: "interpolateGnBu", reversed: true }
      { type: "interpolateOrRd", reversed: false }
      { type: "interpolateOrRd", reversed: true }
      { type: "interpolatePuBuGn", reversed: false }
      { type: "interpolatePuBuGn", reversed: true }
      { type: "interpolatePuBu", reversed: false }
      { type: "interpolatePuBu", reversed: true }
      { type: "interpolatePuRd", reversed: false }
      { type: "interpolatePuRd", reversed: true }
      { type: "interpolateRdPu", reversed: false }
      { type: "interpolateRdPu", reversed: true }
      { type: "interpolateYlGnBu", reversed: false }
      { type: "interpolateYlGnBu", reversed: true }
      { type: "interpolateYlGn", reversed: false }
      { type: "interpolateYlGn", reversed: true }
      { type: "interpolateYlOrBr", reversed: false }
      { type: "interpolateYlOrBr", reversed: true }
      { type: "interpolateYlOrRd", reversed: false }
      { type: "interpolateYlOrRd", reversed: true }
      { type: "interpolateBrBG", reversed: false }
      { type: "interpolateBrBG", reversed: true }
      { type: "interpolatePRGn", reversed: false }
      { type: "interpolatePRGn", reversed: true }
      { type: "interpolatePiYG", reversed: false }
      { type: "interpolatePiYG", reversed: true }
      { type: "interpolatePuOr", reversed: false }
      { type: "interpolatePuOr", reversed: true }
      { type: "interpolateRdBu", reversed: false }
      { type: "interpolateRdBu", reversed: true }
      { type: "interpolateRdGy", reversed: false }
      { type: "interpolateRdGy", reversed: true }
      { type: "interpolateRdYlBu", reversed: false }
      { type: "interpolateRdYlBu", reversed: true }
      { type: "interpolateRdYlGn", reversed: false }
      { type: "interpolateRdYlGn", reversed: true }
    ]

  onPaletteSelected: (index) =>
    # Generate color map
    scheme = ColorSchemeFactory.createColorScheme({
      type: ColorPaletteCollectionComponent.palettes[index].type
      # Null doesn't count to length
      number: if _.any(@props.categories, (c) -> not c.value?) then @props.categories.length - 1 else @props.categories.length 
      reversed: ColorPaletteCollectionComponent.palettes[index].reversed
    })

    colorMap = _.map @props.categories, (category, i) ->
      {
        value: category.value
        color: if category.value == null then "#aaaaaa" else scheme[i % scheme.length]
      }
    @props.onPaletteSelected(colorMap)

  renderCancel: =>
    if @props.axis.colorMap
      H.div null,
        H.a style: { cursor: "pointer" }, onClick: @props.onCancel, key: "cancel-customize", "Cancel"

  render: ->
    H.div null,
      H.p null, "Please select a color scheme"
      _.map ColorPaletteCollectionComponent.palettes, (config, index) =>
        R ColorPaletteComponent,
          key: index
          index: index
          colorSet: ColorSchemeFactory.createColorScheme({type: config.type, number: Math.min(@props.categories.length - 1, 6), reversed: config.reversed })
          onPaletteSelected: @onPaletteSelected
          number: @props.categories.length
      @renderCancel()

class ColorPaletteComponent extends React.Component
  @propTypes:
    index: PropTypes.number.isRequired
    colorSet: PropTypes.array.isRequired
    onPaletteSelected: PropTypes.func.isRequired
    number: PropTypes.number

  @defaultProps:
    number: 6

  handleSelect: =>
    @props.onPaletteSelected(@props.index)

  render: ->
    H.div onClick: @handleSelect ,className: "axis-palette",
      _.map @props.colorSet.slice(0,@props.number), (color, i) =>
        cellStyle =
          display: 'inline-block'
          height: 20
          width: 20
          backgroundColor: color
        H.div style: cellStyle, key: i, " "
