// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
import ReactDOM from "react-dom"
const R = React.createElement

import { DragSource } from "react-dnd"
import { DropTarget } from "react-dnd"

interface DraggableBlockComponentProps {
  /** Block to display */
  block: any
  /** Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right */
  onBlockDrop: any
  /** Merge in style */
  style?: any
  /** True to only allow dropping at bottom (root block) */
  onlyBottom?: boolean
  /** Injected by React-dnd */
  isDragging: boolean
  /** internally used to check if an item is over the current component */
  isOver: boolean
  /** the drag source connector, supplied by React DND */
  connectDragSource: any
  /** the drop target connector, supplied by React DND */
  connectDropTarget: any
  connectDragPreview: any
}

interface DraggableBlockComponentState {
  hoverSide: any
}

// Block which can be dragged around in block layout.
class DraggableBlockComponent extends React.Component<DraggableBlockComponentProps, DraggableBlockComponentState> {
  constructor(props: any) {
    super(props)

    this.state = {
      hoverSide: null
    }
  }

  renderHover() {
    const lineStyle = { position: "absolute" }

    // Show
    if (this.props.isOver) {
      // style.backgroundColor = "#DDF"
      switch (this.state.hoverSide) {
        case "left":
          lineStyle.borderLeft = "solid 3px #38D"
          lineStyle.top = 0
          lineStyle.bottom = 0
          lineStyle.left = 0
          break
        case "right":
          lineStyle.borderRight = "solid 3px #38D"
          lineStyle.top = 0
          lineStyle.right = 0
          lineStyle.bottom = 0
          break
        case "top":
          lineStyle.borderTop = "solid 3px #38D"
          lineStyle.top = 0
          lineStyle.left = 0
          lineStyle.right = 0
          break
        case "bottom":
          lineStyle.borderBottom = "solid 3px #38D"
          lineStyle.bottom = 0
          lineStyle.left = 0
          lineStyle.right = 0
          break
      }

      return R("div", { style: lineStyle })
    } else {
      return null
    }
  }

  render() {
    const style = {}

    // Hide if dragging
    if (this.props.isDragging) {
      style.visibility = "hidden"
    }

    return this.props.connectDropTarget(
      R(
        "div",
        { style: this.props.style },
        R(
          "div",
          { style: { position: "relative" } },
          this.renderHover(),
          React.cloneElement(React.Children.only(this.props.children), {
            connectMoveHandle: this.props.connectDragSource,
            connectDragPreview: this.props.connectDragPreview
          })
        )
      )
    )
  }
}

// Gets the drop side (top, left, right, bottom)
function getDropSide(monitor: any, component: any) {
  // Get underlying component
  let pos
  const blockComponent = component.getDecoratedComponentInstance()

  // Get bounds of component
  const hoverBoundingRect = ReactDOM.findDOMNode(blockComponent).getBoundingClientRect()

  const clientOffset = monitor.getClientOffset()

  // Get position within hovered item
  const hoverClientX = clientOffset.x - hoverBoundingRect.left
  const hoverClientY = clientOffset.y - hoverBoundingRect.top

  // Determine if over is more left, right, top or bottom
  const fractionX = hoverClientX / (hoverBoundingRect.right - hoverBoundingRect.left)
  const fractionY = hoverClientY / (hoverBoundingRect.bottom - hoverBoundingRect.top)

  if (fractionX > fractionY) {
    // top or right
    if (1 - fractionX > fractionY) {
      // top or left
      pos = "top"
    } else {
      pos = "right"
    }
  } else {
    // bottom or left
    if (1 - fractionX > fractionY) {
      // top or left
      pos = "left"
    } else {
      pos = "bottom"
    }
  }

  return pos
}

const blockTargetSpec = {
  // Called when an block hovers over this component
  hover(props: any, monitor: any, component: any) {
    // Hovering over self does nothing
    let side
    const hoveringId = monitor.getItem().block.id
    const myId = props.block.id
    if (hoveringId === myId) {
      return
    }

    if (props.onlyBottom) {
      side = "bottom"
    } else {
      side = getDropSide(monitor, component)
    }

    // Set the state
    return component.getDecoratedComponentInstance().setState({ hoverSide: side })
  },

  canDrop(props: any, monitor: any) {
    const hoveringId = monitor.getItem().block.id
    const myId = props.block.id
    if (hoveringId === myId) {
      return false
    }

    return true
  },

  drop(props: any, monitor: any, component: any) {
    if (monitor.didDrop()) {
      return
    }

    const side = component.getDecoratedComponentInstance().state.hoverSide
    props.onBlockDrop(monitor.getItem().block, props.block, side)
  }
}

const blockSourceSpec = {
  beginDrag(props: any, monitor: any, component: any) {
    return {
      block: props.block
    }
  },

  isDragging(props: any, monitor: any) {
    return props.block.id === monitor.getItem().block.id
  }
}

function collectTarget(connect: any, monitor: any) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop()
  }
}

function collectSource(connect: any, monitor: any) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }
}

export default _.flow(
  DragSource("visualization-block", blockSourceSpec, collectSource),
  DropTarget("visualization-block", blockTargetSpec, collectTarget)
)(DraggableBlockComponent)
