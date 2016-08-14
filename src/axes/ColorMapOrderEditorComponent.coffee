_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent")

module.exports = class ColorMapOrderEditorComponent extends React.Component
  @propTypes:
    colorMap: React.PropTypes.array
    categories: React.PropTypes.array
    onChange: React.PropTypes.func

  constructor: ->
    @state = {
      editing: false
    }

  handleReorder: (map) =>
    @props.onChange(map)

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
      H.div null,
        R ReorderableListComponent,
          items: @props.colorMap
          onReorder: @handleReorder
          renderItem: @renderItem
          getItemId: (item) => item.value
        H.p null,
          H.a style: { cursor: "pointer" }, onClick: @handleDone, "Done"
    else
      @renderControl()