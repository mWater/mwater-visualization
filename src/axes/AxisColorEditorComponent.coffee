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
d3 = require 'd3-scale'

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
    @setState(mode: "normal")

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
              H.a 
                style: { fontSize: 12, cursor: "pointer", paddingTop: 5, display: "inline-block", verticalAlign: "top" }
                onClick: @handleCustomizePalette
                key: "customize-palette", 
                  "Customize these colors"

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

  @generatePolyLinearScheme: (startColor, midColor, endColor, number) ->
    color = d3.scaleLinear().domain([-parseInt(number/2),0,parseInt(number/2)]).range([startColor, midColor, endColor])
    colors = (color i for i in [(-parseInt(number/2))..parseInt((number/2))])

    _.map colors, (rgb) =>
      rgbArray = rgb.substring(4,rgb.length-1).split(',').map((item) -> parseInt(item))
      _color = new c_c.Color({rgb: rgbArray})
      _color.hex()

  @generateLinearScheme: (startColor, endColor, number) ->
    color = d3.scaleLinear().domain([0,number]).range([startColor, endColor])
    colors = (color i for i in [0..number])

    _.map colors, (rgb) =>
      rgbArray = rgb.substring(4,rgb.length-1).split(',').map((item) -> parseInt(item))
      _color = new c_c.Color({rgb: rgbArray})
      _color.hex()

  @getColorMapForCategories: (categories, isCategorical = true) ->
    if isCategorical
      config = _.find(ColorPaletteCollectionComponent._collection, {type: 'static'})
    else
      config = _.find(ColorPaletteCollectionComponent._collection, (item) -> item.type != "static" )

    console.log config
    scheme = ColorPaletteCollectionComponent.generateColorSet(config, categories.length)

    _.map categories, (category, i) ->
      {
        value: category.value
        color: if category.value == null then "#aaaaaa" else scheme[i % scheme.length]
      }

  @_collection:
    [
      {
        type: "static"
        set: ["#2ca02c", "#1f77b4", "#ff7f0e", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]
      }
      {
        type: "static"
        set: ["#ff7f0e", "#1f77b4", "#aec7e8", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"]
      }
      {
        type: "static"
        set: ["#9c9ede", "#7375b5", "#4a5584", "#cedb9c", "#b5cf6b", "#8ca252", "#637939", "#e7cb94", "#e7ba52", "#bd9e39", "#8c6d31", "#e7969c", "#d6616b", "#ad494a", "#843c39", "#de9ed6", "#ce6dbd", "#a55194", "#7b4173"]
      }
      {
        type: "poly-linear"
        args: ['red','yellow','green']
      }
      {
        type: "poly-linear"
        args: ['green','yellow','red']
      }
      {
        type: "fade"
        args: [{hex:'#D49097'}]
      }
      {
        type: "fade"
        args: [{hex:'#C1CCE6'}]
      }
      {
        type: "fade"
        args: [{hex:'#C8E6C1'}]
      }
      {
        type: "fade"
        args: [{hex:'#E6D6C1'}]
      }
      {
        type: "fade"
        args: [{hex:'#C1E6E6'}]
      }
      {
        type: "fade"
        args: [{hex:'#DFC1E6'}]
      }
    ]

  @generateColorSet: (config, length) ->
    switch config.type
      when "fade" then ColorPaletteCollectionComponent.generateColorFadeScheme.apply(undefined , config.args.concat(length))
      when "poly-linear" then ColorPaletteCollectionComponent.generatePolyLinearScheme.apply(undefined , config.args.concat(length))
      when "linear" then ColorPaletteCollectionComponent.generateLinearScheme.apply(undefined , config.args.concat(length))
      else
        if not config.set
          throw("Color set which is not fade or poly-linear must have a 'set' property")
        (config.set[i % config.set.length ] for i in [0..length])


  onPaletteSelected: (index) =>
    #generate color map
    scheme = ColorPaletteCollectionComponent.generateColorSet(ColorPaletteCollectionComponent._collection[index], @props.categories.length)

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
          colorSet: ColorPaletteCollectionComponent.generateColorSet(config, 6)
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