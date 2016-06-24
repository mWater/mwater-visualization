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
    categories: React.PropTypes.array

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
      H.table style: { width: "auto" },
        H.tbody null,
          _.map @props.categories, (category) =>
            H.tr null,
              H.td key: "color",
                R ColorComponent, 
                  color: @lookupColor(category.value)
                  onChange: (color) => @handleColorChange(category.value, color)
              H.td key: "label", style: { paddingLeft: 8 },
                category.label

