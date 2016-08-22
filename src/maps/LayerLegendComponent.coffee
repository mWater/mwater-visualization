React = require 'react'
H = React.DOM
_ = require 'lodash'
R = React.createElement
AxisBuilder = require '../axes/AxisBuilder'
LegendGroup = require('./LegendGroup')
ExprUtils = require('mwater-expressions').ExprUtils

module.exports = class LayerLegendComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object
    schema: React.PropTypes.object.isRequired
    dataSource: React.PropTypes.object.isRequired # data source to use
    name: React.PropTypes.string.isRequired
    radiusLayer: React.PropTypes.bool

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

    # Check for axis
    axis = props.design.axes.color
    # Ignore if error
    if not axis or axisBuilder.validateAxis(axis: axis)
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

    console.log valuesQuery

    props.dataSource.performQuery(valuesQuery, (error, rows) =>
      if @unmounted
        return

      if error
        console.log error
        return # Ignore

      # Get categories (value + label)
      categories = axisBuilder.getCategories(props.design.axes.color, _.pluck(rows, "val"))
      console.log categories
      @setState(categories: categories)
    )

  render: ->
    symbol = @props.design.symbol or 'font-awesome/circle'

    React.createElement LegendGroup,
      symbol: symbol
      items: _.map @state.categories, (category) =>
        color = _.find(@props.design.axes.color.colorMap, {value: category.value})
        {color: color.color, name: ExprUtils.localizeString(category.label) }
      defaultColor: @props.design.color
      name: @props.name
      radiusLayer: @props.radiusLayer
