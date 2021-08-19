// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let PivotChartLayoutComponent
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
import ReactDOM from "react-dom"
const R = React.createElement

import Color from "color"
import * as ui from "react-library/lib/bootstrap"
import classNames from "classnames"

// Displays a pivot chart from a layout
export default PivotChartLayoutComponent = (function () {
  PivotChartLayoutComponent = class PivotChartLayoutComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        layout: PropTypes.object.isRequired, // See README.md

        editable: PropTypes.bool, // If true, all below must be present. If false, none must be present
        onEditSection: PropTypes.func, // Called with id of section (segment id or intersection id)
        onRemoveSegment: PropTypes.func, // Called with id of segment
        onInsertBeforeSegment: PropTypes.func, // Called with id of segment
        onInsertAfterSegment: PropTypes.func, // Called with id of segment
        onAddChildSegment: PropTypes.func, // Called with id of segment
        onSummarizeSegment: PropTypes.func
      }
      // Called with id of segment. Summarizes the segment
    }

    constructor(props: any) {
      super(props)

      this.state = {
        hoverSection: null // Current section being hovered over
      }

      // Index of cell components by "<rowIndex>:<columnIndex>"
      this.cellComps = {}
    }

    // Records the cell components. This is to be able to calculate the bounds of sections
    // to allow floating hover controls
    recordCellComp = (rowIndex: any, columnIndex: any, comp: any) => {
      const key = `${rowIndex}:${columnIndex}`
      if (comp) {
        return (this.cellComps[key] = comp)
      } else {
        return delete this.cellComps[key]
      }
    }

    renderRow(row: any, rowIndex: any) {
      return R(
        "tr",
        { key: rowIndex },
        _.map(row.cells, (cell, columnIndex) => {
          return R(LayoutCellComponent, {
            ref: this.recordCellComp.bind(null, rowIndex, columnIndex),
            key: columnIndex,
            layout: this.props.layout,
            rowIndex,
            columnIndex,
            onHover: this.props.editable ? () => this.setState({ hoverSection: cell.section }) : undefined,
            hoverSection: this.props.editable ? this.state.hoverSection : undefined,
            onEditSection: this.props.onEditSection ? this.props.onEditSection.bind(null, cell.section) : undefined,
            onSummarizeSegment: this.props.onSummarizeSegment
              ? this.props.onSummarizeSegment.bind(null, cell.section)
              : undefined
          })
        })
      )
    }

    renderHoverPlusIcon = (key: any, x: any, y: any, onClick: any) => {
      // Render a plus box
      return R(
        "div",
        {
          key,
          onClick,
          style: {
            position: "absolute",
            left: x - 7,
            top: y - 6,
            border: "solid 1px #337ab7",
            backgroundColor: "white",
            paddingLeft: 3,
            paddingRight: 3,
            paddingTop: 0,
            color: "#337ab7",
            fontSize: 9,
            cursor: "pointer",
            opacity: 0.8
          }
        },
        R(ui.Icon, { id: "fa-plus" })
      )
    }

    renderHoverRemoveIcon = (key: any, x: any, y: any, onClick: any) => {
      // Render a plus box
      return R(
        "div",
        {
          key,
          onClick,
          style: {
            position: "absolute",
            left: x - 7,
            top: y - 6,
            border: "solid 1px #337ab7",
            backgroundColor: "white",
            paddingLeft: 3,
            paddingRight: 3,
            paddingTop: 0,
            color: "#337ab7",
            fontSize: 9,
            cursor: "pointer",
            opacity: 0.8
          }
        },
        R(ui.Icon, { id: "fa-remove" })
      )
    }

    // Render floating hover controls
    renderHoverControls = () => {
      let key, maxX, maxY, minY
      if (!this.state.hoverSection) {
        return
      }

      // Determine hover rectangle and section type (row, column or intersection)
      let minX = (maxX = minY = maxY = null)
      let sectionType = null
      for (key in this.cellComps) {
        const cell = this.cellComps[key]
        const rowIndex = parseInt(key.split(":")[0])
        const columnIndex = parseInt(key.split(":")[1])

        const cellTd = cell.getTdComponent()
        if (!cellTd) {
          continue
        }

        // If hover
        if (this.props.layout.rows[rowIndex]?.cells[columnIndex]?.section === this.state.hoverSection) {
          // Add bounds
          minX = minX == null || cellTd.offsetLeft < minX ? cellTd.offsetLeft : minX
          minY = minY == null || cellTd.offsetTop < minY ? cellTd.offsetTop : minY
          maxX =
            maxX == null || cellTd.offsetLeft + cellTd.offsetWidth > maxX
              ? cellTd.offsetLeft + cellTd.offsetWidth
              : maxX
          maxY =
            maxY == null || cellTd.offsetTop + cellTd.offsetHeight > maxY
              ? cellTd.offsetTop + cellTd.offsetHeight
              : maxY

          // Record type
          sectionType = this.props.layout.rows[rowIndex].cells[columnIndex].type
        }
      }

      if (minX == null || !sectionType) {
        return null
      }

      // Determine types of controls to show
      const controls = []
      if (sectionType === "row" && this.props.onInsertBeforeSegment) {
        controls.push(
          this.renderHoverPlusIcon(
            "top",
            (minX + maxX) / 2,
            minY,
            this.props.onInsertBeforeSegment.bind(null, this.state.hoverSection)
          )
        )
      }

      if (sectionType === "row" && this.props.onInsertAfterSegment) {
        controls.push(
          this.renderHoverPlusIcon(
            "bottom",
            (minX + maxX) / 2,
            maxY,
            this.props.onInsertAfterSegment.bind(null, this.state.hoverSection)
          )
        )
      }

      if (sectionType === "row" && this.props.onAddChildSegment) {
        controls.push(
          this.renderHoverPlusIcon(
            "right",
            maxX,
            (minY + maxY) / 2,
            this.props.onAddChildSegment.bind(null, this.state.hoverSection)
          )
        )
      }

      if (sectionType === "column" && this.props.onInsertBeforeSegment) {
        controls.push(
          this.renderHoverPlusIcon(
            "left",
            minX,
            (minY + maxY) / 2,
            this.props.onInsertBeforeSegment.bind(null, this.state.hoverSection)
          )
        )
      }

      if (sectionType === "column" && this.props.onInsertAfterSegment) {
        controls.push(
          this.renderHoverPlusIcon(
            "right",
            maxX,
            (minY + maxY) / 2,
            this.props.onInsertAfterSegment.bind(null, this.state.hoverSection)
          )
        )
      }

      if (sectionType === "column" && this.props.onAddChildSegment) {
        controls.push(
          this.renderHoverPlusIcon(
            "bottom",
            (minX + maxX) / 2,
            maxY,
            this.props.onAddChildSegment.bind(null, this.state.hoverSection)
          )
        )
      }

      if (["row", "column"].includes(sectionType) && this.props.onRemoveSegment) {
        controls.push(
          this.renderHoverRemoveIcon(
            "topright",
            maxX,
            minY,
            this.props.onRemoveSegment.bind(null, this.state.hoverSection)
          )
        )
      }

      return R("div", { key: "hover-controls" }, controls)
    }

    render() {
      return R(
        "div",
        {
          style: { position: "relative" },
          onMouseLeave: () => this.setState({ hoverSection: null })
        },
        // Define CSS classes to keep HTML as small as possible
        // https://stackoverflow.com/a/19047221/876117
        // https://github.com/mWater/mwater-portal/issues/1183
        // cell borders not visible in firefox when you have a cell with position relative inside a table with collapsed borders
        R(
          "style",
          null,
          `\
.pivot-chart-table {
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  position: relative;
}

.pivot-chart-table .cell {
  padding: 5px;
  vertical-align: top;
  background-color: white;
}

.pivot-chart-table .bt1 { border-top: solid 1px #f4f4f4 }
.pivot-chart-table .bt2 { border-top: solid 1px #ccc }
.pivot-chart-table .bt3 { border-top: solid 1px #888 }

.pivot-chart-table .bb1 { border-bottom: solid 1px #f4f4f4 }
.pivot-chart-table .bb2 { border-bottom: solid 1px #ccc }
.pivot-chart-table .bb3 { border-bottom: solid 1px #888 }

.pivot-chart-table .bl1 { border-left: solid 1px #f4f4f4 }
.pivot-chart-table .bl2 { border-left: solid 1px #ccc }
.pivot-chart-table .bl3 { border-left: solid 1px #888 }

.pivot-chart-table .br1 { border-right: solid 1px #f4f4f4 }
.pivot-chart-table .br2 { border-right: solid 1px #ccc }
.pivot-chart-table .br3 { border-right: solid 1px #888 }\
`
        ),
        this.props.layout.tooManyRows
          ? R(
              "div",
              { className: "text-warning", style: { fontSize: 12 } },
              R("i", { className: "fa fa-exclamation-circle" }),
              " Warning: Too many rows in table to display"
            )
          : undefined,

        this.props.layout.tooManyColumns
          ? R(
              "div",
              { className: "text-warning", style: { fontSize: 12 } },
              R("i", { className: "fa fa-exclamation-circle" }),
              " Warning: Too many columns in table to display"
            )
          : undefined,
        R(
          "div",
          { style: { position: "relative" } },
          R(
            "table",
            { className: "pivot-chart-table" },
            R(
              "tbody",
              null,
              _.map(this.props.layout.rows, (row, rowIndex) => {
                return this.renderRow(row, rowIndex)
              })
            )
          ),
          this.renderHoverControls()
        )
      )
    }
  }
  PivotChartLayoutComponent.initClass()
  return PivotChartLayoutComponent
})()

// Single layout cell
class LayoutCellComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      layout: PropTypes.object.isRequired, // See PivotChart Design.md
      rowIndex: PropTypes.number.isRequired,
      columnIndex: PropTypes.number.isRequired,
      hoverSection: PropTypes.string, // Which section is currently hovered over
      onHover: PropTypes.func, // Called when hovered over
      onEditSection: PropTypes.func,
      onSummarizeSegment: PropTypes.func
    }
  }

  handleClick = (ev: any) => {
    // Ignore blanks
    const cell = this.props.layout.rows[this.props.rowIndex].cells[this.props.columnIndex]
    if (!cell.section) {
      return
    }

    // Ignore unconfigured cells
    if (cell.unconfigured) {
      return
    }

    if (this.props.onEditSection) {
      return this.props.onEditSection()
    }
  }

  // Gets cell component
  getTdComponent() {
    return this.tdComponent
  }

  // Render an unconfigured cell
  renderUnconfigured(cell: any) {
    return R(
      "span",
      { style: { fontSize: "90%" } },
      R("a", { style: { cursor: "pointer" }, onClick: this.props.onEditSection }, "Edit"),
      cell.summarize
        ? [
            R("span", { className: "text-muted" }, " / "),
            R("a", { style: { cursor: "pointer" }, onClick: this.props.onSummarizeSegment }, "Summarize")
          ]
        : undefined
    )
  }

  render() {
    const cell = this.props.layout.rows[this.props.rowIndex].cells[this.props.columnIndex]

    if (cell.skip) {
      return null
    }

    const isHover = this.props.hoverSection && cell.section === this.props.hoverSection

    // Determine background color
    let backgroundColor = cell.unconfigured && this.props.onEditSection ? "#eff5fb" : cell.backgroundColor || null

    if (isHover) {
      backgroundColor = Color(backgroundColor || "#ffffff").darken(0.03)
    }

    // Add striping
    if (
      this.props.layout.striping === "columns" &&
      ["column", "intersection"].includes(cell.type) &&
      this.props.columnIndex % 2 === 0
    ) {
      backgroundColor = Color(backgroundColor || "#ffffff").darken(0.03)
    } else if (
      this.props.layout.striping === "rows" &&
      ["row", "intersection"].includes(cell.type) &&
      this.props.rowIndex % 2 === 0
    ) {
      backgroundColor = Color(backgroundColor || "#ffffff").darken(0.03)
    }

    const borderWeights = [null, "solid 1px #f4f4f4", "solid 1px #ccc", "solid 1px #888"]

    // Collapsed borders mean that weights need to be combined for adjacent cells
    const borderBottom = Math.max(
      cell.borderBottom || 0,
      this.props.layout.rows[this.props.rowIndex + 1]?.cells[this.props.columnIndex].borderTop || 0
    )
    const borderRight = Math.max(
      cell.borderRight || 0,
      this.props.layout.rows[this.props.rowIndex].cells[this.props.columnIndex + 1]?.borderLeft || 0
    )

    let textColor = null

    if (backgroundColor) {
      const c = Color(backgroundColor)
      textColor = (c.red() + c.green() + c.blue()) / 765 < 0.5 ? "rgb(204,204,204)" : undefined
    }

    const style = {
      backgroundColor,
      textAlign: cell.align,
      cursor: isHover && !cell.unconfigured ? "pointer" : undefined,
      color: textColor
    }
    const classes = classNames({
      cell: true,
      // List out borders in compact way to keep HTML smaller
      bt1: cell.borderTop === 1,
      bt2: cell.borderTop === 2,
      bt3: cell.borderTop === 3,
      bb1: cell.borderBottom === 1,
      bb2: cell.borderBottom === 2,
      bb3: cell.borderBottom === 3,
      bl1: cell.borderLeft === 1,
      bl2: cell.borderLeft === 2,
      bl3: cell.borderLeft === 3,
      br1: cell.borderRight === 1,
      br2: cell.borderRight === 2,
      br3: cell.borderRight === 3
    })

    // Style that should not affect popup menu
    const innerStyle = {
      fontWeight: cell.bold ? "bold" : undefined,
      fontStyle: cell.italic ? "italic" : undefined,
      marginLeft: cell.indent ? cell.indent * 5 : undefined
    }

    return R(
      "td",
      {
        ref: (c) => {
          return (this.tdComponent = c)
        },
        onMouseEnter: this.props.onHover,
        onClick: this.handleClick,
        className: classes,
        style,
        colSpan: cell.columnSpan || null,
        rowSpan: cell.rowSpan || null
      },
      R(
        "span",
        { style: innerStyle },
        cell.unconfigured && this.props.onEditSection
          ? this.renderUnconfigured(cell)
          : cell.text || "\u00A0\u00A0\u00A0"
      )
    )
  }
}
LayoutCellComponent.initClass() // Placeholder
