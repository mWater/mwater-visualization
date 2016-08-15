_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent")

# Color map reorder component, currently in use for BufferLayer
module.exports = class ColorMapOrderEditorComponent extends React.Component
  @propTypes:
    colorMap: React.PropTypes.array.isRequired # The color map that is to be reordered
    categories: React.PropTypes.array.isRequired # The categories for the given color map [{label: string, name: string},...]
    order: React.PropTypes.array.isRequired # The order of the colors, array of the values from color map in specified order
    onChange: React.PropTypes.func.isRequired # callback when the order is changed

  constructor: ->
    @state = {
      editing: false
    }

  handleReorder: (map) =>
    @props.onChange(_.pluck(map, "value"))

  handleEdit: =>
    @setState(editing: true)

  handleDone: =>
    @setState(editing: false)

  renderItem: (item, index, connectDragSource, connectDragPreview, connectDropTarget) =>
    colorStyle =
      height: 16
      width: 16
      display: 'inline-block'
      background: item.color
      marginRight: 4
      verticalAlign: 'middle'

    labelStyle =
      verticalAlign: 'middle'

    iconStyle =
      cursor: "move"
      marginRight: 8
      opacity: 0.5
      fontSize: 12

    label = _.find(@props.categories, {value: item.value})?.label

    connectDragPreview(connectDropTarget(H.div null,
      connectDragSource(H.i(className: "fa fa-bars", style: iconStyle))
      H.span style: colorStyle
      H.span style: labelStyle , label
    ))

  renderControl: ->
    H.p null,
      H.a style: { cursor: "pointer" }, onClick: @handleEdit, "Set color priorities"

  render: ->
    if @state.editing
      items = _.sortBy(@props.colorMap, (item) =>
        _.indexOf(@props.order, item.value)
      )

      H.div null,
        R ReorderableListComponent,
          items: items
          onReorder: @handleReorder
          renderItem: @renderItem
          getItemId: (item) => item.value
        H.p null,
          H.a style: { cursor: "pointer" }, onClick: @handleDone, "Done"
    else
      @renderControl()