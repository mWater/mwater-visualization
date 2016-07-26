_ = require 'lodash'
uuid = require 'node-uuid'
React = require 'react'
H = React.DOM
R = React.createElement

DragSource = require('react-dnd').DragSource

# Draggable sample that becomes a block when dragged on
blockSourceSpec = {
  beginDrag: (props, monitor, component) ->
    return {
      block: _.extend({}, props.block, id: uuid.v4())
    }
}

collectSource = (connect, monitor) ->
  return {
    connectDragSource: connect.dragSource()
    connectDragPreview: connect.dragPreview()
  }


class BlockCreatorComponent extends React.Component
  @propTypes:
    block: React.PropTypes.object.isRequired # Block to display

    connectDragSource: React.PropTypes.func.isRequired # the drag source connector, supplied by React DND
    connectDragPreview: React.PropTypes.func.isRequired # the drag preview connector, supplied by React DND

  render: ->
    style = { } 
    return @props.connectDragPreview(@props.connectDragSource(@props.children))


module.exports = _.flow(DragSource("block", blockSourceSpec, collectSource))(BlockCreatorComponent)
