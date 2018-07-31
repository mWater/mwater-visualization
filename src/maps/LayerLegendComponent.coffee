PropTypes = require('prop-types')
React = require 'react'
H = React.DOM
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
    defaultColor: PropTypes.string
    filters: PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  @defaultProps:
    radiusLayer: false

  constructor: (props) ->
    super(props)
    @state = {
      categories: []
    }

  componentWillMount: ->
    @loadCategories(@props)

  componentWillReceiveProps: (nextProps) ->
    if not _.isEqual(nextProps.axis, @props.axis) or not _.isEqual(nextProps.filters, @props.filters)
      @loadCategories(nextProps)

  componentWillUnmount: ->
    @unmounted = true

  loadCategories: (props) ->
    axisBuilder = new AxisBuilder(schema: props.schema)

    if not props.axis or not props.axis.colorMap
      return

    # Get categories (value + label)
    categories = axisBuilder.getCategories(props.axis)
    
    # Just "None" and so doesn't count
    if _.any(categories, (category) -> category.value?)
      @setState({ categories: categories })
      return

    # Can't get values of aggregate axis
    if axisBuilder.isAxisAggr(props.axis)
      @setState({ categories: [] })
      return

    # If no table, cannot query
    if not props.axis.expr.table
      @setState({ categories: [] })
      return

    # If no categories, we need values as input
    valuesQuery = {
      type: "query"
      selects: [
        { type: "select", expr: axisBuilder.compileAxis(axis: props.axis, tableAlias: "main"), alias: "val" }
      ]
      from: { type: "table", table: props.axis.expr.table, alias: "main" }
      groupBy: [1]
      limit: 50
    }

    filters = _.where(props.filters or [], table: props.axis.expr.table)
    whereClauses = _.map(filters, (f) -> injectTableAlias(f.jsonql, "main"))
    whereClauses = _.compact(whereClauses)

    # Wrap if multiple
    if whereClauses.length > 1
      valuesQuery.where = { type: "op", op: "and", exprs: whereClauses }
    else
      valuesQuery.where = whereClauses[0]

    props.dataSource.performQuery(valuesQuery, (error, rows) =>
      if error
        return # Ignore errors

      # Get categories (value + label)
      categories = axisBuilder.getCategories(props.axis, _.pluck(rows, "val"))   
      @setState({ categories: categories })
    )

  render: ->
    if @props.axis and @props.axis.colorMap
      items = _.map @state.categories, (category) =>
        # Exclude if excluded
        if _.includes(@props.axis.excludedValues, category.value)
          return null

        label = ExprUtils.localizeString(category.label)
        color = _.find(@props.axis.colorMap, {value: category.value})
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
      items: items
      defaultColor: @props.defaultColor
      name: @props.name
      radiusLayer: @props.radiusLayer
