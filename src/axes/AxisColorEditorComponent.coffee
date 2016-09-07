_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
ColorMapComponent = require './ColorMapComponent'
ColorPaletteCollectionComponent = require './ColorPaletteCollectionComponent'
update = require 'update-object'
AxisBuilder = require './AxisBuilder'
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
