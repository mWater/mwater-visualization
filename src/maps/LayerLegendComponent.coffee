React = require 'react'
H = React.DOM
_ = require 'lodash'
R = React.createElement
AxisBuilder = require '../axes/AxisBuilder'
LegendGroup = require('./LegendGroup')
ExprUtils = require('mwater-expressions').ExprUtils

# wraps the legends for a layer
module.exports = class LayerLegendComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired
    name: React.PropTypes.string.isRequired
    radiusLayer: React.PropTypes.bool
    axis: React.PropTypes.object
    symbol: React.PropTypes.string
    defaultColor: React.PropTypes.string

  @defaultProps:
    radiusLayer: false

  constructor: ->
    super
    @state = {
      categories: []
    }

  componentDidMount: ->
    @loadCategories(@props)

  componentWillReceiveProps: (nextProps) ->
    if not _.isEqual(nextProps.axis, @props.axis)
      @loadCategories(nextProps)

  componentWillUnmount: ->
    @unmounted = true

  loadCategories: (props) ->
    axisBuilder = new AxisBuilder(schema: props.schema)

    if not props.axis or not props.axis.colorMap
      return

    # Get categories (value + label)
    categories = axisBuilder.getCategories(props.axis, _.pluck(props.axis.colorMap, "value"))
    if categories.length > 1
      @setState(categories: categories)
      return

  render: ->
    if @props.axis and @props.axis.colorMap
      colors = _.map @state.categories, (category) =>
        color = _.find(@props.axis.colorMap, {value: category.value})
        if color
          {color: color.color, name: ExprUtils.localizeString(category.label) }
        else # old color maps dont have null value
          {color: @props.defaultColor, name: ExprUtils.localizeString(category.label) }
    else
      colors = []

    React.createElement LegendGroup,
      symbol: @props.symbol
      items: colors
      defaultColor: @props.defaultColor
      name: @props.name
      radiusLayer: @props.radiusLayer