React = require 'react'
H = React.DOM
R = React.createElement

ColorSchemeFactory = require '../ColorSchemeFactory'
c_c = require 'color-mixer'
d3 = require 'd3-scale'

module.exports = class ColorPaletteCollectionComponent extends React.Component
  @propTypes:
    onPaletteSelected: React.PropTypes.func.isRequired
    axis: React.PropTypes.object.isRequired
    categories: React.PropTypes.array
    onCancel: React.PropTypes.func.isRequired

  @getColorMapForCategories: (categories, isCategorical = true) ->
    if isCategorical
      type = "schemeAccent"
    else
      type = "interpolateBlues"

    scheme = ColorPaletteCollectionComponent.generateColorSet(type, categories.length - 1)

    _.map categories, (category, i) ->
      {
        value: category.value
        color: if category.value == null then "#aaaaaa" else scheme[i % scheme.length]
      }

  @_collection:
    [
      "schemeSet1"
      "schemeSet2"
      "schemeSet3"
      "schemeAccent"
      "schemeDark2"
      "schemePaired"
      "schemePastel1"
      "schemePastel2"
      "interpolateSpectral"
      "interpolateBlues"
      "interpolateGreens"
      "interpolateGreys"
      "interpolateOranges"
      "interpolatePurples"
      "interpolateReds"
      "interpolateBuGn"
      "interpolateBuPu"
      "interpolateGnBu"
      "interpolateOrRd"
      "interpolatePuBuGn"
      "interpolatePuBu"
      "interpolatePuRd"
      "interpolateRdPu"
      "interpolateYlGnBu"
      "interpolateYlGn"
      "interpolateYlOrBr"
      "interpolateYlOrRd"
      "interpolateBrBG"
      "interpolatePRGn"
      "interpolatePiYG"
      "interpolatePuOr"
      "interpolateRdBu"
      "interpolateRdGy"
      "interpolateRdYlBu"
      "interpolateRdYlGn"
    ]

  @generateColorSet: (type, length) ->
    ColorSchemeFactory.createColorScheme({type: type, number: length})

  onPaletteSelected: (index) =>
    #generate color map
    scheme = ColorPaletteCollectionComponent.generateColorSet(ColorPaletteCollectionComponent._collection[index], @props.categories.length - 1)

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
      _.map ColorPaletteCollectionComponent._collection, (config, index) =>
        R ColorPaletteComponent,
          key: index
          index: index
          colorSet: ColorPaletteCollectionComponent.generateColorSet(config, Math.min(@props.categories.length - 1, 6))
          onPaletteSelected: @onPaletteSelected
          number: @props.categories.length
      @renderCancel()

class ColorPaletteComponent extends React.Component
  @propTypes:
    index: React.PropTypes.number.isRequired
    colorSet: React.PropTypes.array.isRequired
    onPaletteSelected: React.PropTypes.func.isRequired
    number: React.PropTypes.number

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
