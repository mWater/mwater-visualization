PropTypes = require('prop-types')
React = require 'react'
_ = require 'lodash'
R = React.createElement
AxisBuilder = require '../axes/AxisBuilder'
LegendGroup = require('./LegendGroup')
ExprUtils = require('mwater-expressions').ExprUtils
injectTableAlias = require('mwater-expressions').injectTableAlias

# wraps the legends for a layer
module.exports = class LayerLegendComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired
    name: PropTypes.string.isRequired
    radiusLayer: PropTypes.bool
    axis: PropTypes.object
    symbol: PropTypes.string
    markerSize: PropTypes.number
    defaultColor: PropTypes.string
    filters: PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    locale: PropTypes.string

  @defaultProps:
    radiusLayer: false

  getCategories: ->
    axisBuilder = new AxisBuilder(schema: @props.schema)

    if not @props.axis or not @props.axis.colorMap
      return

    # Get categories (value + label)
    categories = axisBuilder.getCategories(@props.axis, null, @props.locale)
    
    # Just "None" and so doesn't count
    if _.any(categories, (category) -> category.value?)
      return categories

    # Can't get values of aggregate axis
    if axisBuilder.isAxisAggr(@props.axis)
      return []

    # If no categories, use values from color map as input
    return axisBuilder.getCategories(@props.axis, _.pluck(@props.axis.colorMap, "value"), @props.locale)

  render: ->
    axisBuilder = new AxisBuilder(schema: @props.schema)
    categories = @getCategories()

    if @props.axis and @props.axis.colorMap
      items = _.map categories, (category) =>
        # Exclude if excluded
        if _.includes(@props.axis.excludedValues, category.value)
          return null

        label = axisBuilder.formatCategory(@props.axis, category)
        color = _.find(@props.axis.colorMap, { value: category.value })
        if color
          return { color: color.color, name: label }
        else # old color maps dont have null value
          return { color: @props.defaultColor, name: label }

      # Compact out nulls
      items = _.compact(items)
    else
      items = []

    React.createElement LegendGroup,
      symbol: @props.symbol
      markerSize: @props.markerSize
      items: items
      defaultColor: @props.defaultColor
      name: @props.name
      radiusLayer: @props.radiusLayer
