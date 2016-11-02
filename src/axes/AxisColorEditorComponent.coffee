_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
CategoryMapComponent = require './CategoryMapComponent'
ColorPaletteCollectionComponent = require './ColorPaletteCollectionComponent'
update = require 'update-object'
AxisBuilder = require './AxisBuilder'
AsyncLoadComponent = require 'react-library/lib/AsyncLoadComponent'

# Color editor for axis
module.exports = class AxisColorEditorComponent extends AsyncLoadComponent
  @propTypes:
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired
    axis: React.PropTypes.object.isRequired
    onChange: React.PropTypes.func.isRequired # Called with new axis
    colorMapOptional: React.PropTypes.bool # is colorMap optional
    colorMapReorderable: React.PropTypes.bool # is the color map reorderable
    defaultColor: React.PropTypes.string
    table: React.PropTypes.string.isRequired # Table to use
    types: React.PropTypes.array # Optional types to limit to
    aggrNeed: React.PropTypes.oneOf(['none', 'optional', 'required']).isRequired
    allowExcludedValues: React.PropTypes.bool # True to allow excluding of values via checkboxes

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

      if not props.axis.colorMap or !_.isEqual(_.pluck(props.axis.colorMap, "value").sort(), _.pluck(categories, "value").sort())
        colorMap = ColorPaletteCollectionComponent.getColorMapForCategories(categories, axisBuilder.isCategorical(props.axis))
        @handlePaletteChange(colorMap)
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

      if not props.axis.colorMap or !_.isEqual(_.pluck(props.axis.colorMap, "value").sort(), _.pluck(categories, "value").sort())
        colorMap = ColorPaletteCollectionComponent.getColorMapForCategories(categories, axisBuilder.isCategorical(axis))
        @handlePaletteChange(colorMap)
        newState.mode = "normal"
      callback(newState)
    )

  componentWillUnmount: ->
    @unmounted = true

  handleSelectPalette: =>
    @setState(mode: "palette")

  handlePaletteChange: (palette) =>
    @props.onChange(update(@props.axis, { colorMap: { $set: palette }, drawOrder: { $set: _.pluck(palette, "value") }}))
    @setState(mode: "normal")

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
    H.div null,
      if @state.mode == "palette"
        if @state.loading
          H.span null, "Loading..."
        else
          R ColorPaletteCollectionComponent, {
            onPaletteSelected: @handlePaletteChange
            axis: @props.axis
            categories: @state.categories
            onCancel: @handleCancelCustomize
          }
      if @state.mode == "normal"
        H.div null,
          H.p null,
            H.a style: { cursor: "pointer" }, onClick: @handleSelectPalette, key: "select-palette", "Change color scheme"
          if @props.axis.colorMap
            H.div key: "selected-palette",
              H.div null,
                R CategoryMapComponent,
                  schema: @props.schema
                  dataSource: @props.dataSource
                  axis: @props.axis
                  onChange: @props.onChange
                  categories: @state.categories
                  key: "colorMap"
                  reorderable: @props.colorMapReorderable
                  allowExcludedValues: @props.allowExcludedValues
                  showColorMap: true
