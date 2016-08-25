_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
ColorMapComponent = require './ColorMapComponent'
update = require 'update-object'
AxisBuilder = require './AxisBuilder'
c_c = require 'color-mixer'
ColorMapOrderEditorComponent = require './ColorMapOrderEditorComponent'
AsyncLoadComponent = require 'react-library/lib/AsyncLoadComponent'

# color editor for axis
module.exports = class AxisColorEditorComponent extends AsyncLoadComponent
  @propTypes:
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    axis: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired
    colorMapOptional: React.PropTypes.bool # is colorMap optional
    colorMapReorderable: React.PropTypes.bool # is the color map reorderable
    defaultColor: React.PropTypes.string
    table: React.PropTypes.string.isRequired # Table to use
    types: React.PropTypes.array # Optional types to limit to
    aggrNeed: React.PropTypes.oneOf(['none', 'optional', 'required']).isRequired

  @defaultProps:
    colorMapOptional: false
    colorMapReorderable: false

  constructor: (props) ->
    super(props)
    @state = {
      error: null
      mode: if props.axis.colorMap or props.colorMapOptional then "normal" else "palette"
      categories: []
    }

  componentWillReceiveProps: (nextProps) ->
    super(nextProps)
    if not @state.mode == "customize"
      @setState(mode: if nextProps.axis.colorMap or nextProps.colorMapOptional then "normal" else "palette")

  isLoadNeeded: (newProps, oldProps) ->
    return not _.isEqual(_.omit(newProps.axis, ["colorMap", "drawOrder"]), _.omit(oldProps.axis, ["colorMap", "drawOrder"]))

  load: (props, prevProps, callback) ->
    axisBuilder = new AxisBuilder(schema: props.schema)

    # Get categories (value + label)
    categories = axisBuilder.getCategories(props.axis)
    if categories.length > 1
      newState =
        categories: categories

      if not props.axis.colorMap
        colorMap = ColorPaletteCollectionComponent.getColorMapForCategories(categories, axisBuilder.isCategorical(props.axis))
        @onPaletteChange(colorMap)
        newState.mode = "normal"
      callback(newState)
      return

    # Check for axis
    axis = axisBuilder.cleanAxis(axis: props.axis, table: @props.table, types: @props.types, aggrNeed: @props.aggrNeed)
    # Ignore if error
    if not axis or axisBuilder.validateAxis(axis: axis)
      return

    # Can't get values of aggregate axis
    if axisBuilder.isAxisAggr(axis)
      return

    axisCompiledExpr = axisBuilder.compileAxis(axis: axis, tableAlias: "main")

    # If no categories, we need values as input
    valuesQuery = {
      type: "query"
      selects: [
        { type: "select", expr: axisCompiledExpr, alias: "val" }
      ]
      from: { type: "table", table: axis.expr.table, alias: "main" }
      groupBy: [1]
      limit: 50
    }

    props.dataSource.performQuery(valuesQuery, (error, rows) =>
      if @unmounted
        return

      if error
        return # Ignore

      # Get categories (value + label)
      categories = axisBuilder.getCategories(props.axis, _.pluck(rows, "val"))
      newState =
        categories: categories

      if not props.axis.colorMap
        colorMap = ColorPaletteCollectionComponent.getColorMapForCategories(categories, axisBuilder.isCategorical(axis))
        @onPaletteChange(colorMap)
        newState.mode = "normal"
      callback(newState)
    )

  componentWillUnmount: ->
    @unmounted = true

  handleCustomizePalette: =>
    @setState(mode: "customize")

  handleSelectPalette: =>
    @setState(mode: "palette")

  onPaletteChange: (palette) =>
    @props.onChange(update(@props.axis, { colorMap: { $set: palette }, drawOrder: { $set: _.pluck(palette, "value") }}))

  handleDrawOrderChange: (order) =>
    @props.onChange(update(@props.axis, { drawOrder: { $set: order }}))

  handleCancelCustomize: =>
    @setState(mode: "normal")

  renderPreview: ->
    H.div className: "axis-palette",
      _.map @state.categories.slice(0,6), (category, i) =>
        color = _.find(@props.axis.colorMap, {value: category.value})
        cellStyle =
          display: 'inline-block'
          height: 20
          width: 20
          backgroundColor: if color then color.color else @props.defaultColor
        H.div style: cellStyle, key: i, " "

  render: ->
    drawOrder = @props.axis.drawOrder or _.pluck(@props.axis.colorMap, "value")

    H.div null,
      if @state.mode == "palette"
        if @state.loading
          H.span null, "Loading..."
        else
          R ColorPaletteCollectionComponent, {
            onPaletteSelected: @onPaletteChange
            axis: @props.axis
            categories: @state.categories
            onCancel: @handleCancelCustomize
          }
      if @state.mode == "customize"
        H.div null,
          R ColorMapComponent,
            schema: @props.schema
            dataSource: @props.dataSource
            axis: @props.axis
            onChange: @props.onChange
            categories: @state.categories
            key: "colorMap"
          H.a style: { cursor: "pointer" }, onClick: @handleCancelCustomize, key: "cancel-customize", "Close"

      if @state.mode == "normal"
        H.div null,
          H.p null,
            H.a style: { cursor: "pointer" }, onClick: @handleSelectPalette, key: "select-palette", "Change color scheme"
          if @props.axis.colorMap
            H.div key: "selected-palette",
              @renderPreview()
              H.p style: {fontSize: 12},
                H.a style: { cursor: "pointer" }, onClick: @handleCustomizePalette, key: "customize-palette", style: {marginRight: 10}, "Choose colors manually"

          if drawOrder and @props.colorMapReorderable
            R ColorMapOrderEditorComponent,
              colorMap: @props.axis.colorMap
              order: drawOrder
              categories: @state.categories
              defaultColor: @props.defaultColor
              onChange: @handleDrawOrderChange


class ColorPaletteCollectionComponent extends React.Component
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