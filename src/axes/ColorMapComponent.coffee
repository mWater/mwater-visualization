_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
ExprCompiler = require('mwater-expressions').ExprCompiler
AxisBuilder = require './AxisBuilder'
update = require 'update-object'
ColorComponent = require '../ColorComponent'

# Color map for an axis
module.exports = class ColorMapComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired 
    dataSource: React.PropTypes.object.isRequired
    axis: React.PropTypes.object.isRequired   
    onChange: React.PropTypes.func.isRequired

  constructor: ->
    super
    @state = {
      categories: null
    }

  componentDidMount: ->
    @loadCategories(@props)
  
  componentWillReceiveProps: (nextProps) ->
    if not _.isEqual(nextProps.axis, @props.axis)
      @loadCategories(nextProps)

  loadCategories: (props) ->
    axisBuilder = new AxisBuilder(schema: props.schema)

    # Get categories (value + label)
    categories = axisBuilder.getCategories(props.axis)
    if categories.length > 0
      @setState(categories: categories)
      return

    axis = axisBuilder.cleanAxis(axis: props.axis)
    # Ignore if error
    if axisBuilder.validateAxis(axis: axis)
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
      @setState(categories: categories)
    )

  componentWillUnmount: ->
    @unmounted = true

  handleColorChange: (value, color) =>
    # Delete if present for value
    colorMap = _.filter(@props.axis.colorMap, (item) => item.value != value)

    # Add if color present
    if color
      colorMap.push({ value: value, color: color })

    @props.onChange(update(@props.axis, { colorMap: { $set: colorMap }}))

  # Gets the current color value if known
  lookupColor: (value) ->
    item = _.find(@props.axis.colorMap, (item) => item.value == value)
    if item
      return item.color
    return null

  render: ->
    H.div null,
      H.table className: "table table-bordered  ", style: { width: "auto" },
        H.thead null,
          H.tr null, 
            H.th colSpan: 2, "Colors"
        H.tbody null,
          _.map @state.categories, (category) =>
            H.tr null,
              H.td null,
                category.label
              H.td null,
                R ColorComponent, 
                  color: @lookupColor(category.value)
                  onChange: (color) => @handleColorChange(category.value, color)

