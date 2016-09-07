React = require 'react'
H = React.DOM
R = React.createElement

c_c = require 'color-mixer'

module.exports = class ColorPaletteCollectionComponent extends React.Component
  @propTypes:
    onPaletteSelected: React.PropTypes.func.isRequired
    axis: React.PropTypes.object.isRequired
    categories: React.PropTypes.array
    onCancel: React.PropTypes.func.isRequired

  @generateColorFadeScheme: (baseColor, number) ->
    base = new c_c.Color(baseColor)
    _.map  base.darken_set(number), (subcolor, i) ->
      subcolor.hex()

  @getColorMapForCategories: (categories, isCategorical = true) ->
    if isCategorical
      scheme = @categoricalColorSet[0]
    else
      scheme = ColorPaletteCollectionComponent.generateColorFadeScheme({ hex: @colorFadesSet[0][0]}, categories.length)
    _.map categories, (category, i) ->
      {
      value: category.value
      color: if category.value == null then "#aaaaaa" else scheme[i % scheme.length]
      }

  @categoricalColorSet:
    [
      ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]
      ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"]
      ["#9c9ede", "#7375b5", "#4a5584", "#cedb9c", "#b5cf6b", "#8ca252", "#637939", "#e7cb94", "#e7ba52", "#bd9e39", "#8c6d31", "#e7969c", "#d6616b", "#ad494a", "#843c39", "#de9ed6", "#ce6dbd", "#a55194", "#7b4173"]
    ]

  @colorFadesSet:
    [
      @generateColorFadeScheme({hex:'#D49097'}, 6) #red
      @generateColorFadeScheme({hex:'#C1CCE6'}, 6)
      @generateColorFadeScheme({hex:'#C8E6C1'}, 6)
      @generateColorFadeScheme({hex:'#E6D6C1'}, 6)
      @generateColorFadeScheme({hex:'#C1E6E6'}, 6)
      @generateColorFadeScheme({hex:'#DFC1E6'}, 6)
    ]

  @collection:
    @categoricalColorSet.concat(@colorFadesSet)

  onPaletteSelected: (index) =>
    #generate color map
    scheme = ColorPaletteCollectionComponent.collection[index]

    if index > 2
      scheme = ColorPaletteCollectionComponent.generateColorFadeScheme({ hex: scheme[0]}, @props.categories.length)

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
      _.map ColorPaletteCollectionComponent.collection, (collection, index) =>
        R ColorPaletteComponent,
          key: index
          index: index
          colorSet: collection
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
      _.map @props.colorSet.slice(0,Math.min(@props.number, 6)), (color, i) =>
        cellStyle =
          display: 'inline-block'
          height: 20
          width: 20
          backgroundColor: color
        H.div style: cellStyle, key: i, " "