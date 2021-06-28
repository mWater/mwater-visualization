import PropTypes from "prop-types"
import React from "react"
const R = React.createElement

const DragSourceComponent = require("../DragSourceComponent")("block-move")

interface PaletteItemComponentProps {
  /** Create the drag item */
  createItem: any
  title?: any
  subtitle?: any
}

// Item in a palette that can be dragged to add a widget or other item
export default class PaletteItemComponent extends React.Component<PaletteItemComponentProps> {
  render() {
    return R(
      DragSourceComponent,
      { createDragItem: this.props.createItem },
      R(
        "div",
        { className: "mwater-visualization-palette-item" },
        R("div", { className: "title", key: "title" }, this.props.title),
        R("div", { className: "subtitle", key: "subtitle" }, this.props.subtitle)
      )
    )
  }
}
