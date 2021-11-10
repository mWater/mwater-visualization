import _ from "lodash"
import React from "react"
const R = React.createElement
import uuid from "uuid"

const DragSourceComponent = require("../DragSourceComponent").default("visualization-block")
import { DropTarget } from "react-dnd"

interface ClipboardPaletteItemComponentProps {
  clipboard?: any
  onClipboardChange?: any
  cantPasteMessage?: string
  connectDropTarget: any
  isOver: boolean
}

// Clipboard item in a palette that has special properties
class ClipboardPaletteItemComponent extends React.Component<ClipboardPaletteItemComponentProps> {
  createItem = () => {
    // Add unique id
    return { block: _.extend({}, this.props.clipboard, { id: uuid() }) }
  }

  handleClear = () => {
    if (confirm("Clear clipboard?")) {
      return this.props.onClipboardChange(null)
    }
  }

  render() {
    let elem = this.props.connectDropTarget(
      R(
        "div",
        {
          className:
            this.props.clipboard && !this.props.cantPasteMessage
              ? "mwater-visualization-palette-item"
              : "mwater-visualization-palette-item disabled",
          style: this.props.isOver ? { backgroundColor: "#2485dd" } : undefined
        },
        R(
          "div",
          { className: "title", key: "title" },
          this.props.isOver ? R("i", { className: "fa fa-clone" }) : R("i", { className: "fa fa-clipboard" })
        ),
        R("div", { className: "subtitle", key: "subtitle" }, this.props.isOver ? "Copy" : "Clipboard"),
        this.props.cantPasteMessage
          ? R("div", { className: "tooltiptext" }, this.props.cantPasteMessage)
          : R(
              "div",
              { className: "tooltiptext" },
              "Clipboard allows copying widgets for pasting on this dashboard or another dashboard. Drag a widget on to this clipboard to copy it."
            ),
        this.props.clipboard
          ? R("div", { className: "clearclipboard", onClick: this.handleClear }, R("i", { className: "fa fa-trash-o" }))
          : undefined
      )
    )

    if (this.props.clipboard && !this.props.cantPasteMessage) {
      elem = R(DragSourceComponent, { createDragItem: this.createItem }, elem)
    }
    return elem
  }
}
const blockTargetSpec = {
  canDrop(props: any, monitor: any) {
    return true
  },

  drop(props: any, monitor: any, component: any) {
    // Check that not from a nested one
    if (monitor.didDrop()) {
      return
    }

    props.onClipboardChange(monitor.getItem().block)
  }
}

function collectTarget(connect: any, monitor: any) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop()
  }
}

export default _.flow(DropTarget("visualization-block", blockTargetSpec, collectTarget))(ClipboardPaletteItemComponent)
