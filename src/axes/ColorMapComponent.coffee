_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
ExprCompiler = require('mwater-expressions').ExprCompiler
AxisBuilder = require './AxisBuilder'
update = require 'update-object'
ColorComponent = require '../ColorComponent'
ExprUtils = require('mwater-expressions').ExprUtils
ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent")

# Color map for an axis
module.exports = class ColorMapComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired 
    dataSource: React.PropTypes.object.isRequired
    axis: React.PropTypes.object.isRequired   
    onChange: React.PropTypes.func.isRequired
    categories: React.PropTypes.array
    reorderable: React.PropTypes.bool
    onOrderChange: React.PropTypes.func
    order: React.PropTypes.array

  handleReorder: (map) =>
    @props.onOrderChange(_.pluck(map, "value"))

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

  handleNullLabelChange: (e) =>
    name = prompt("Enter label for none value", @props.axis.nullLabel or ExprUtils.localizeString("None"))
    if name
      @props.onChange(update(@props.axis, { nullLabel: { $set: name }}))

  renderLabel: (category) ->
    label = ExprUtils.localizeString(category.label)

    if category.value
      label
    else
      H.a onClick: @handleNullLabelChange, style: {cursor: 'pointer'},
        label
        H.span style: {fontSize: 12, marginLeft: 4}, "(click to change label for none value)"

  renderItem: (item, index, connectDragSource, connectDragPreview, connectDropTarget) =>
    labelStyle =
      verticalAlign: 'middle'
      marginLeft: 8

    iconStyle =
      cursor: "move"
      marginRight: 8
      opacity: 0.5
      fontSize: 12
      height: 20

    colorPickerStyle =
      verticalAlign: 'middle'
      lineHeight: 1
      display: 'inline'

    connectDragPreview(connectDropTarget(H.div null,
      connectDragSource(H.i(className: "fa fa-bars", style: iconStyle))
      H.div style: colorPickerStyle,
        R ColorComponent,
          key: 'color'
          color: @lookupColor(item.value)
          onChange: (color) => @handleColorChange(item.value, color)
      H.span style: labelStyle ,
        @renderLabel(item)
    ))

  renderReorderable: ->
    ordered = _.sortBy(@props.categories, (item) =>
      _.indexOf(@props.order, item.value)
    )

    items = _.map ordered, (category) =>
      {value: category.value, color: @lookupColor(category.value), label: category.label }

    H.div null,
      R ReorderableListComponent,
        items: items
        onReorder: @handleReorder
        renderItem: @renderItem
        getItemId: (item) => item.value

  render: ->
    if @props.reorderable
      @renderReorderable()
    else
      H.div null,
        H.table style: { width: "auto" },
          H.tbody null,
            _.map @props.categories, (category) =>
              H.tr key: category.value,
                H.td key: "color",
                  R ColorComponent,
                    color: @lookupColor(category.value)
                    onChange: (color) => @handleColorChange(category.value, color)
                H.td key: "label", style: { paddingLeft: 8 },
                  @renderLabel(category)


