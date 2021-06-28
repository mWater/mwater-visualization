import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import DraggableBlockComponent from "./DraggableBlockComponent"

interface HorizontalBlockComponentProps {
  block: any
  collapseColumns?: boolean
  renderBlock: any
  /** Called with (sourceBlock, targetBlock, side) when block is dropped on it. side is top, left, bottom, right */
  onBlockDrop?: any
  /** Called with (block) when block is removed */
  onBlockRemove?: any
  onBlockUpdate?: any
}

interface HorizontalBlockComponentState {
  dragInitialX: any
  leftSize: any
  rightSize: any
  dragXOffset: any
  dragIndex: any
}

export default class HorizontalBlockComponent extends React.Component<
  HorizontalBlockComponentProps,
  HorizontalBlockComponentState
> {
  constructor(props: any) {
    super(props)

    this.state = {
      dragIndex: null, // index of splitter being dragged
      dragInitialX: null, // Initial drag x
      dragXOffset: null, // Offset of drag (pixels dragged from start)
      leftSize: null,
      rightSize: null
    }

    this.blockRefs = {}
  }

  componentWillUnmount() {
    // Remove listeners
    document.removeEventListener("mousemove", this.handleMouseMove)
    return document.removeEventListener("mouseup", this.handleMouseUp)
  }

  handleMouseDown = (index: any, ev: any) => {
    // Prevent html5 drag
    ev.preventDefault()

    // Get sizes of two blocks
    this.setState({
      dragIndex: index,
      leftSize: this.blockRefs[`block${index}`].offsetWidth,
      rightSize: this.blockRefs[`block${index + 1}`].offsetWidth
    })

    document.addEventListener("mousemove", this.handleMouseMove)
    return document.addEventListener("mouseup", this.handleMouseUp)
  }

  handleMouseMove = (ev: any) => {
    if (!this.state.dragInitialX) {
      this.setState({ dragInitialX: ev.clientX })
      return
    }

    let dragXOffset = ev.clientX - this.state.dragInitialX

    // Can't make left block too small
    if (dragXOffset < -this.state.leftSize + 100) {
      dragXOffset = -this.state.leftSize + 100
    }

    // Can't make right block too small
    if (dragXOffset > this.state.rightSize - 100) {
      dragXOffset = this.state.rightSize - 100
    }

    return this.setState({ dragXOffset })
  }

  handleMouseUp = (ev: any) => {
    // Remove listeners
    document.removeEventListener("mousemove", this.handleMouseMove)
    document.removeEventListener("mouseup", this.handleMouseUp)

    // Determine weights of two blocks
    const weights = this.props.block.weights || []
    const newLeftSize = this.state.leftSize + this.state.dragXOffset
    const newRightSize = this.state.rightSize - this.state.dragXOffset

    // Get current weights
    const leftWeight = weights[this.state.dragIndex] || 1
    const rightWeight = weights[this.state.dragIndex + 1] || 1

    weights[this.state.dragIndex] = ((leftWeight + rightWeight) * newLeftSize) / (newLeftSize + newRightSize)
    weights[this.state.dragIndex + 1] = ((leftWeight + rightWeight) * newRightSize) / (newLeftSize + newRightSize)

    const block = _.extend({}, this.props.block, { weights })
    this.props.onBlockUpdate(block)

    return this.setState({ dragIndex: null, dragInitialX: null, dragXOffset: null })
  }

  render() {
    // Handle simple case of collapseColumns (no editing allowed)
    let index, weight
    let asc, end
    let asc1, end1
    if (this.props.collapseColumns) {
      return R(
        "div",
        null,
        _.map(this.props.block.blocks, (block, index) => this.props.renderBlock(block, true))
      )
    }

    // Calculate widths (percentages)
    let totalWeight = 0
    for (
      index = 0, end = this.props.block.blocks.length, asc = 0 <= end;
      asc ? index < end : index > end;
      asc ? index++ : index--
    ) {
      weight = (this.props.block.weights || [])[index] || 1
      totalWeight += (this.props.block.weights || [])[index] || 1
    }

    const percentages: any = []
    for (
      index = 0, end1 = this.props.block.blocks.length, asc1 = 0 <= end1;
      asc1 ? index < end1 : index > end1;
      asc1 ? index++ : index--
    ) {
      weight = (this.props.block.weights || [])[index] || 1
      percentages[index] = (weight * 100) / totalWeight
    }

    if (this.props.onBlockUpdate != null) {
      let elem = R(
        "table",
        {
          style: { width: "100%", tableLayout: "fixed", position: "relative", paddingTop: 5 },
          className: "mwater-visualization-horizontal-block"
        }, // Add padding to allow dropping
        R(
          "tbody",
          null,
          R(
            "tr",
            null,
            _.map(this.props.block.blocks, (block, index) => {
              return [
                index > 0 && this.props.onBlockUpdate != null
                  ? R("td", {
                      style: { width: 5, position: "relative", left: this.state.dragXOffset },
                      key: `splitter${index}`,
                      className: `mwater-visualization-horizontal-block-splitter ${
                        index - 1 === this.state.dragIndex ? "active" : ""
                      }`,
                      onMouseDown: this.handleMouseDown.bind(null, index - 1)
                    })
                  : undefined,
                R(
                  "td",
                  {
                    style: { width: `${percentages[index]}%`, verticalAlign: "top" },
                    key: block.id,
                    ref: (c: any) => {
                      return (this.blockRefs[`block${index}`] = c)
                    }
                  },
                  this.props.renderBlock(block)
                )
              ]
            })
          )
        )
      )

      // Allow dropping
      elem = R(
        DraggableBlockComponent,
        {
          block: this.props.block,
          onBlockDrop: this.props.onBlockDrop
        },
        elem
      )

      return elem
    } else {
      // Simplify in this case for printing
      return R(
        "div",
        { className: "mwater-visualization-horizontal-block" },
        _.map(this.props.block.blocks, (block, index) => {
          return [
            R(
              "div",
              {
                style: { width: `${percentages[index]}%`, verticalAlign: "top", display: "inline-block" },
                key: block.id,
                ref: (c: any) => {
                  return (this.blockRefs[`block${index}`] = c)
                },
                className: "mwater-visualization-horizontal-block-item"
              },
              this.props.renderBlock(block)
            )
          ]
        })
      )
    }
  }
}

// handleAspectMouseDown: (ev) =>
//   # Get height of overall block
//   @setState(aspectDragY: ev.currentTarget.parentElement.offsetHeight, initialAspectDragY: ev.currentTarget.parentElement.offsetHeight)

//   document.addEventListener("mousemove", @handleMouseMove)
//   document.addEventListener("mouseup", @handleMouseUp)

// handleMouseMove: (ev) =>
//   if @state.initialClientY?
//     aspectDragY = @state.initialAspectDragY + ev.clientY - @state.initialClientY
//     if aspectDragY > 20
//       @setState(aspectDragY: aspectDragY)
//   else
//     @setState(initialClientY: ev.clientY)

// handleMouseUp: (ev) =>
//   # Remove listeners
//   document.removeEventListener("mousemove", @handleMouseMove)
//   document.removeEventListener("mouseup", @handleMouseUp)

//   # Fire new aspect ratio
//   @props.onAspectRatioChange(@props.aspectRatio / (@state.aspectDragY / @state.initialAspectDragY))
//   @setState(aspectDragY: null, initialAspectDragY: null, initialClientY: null)

// renderAspectDrag: ->
//   if @state.aspectDragY?
//     lineStyle = {
//       position: "absolute"
//       borderTop: "solid 3px #38D"
//       top: @state.aspectDragY
//       left: 0
//       right: 0
//     }
//     return R 'div', style: lineStyle, key: "aspectDrag"
//   else
//     return null

// render: ->
//   elem = R 'div', className: "mwater-visualization-decorated-block", style: @props.style,
//     @props.children

//     @renderAspectDrag()

//     if not @props.isDragging and @props.connectMoveHandle?
//       @props.connectMoveHandle(R 'div', key: "move", className: "mwater-visualization-decorated-block-move",
//         R 'i', className: "fa fa-arrows")

//     if not @props.isDragging and @props.onBlockRemove?
//       R 'div', key: "remove", className: "mwater-visualization-decorated-block-remove", onClick: @props.onBlockRemove,
//         R 'i', className: "fa fa-times"

//     if not @props.isDragging and @props.onAspectRatioChange?
//       # TODO sometimes drags (onDragStart) and so doesn't work. Disable dragging?
//       R 'div', key: "aspect", className: "mwater-visualization-decorated-block-aspect", onMouseDown: @handleAspectMouseDown,
//         R 'i', className: "fa fa-arrows-v"

//     if not @props.isDragging and @props.connectResizeHandle?
//       @props.connectResizeHandle(R 'div', key: "resize", className: "mwater-visualization-decorated-block-resize",
//         R 'i', className: "fa fa-expand fa-rotate-90")

//   if @props.connectDragPreview
//     elem = @props.connectDragPreview(elem)

//   return elem
