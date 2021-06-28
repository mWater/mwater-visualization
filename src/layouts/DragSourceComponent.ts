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

interface DragSourceComponentProps {
  /** Created DnD item when dragged. */
  createDragItem: any
  /** the drag source connector, supplied by React DND */
  connectDragSource: any
  connectDragPreview: any
}

// Simple drag source that runs a function to get the drag item.
class DragSourceComponent extends React.Component<DragSourceComponentProps> {
  render() {
    return this.props.connectDragPreview(this.props.connectDragSource(this.props.children))
  }
}
export default (type: any) => DragSource(type, sourceSpec, collectSource)(DragSourceComponent)
