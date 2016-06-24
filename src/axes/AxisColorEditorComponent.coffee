_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
ColorMapComponent = require './ColorMapComponent'
update = require 'update-object'
AxisBuilder = require './AxisBuilder'

# color editor for axis
module.exports = class AxisColorEditorComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    axis: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired

  constructor: ->
    super
    @state = {
      mode: if @props.axis.colorMap then "normal" else "palette"
      categories: null
    }

  componentDidMount: ->
    @loadCategories(@props)

  componentWillReceiveProps: (nextProps) ->
    if not _.isEqual(nextProps.axis, @props.axis)
      @loadCategories(nextProps)

  loadCategories: (props) ->
    axisBuilder = new AxisBuilder(schema: props.schema)

    # Get categories (value + label)
    categories = axisBuilder.getCategories(props.axis)
    if categories.length > 0
      @setState(categories: categories)
      return

  handleCustomizePalette: =>
    console.log "Customize palette"
    @setState(mode: "customize")

  handleSelectPalette: =>
    console.log "Select a palette"
    @setState(mode: "palette")

  onPaletteChange: (palette) =>
    @props.onChange(update(@props.axis, { colorMap: { $set: palette }}))
    @setState(mode: "normal")

  handleCancelCustomize: =>
    @setState(mode: "normal")

  render: ->
    H.div null,
      if @state.mode == "palette"
        R ColorPaletteCollectionComponent, {
          onPaletteSelected: @onPaletteChange
          axis: @props.axis
          categories: @state.categories
          onCancel: @handleCancelCustomize
        }
      if @state.mode == "customize"
        [
          R ColorMapComponent,
            schema: @props.schema
            dataSource: @props.dataSource
            axis: @props.axis
            onChange: @props.onChange
            key: "colormap"
          H.a onClick: @handleCancelCustomize, key: "calcel-customize", "Close"
        ]
      if @state.mode == "normal"
        [
          H.div key: "selected-palette",
            H.div className: "axis-palette",
            _.map @props.axis.colorMap.slice(0,6), (map, i) =>
              cellStyle =
                display: 'inline-block'
                height: 20
                width: 20
                backgroundColor: map.color
              H.div style: cellStyle, key: i, " "
          H.a onClick: @handleCustomizePalette, key: "customize-palette", style: {marginRight: 10}, "Customize palette"
          H.a onClick: @handleSelectPalette, key: "select-palette", "Select palette"
        ]


class ColorPaletteCollectionComponent extends React.Component
  @propTypes:
    onPaletteSelected: React.PropTypes.func.isRequired
    axis: React.PropTypes.object.isRequired
    categories: React.PropTypes.array
    onCancel: React.PropTypes.func.isRequired

  @defaultProps:
    collection: [
      ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]
      ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"]
      ["#9c9ede", "#7375b5", "#4a5584", "#cedb9c", "#b5cf6b", "#8ca252", "#637939", "#e7cb94", "#e7ba52", "#bd9e39", "#8c6d31", "#e7969c", "#d6616b", "#ad494a", "#843c39", "#de9ed6", "#ce6dbd", "#a55194", "#7b4173"]
    ]

  onPaletteSelected: (index) =>
    #generate color map
    scheme = @props.collection[index]
    colormap = _.map @props.categories, (category, i) ->
      {
        value: category.value
        color: scheme[i]
      }
    @props.onPaletteSelected(colormap)

  renderCancel: =>
    if @props.axis.colorMap
      H.a onClick: @props.onCancel, key: "calcel-customize", "Close"

  render: ->
    H.div null,
      _.map @props.collection, (collection, index) =>
        R ColorPaletteComponent,
          key: index
          index: index
          colorSet: collection
          onPaletteSelected: @onPaletteSelected
      @renderCancel

class ColorPaletteComponent extends React.Component
  @propTypes:
    index: React.PropTypes.number.isRequired
    onPaletteSelected: React.PropTypes.func.isRequired
    colorSet: React.PropTypes.array.isRequired

  handlePaletteSelect: =>
    @props.onPaletteSelected(@props.index)

  render: ->
    H.div onClick: @handlePaletteSelect, className: "axis-palette",
      _.map @props.colorSet.slice(0,6), (color, i) =>
        cellStyle =
          display: 'inline-block'
          height: 20
          width: 20
          backgroundColor: color
        H.div style: cellStyle, key: i, " "