React = require 'react'
H = React.DOM
_ = require 'lodash'
R = React.createElement
AxisBuilder = require '../axes/AxisBuilder'
LegendGroup = require('./LegendGroup')
ExprUtils = require('mwater-expressions').ExprUtils

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

    # Get categories (value + label)
    categories = axisBuilder.getCategories(props.axis, _.pluck(@props.axis.colorMap or [], "value"))
    if categories.length > 0
      @setState(categories: categories)
      return

  render: ->
    symbol = @props.symbol

    React.createElement LegendGroup,
      symbol: symbol
      items: _.map @state.categories, (category) =>
        color = _.find(@props.axis.colorMap, {value: category.value})
        {color: color.color, name: ExprUtils.localizeString(category.label) }
      defaultColor: @props.defaultColor
      name: @props.name
      radiusLayer: @props.radiusLayer
