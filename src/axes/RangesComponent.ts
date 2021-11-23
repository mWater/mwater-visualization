import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import uuid from "uuid"
import update from "update-object"
import { LinkComponent } from "mwater-expressions-ui"
import AxisBuilder from "./AxisBuilder"
import NumberInputComponent from "react-library/lib/NumberInputComponent"
import ReorderableListComponent from "react-library/lib/reorderable/ReorderableListComponent"
import { AxisXform, AxisXformRange } from "./Axis"
import { Expr, Schema } from "mwater-expressions"

export interface RangesComponentProps {
  schema: Schema
  /** Expression for computing min/max */
  expr: Expr
  xform: AxisXform
  onChange: any
}

// Allows setting of ranges
export default class RangesComponent extends React.Component<RangesComponentProps> {
  handleRangeChange = (index: any, range: any) => {
    const ranges = this.props.xform.ranges!.slice()
    ranges[index] = range
    return this.props.onChange(update(this.props.xform, { ranges: { $set: ranges } }))
  }

  handleAddRange = () => {
    const ranges = this.props.xform.ranges!.slice()
    ranges.push({ id: uuid(), minOpen: false, maxOpen: true })
    return this.props.onChange(update(this.props.xform, { ranges: { $set: ranges } }))
  }

  handleRemoveRange = (index: any) => {
    const ranges = this.props.xform.ranges!.slice()
    ranges.splice(index, 1)
    return this.props.onChange(update(this.props.xform, { ranges: { $set: ranges } }))
  }

  renderRange = (range: any, index: any, connectDragSource: any, connectDragPreview: any, connectDropTarget: any) => {
    return R(RangeComponent, {
      key: range.id,
      range,
      onChange: this.handleRangeChange.bind(null, index),
      onRemove: this.handleRemoveRange.bind(null, index),
      connectDragSource,
      connectDragPreview,
      connectDropTarget
    })
  }

  handleReorder = (ranges: any) => {
    return this.props.onChange(update(this.props.xform, { ranges: { $set: ranges } }))
  }

  render() {
    return R(
      "div",
      null,
      R(
        "table",
        null,
        this.props.xform.ranges!.length > 0
          ? R(
              "thead",
              null,
              R(
                "tr",
                null,
                R("th", null, " "),
                R("th", { key: "min", colSpan: 2, style: { textAlign: "center" } }, "From"),
                R("th", { key: "and" }, ""),
                R("th", { key: "max", colSpan: 2, style: { textAlign: "center" } }, "To"),
                R("th", { key: "label", colSpan: 1, style: { textAlign: "center" } }, "Label"),
                R("th", { key: "remove" })
              )
            )
          : undefined,

        React.createElement(ReorderableListComponent, {
          items: this.props.xform.ranges!,
          onReorder: this.handleReorder,
          renderItem: this.renderRange,
          getItemId: (range: AxisXformRange) => range.id,
          element: R("tbody", null)
        })
      ),
      //          _.map @props.xform.ranges, (range, i) =>
      //            R RangeComponent, key: range.id, range: range, onChange: @handleRangeChange.bind(null, i), onRemove: @handleRemoveRange.bind(null, i)

      R(
        "button",
        { className: "btn btn-link btn-sm", type: "button", onClick: this.handleAddRange },
        R("span", { className: "fas fa-plus" }),
        " Add Range"
      )
    )
  }
}

interface RangeComponentProps {
  /** Range to edit */
  range: any
  onChange: any
  onRemove: any
  /** reorderable connector */
  connectDragSource: any
  /** reorderable connector */
  connectDragPreview: any
  connectDropTarget: any
}

// Single range (row)
class RangeComponent extends React.Component<RangeComponentProps> {
  handleMinOpenChange = (minOpen: any) => {
    return this.props.onChange(update(this.props.range, { minOpen: { $set: minOpen } }))
  }

  handleMaxOpenChange = (maxOpen: any) => {
    return this.props.onChange(update(this.props.range, { maxOpen: { $set: maxOpen } }))
  }

  render() {
    let placeholder = ""
    if (this.props.range.minValue != null) {
      if (this.props.range.minOpen) {
        placeholder = `> ${this.props.range.minValue}`
      } else {
        placeholder = `>= ${this.props.range.minValue}`
      }
    }

    if (this.props.range.maxValue != null) {
      if (placeholder) {
        placeholder += " and "
      }
      if (this.props.range.maxOpen) {
        placeholder += `< ${this.props.range.maxValue}`
      } else {
        placeholder += `<= ${this.props.range.maxValue}`
      }
    }

    return this.props.connectDragPreview(
      this.props.connectDropTarget(
        R(
          "tr",
          null,
          R("td", null, this.props.connectDragSource(R("span", { className: "fa fa-bars" }))),
          R(
            "td",
            { key: "minOpen" },
            R(
              LinkComponent,
              {
                dropdownItems: [
                  { id: true, name: "greater than" },
                  { id: false, name: "greater than or equal to" }
                ],
                onDropdownItemClicked: this.handleMinOpenChange
              },
              this.props.range.minOpen ? "greater than" : "greater than or equal to"
            )
          ),

          R(
            "td",
            { key: "minValue" },
            R(NumberInputComponent, {
              value: this.props.range.minValue,
              placeholder: "None",
              small: true,
              onChange: (v: any) => this.props.onChange(update(this.props.range, { minValue: { $set: v } }))
            })
          ),

          R("td", { key: "and" }, "\u00A0and\u00A0"),

          R(
            "td",
            { key: "maxOpen" },
            R(
              LinkComponent,
              {
                dropdownItems: [
                  { id: true, name: "less than" },
                  { id: false, name: "less than or equal to" }
                ],
                onDropdownItemClicked: this.handleMaxOpenChange
              },
              this.props.range.maxOpen ? "less than" : "less than or equal to"
            )
          ),

          R(
            "td",
            { key: "maxValue" },
            R(NumberInputComponent, {
              value: this.props.range.maxValue,
              placeholder: "None",
              small: true,
              onChange: (v: any) => this.props.onChange(update(this.props.range, { maxValue: { $set: v } }))
            })
          ),

          R(
            "td",
            { key: "label" },
            R("input", {
              type: "text",
              className: "form-control form-control-sm",
              value: this.props.range.label || "",
              placeholder,
              onChange: (ev: any) =>
                this.props.onChange(update(this.props.range, { label: { $set: ev.target.value || null } }))
            })
          ),

          R(
            "td",
            { key: "remove" },
            R(
              "button",
              { className: "btn btn-sm btn-link", type: "button", onClick: this.props.onRemove },
              R("span", { className: "fas fa-times" })
            )
          )
        )
      )
    )
  }
}
