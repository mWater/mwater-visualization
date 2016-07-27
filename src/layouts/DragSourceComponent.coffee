_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

DragSource = require('react-dnd').DragSource

# Draggable sample that becomes a block when dragged on
sourceSpec = {
  beginDrag: (props, monitor, component) ->
    return props.createDragItem()
}

collectSource = (connect, monitor) ->
  return {
    connectDragSource: connect.dragSource()
    connectDragPreview: connect.dragPreview()
  }

# Simple drag source that runs a function to get the drag item.
class DragSourceComponent extends React.Component
  @propTypes:
    createDragItem: React.PropTypes.func.isRequired # Created DnD item when dragged.

    connectDragSource: React.PropTypes.func.isRequired # the drag source connector, supplied by React DND
    connectDragPreview: React.PropTypes.func.isRequired # the drag preview connector, supplied by React DND

  render: ->
    @props.connectDragPreview(@props.connectDragSource(@props.children))

module.exports = _.flow(DragSource("block", sourceSpec, collectSource))(DragSourceComponent)
