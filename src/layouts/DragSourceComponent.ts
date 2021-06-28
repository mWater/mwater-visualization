// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { DragSource } from "react-dnd"

// Draggable sample that becomes a block when dragged on
const sourceSpec = {
  beginDrag(props: any, monitor: any, component: any) {
    return props.createDragItem()
  }
}

function collectSource(connect: any, monitor: any) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview()
  }
}

// Simple drag source that runs a function to get the drag item.
class DragSourceComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      createDragItem: PropTypes.func.isRequired, // Created DnD item when dragged.

      connectDragSource: PropTypes.func.isRequired, // the drag source connector, supplied by React DND
      connectDragPreview: PropTypes.func.isRequired
    }
    // the drag preview connector, supplied by React DND
  }

  render() {
    return this.props.connectDragPreview(this.props.connectDragSource(this.props.children))
  }
}
DragSourceComponent.initClass()

export default (type: any) => DragSource(type, sourceSpec, collectSource)(DragSourceComponent);
