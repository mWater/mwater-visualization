PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement
CategoryMapComponent = require './CategoryMapComponent'
ColorSchemeFactory = require '../ColorSchemeFactory'
ColorPaletteCollectionComponent = require './ColorPaletteCollectionComponent'
update = require 'update-object'
AxisBuilder = require './AxisBuilder'

# Color editor for axis. Allows switching between editing individial colors (using CategoryMapComponent) 
# and setting the colors from a palette (using ColorPaletteCollectionComponent)
module.exports = class AxisColorEditorComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired
    axis: PropTypes.object.isRequired
    onChange: PropTypes.func.isRequired # Called with new axis
    categories: PropTypes.array # Categories of the axis
    reorderable: PropTypes.bool # is the color map reorderable
    defaultColor: PropTypes.string
    allowExcludedValues: PropTypes.bool # True to allow excluding of values via checkboxes
    initiallyExpanded: PropTypes.bool  # True to start values expanded
    autosetColors: PropTypes.bool      # True to automatically set the colors if blank

  @defaultProps:
    reorderable: false
    autosetColors: true

  constructor: (props) ->
    super(props)

    @state = {
      mode: "normal"
    }

  componentWillMount: ->
    @updateColorMap()

  componentDidUpdate: ->
    @updateColorMap()

  # Update color map if categories no longer match
  updateColorMap: ->
    axisBuilder = new AxisBuilder(schema: @props.schema)

    # If no categories, can't do anything
    if not @props.categories
      return

    # If no color map or color map values have changed
    if not @props.axis.colorMap or not _.isEqual(_.pluck(@props.axis.colorMap, "value").sort(), _.pluck(@props.categories, "value").sort())
      if @props.autosetColors
        colorMap = ColorSchemeFactory.createColorMapForCategories(@props.categories, axisBuilder.isCategorical(@props.axis))
      else 
        # Keep existing 
        existing = _.indexBy(@props.axis.colorMap or [], "value")
        colorMap = _.map @props.categories, (category, i) ->
          {
            value: category.value
            color: if existing[category.value] then existing[category.value].color else null
          }
      
      @handlePaletteChange(colorMap)
      @setState(mode: "normal")

  handleSelectPalette: =>
    @setState(mode: "palette")

  handleResetPalette: =>
    # Completely reset
    colorMap = _.map @props.categories, (category, i) ->
      {
        value: category.value
        color: null
      }
      
    @handlePaletteChange(colorMap)
    @setState(mode: "normal")

  handlePaletteChange: (palette) =>
    @props.onChange(update(@props.axis, { colorMap: { $set: palette }, drawOrder: { $set: _.pluck(palette, "value") }}))
    @setState(mode: "normal")

  handleCancelCustomize: =>
    @setState(mode: "normal")

  renderPreview: ->
    R 'div', className: "axis-palette",
      _.map @props.categories.slice(0,6), (category, i) =>
        color = _.find(@props.axis.colorMap, {value: category.value})
        cellStyle =
          display: 'inline-block'
          height: 20
          width: 20
          backgroundColor: if color then color.color else @props.defaultColor
        R 'div', style: cellStyle, key: i, " "

  render: ->
    R 'div', null,
      if @state.mode == "palette"
        if @props.categories
          R ColorPaletteCollectionComponent, {
            onPaletteSelected: @handlePaletteChange
            axis: @props.axis
            categories: @props.categories
            onCancel: @handleCancelCustomize
          }
      if @state.mode == "normal"
        R 'div', null,
          R 'p', null,
            R 'a', style: { cursor: "pointer" }, onClick: @handleSelectPalette, key: "select-palette", "Change color scheme"
            if not @props.autosetColors
              R 'a', style: { cursor: "pointer", marginLeft: 10 }, onClick: @handleResetPalette, key: "reset-palette", "Reset colors"
          if @props.axis.colorMap
            R 'div', key: "selected-palette",
              R 'div', null,
                R CategoryMapComponent,
                  schema: @props.schema
                  axis: @props.axis
                  onChange: @props.onChange
                  categories: @props.categories
                  key: "colorMap"
                  reorderable: @props.reorderable
                  allowExcludedValues: @props.allowExcludedValues
                  showColorMap: true
                  initiallyExpanded: @props.initiallyExpanded

