PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
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
    createDragItem: PropTypes.func.isRequired # Created DnD item when dragged.

    connectDragSource: PropTypes.func.isRequired # the drag source connector, supplied by React DND
    connectDragPreview: PropTypes.func.isRequired # the drag preview connector, supplied by React DND

  render: ->
    @props.connectDragPreview(@props.connectDragSource(@props.children))

module.exports = (type) -> DragSource(type, sourceSpec, collectSource)(DragSourceComponent)
