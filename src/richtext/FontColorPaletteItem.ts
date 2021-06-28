// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let FontColorPaletteItem
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import _ from "lodash"
import ClickOutHandler from "react-onclickout"
import Color from "color"

// Palette item that allows picking a color
export default FontColorPaletteItem = (function () {
  FontColorPaletteItem = class FontColorPaletteItem extends React.Component {
    static initClass() {
      this.propTypes = {
        onSetColor: PropTypes.func.isRequired, // Called with "#FF8800", etc.
        position: PropTypes.string // should the popup be under or over?
      }

      this.defaultProps = { position: "under" }
    }

    constructor(props: any) {
      super(props)
      this.state = {
        open: false
      }
    }

    handleMouseDown = (ev: any) => {
      // Don't lose focus from editor
      ev.preventDefault()
      return this.setState({ open: !this.state.open })
    }

    render() {
      const popupPosition = {
        position: "absolute",
        left: 0,
        zIndex: 1000,
        backgroundColor: "white",
        border: "solid 1px #AAA",
        borderRadius: 3
      }

      if (this.props.position === "under") {
        popupPosition["top"] = 26
      } else {
        popupPosition["bottom"] = 26
      }

      return R(
        ClickOutHandler,
        { onClickOut: () => this.setState({ open: false }) },
        R(
          "div",
          {
            className: "mwater-visualization-text-palette-item",
            onMouseDown: this.handleMouseDown,
            style: { position: "relative" }
          },
          this.state.open
            ? R(
                "div",
                { style: popupPosition },
                R(ColorPaletteComponent, {
                  onSetColor: (color: any) => {
                    this.props.onSetColor(color)
                    return this.setState({ open: false })
                  }
                })
              )
            : undefined,

          R("i", { className: "fa fa-tint" })
        )
      );
    }
  }
  FontColorPaletteItem.initClass()
  return FontColorPaletteItem
})()

class ColorPaletteComponent extends React.Component {
  static initClass() {
    this.propTypes = { onSetColor: PropTypes.func.isRequired }
  }

  renderColor(color: any) {
    return R(
      "td",
      null,
      R("div", {
        style: { width: 16, height: 15, backgroundColor: color, margin: 1 },
        onMouseDown: (ev: any) => {
          ev.preventDefault()
          return this.props.onSetColor(color)
        }
      })
    );
  }

  render() {
    const baseColors = [
      "#FF0000", // red
      "#FFAA00", // orange
      "#FFFF00", // yellow
      "#00FF00", // green
      "#00FFFF", // cyan
      "#0000FF", // blue
      "#9900FF", // purple
      "#FF00FF" // magenta
    ]
    return R(
      "div",
      { style: { padding: 5 } },
      R(
        "table",
        null,
        R(
          "tbody",
          null,
          // Grey shades
          R(
            "tr",
            null,
            _.map(_.range(0, 8), (i) => {
              return this.renderColor(Color({ r: (i * 255) / 7, g: (i * 255) / 7, b: (i * 255) / 7 }).hex())
            })
          ),
          R("tr", { style: { height: 5 } }),
          // Base colors
          R(
            "tr",
            null,
            _.map(baseColors, (c) => this.renderColor(c))
          ),
          R("tr", { style: { height: 5 } }),
          R(
            "tr",
            null,
            _.map(baseColors, (c) => this.renderColor(Color(c).lighten(0.7).hex()))
          ),
          R(
            "tr",
            null,
            _.map(baseColors, (c) => this.renderColor(Color(c).lighten(0.5).hex()))
          ),
          R(
            "tr",
            null,
            _.map(baseColors, (c) => this.renderColor(Color(c).lighten(0.3).hex()))
          ),
          R(
            "tr",
            null,
            _.map(baseColors, (c) => this.renderColor(Color(c).darken(0.3).hex()))
          ),
          R(
            "tr",
            null,
            _.map(baseColors, (c) => this.renderColor(Color(c).darken(0.5).hex()))
          ),
          R(
            "tr",
            null,
            _.map(baseColors, (c) => this.renderColor(Color(c).darken(0.7).hex()))
          )
        )
      )
    )
  }
}
ColorPaletteComponent.initClass()
