// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import uuid from "uuid"

const DragSourceComponent = require("../DragSourceComponent")("visualization-block")
import { DropTarget } from "react-dnd"

// Clipboard item in a palette that has special properties
class ClipboardPaletteItemComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      clipboard: PropTypes.object,
      onClipboardChange: PropTypes.func,
      cantPasteMessage: PropTypes.string
    }
    // Set if can't paste current contents (usually because missing extra tables)
  }

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
ClipboardPaletteItemComponent.initClass()

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
