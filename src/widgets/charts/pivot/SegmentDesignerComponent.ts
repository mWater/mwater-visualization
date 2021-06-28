import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import ui from "react-library/lib/bootstrap"
import AxisComponent from "../../../axes/AxisComponent"
import ColorComponent from "../../../ColorComponent"
import { ExprComponent } from "mwater-expressions-ui"
import { FilterExprComponent } from "mwater-expressions-ui"

interface SegmentDesignerComponentProps {
  segment: any
  table: string
  schema: any
  dataSource: any
  /** "row" or "column" */
  segmentType: string
  onChange: any
  filters?: any
}

interface SegmentDesignerComponentState {
  mode: any
}

// Design a single segment of a pivot table
export default class SegmentDesignerComponent extends React.Component<
  SegmentDesignerComponentProps,
  SegmentDesignerComponentState
> {
  constructor(props: any) {
    super(props)

    this.state = {
      // Mode switcher to make UI clearer
      mode:
        props.segment.label == null && !props.segment.valueAxis ? null : props.segment.valueAxis ? "multiple" : "single"
    }
  }

  componentDidMount() {
    return this.labelElem?.focus()
  }

  // Updates segment with the specified changes
  update(changes: any) {
    const segment = _.extend({}, this.props.segment, changes)
    return this.props.onChange(segment)
  }

  handleSingleMode = () => {
    this.update({ valueAxis: null })
    return this.setState({ mode: "single" })
  }

  handleMultipleMode = () => {
    return this.setState({ mode: "multiple" })
  }

  handleValueAxisChange = (valueAxis: any) => {
    return this.update({ valueAxis })
  }

  handleLabelChange = (ev: any) => {
    return this.update({ label: ev.target.value })
  }

  handleFilterChange = (filter: any) => {
    return this.update({ filter })
  }

  handleOrderExprChange = (orderExpr: any) => {
    return this.update({ orderExpr })
  }

  handleOrderDirChange = (orderDir: any) => {
    return this.update({ orderDir })
  }

  renderMode() {
    return R(
      ui.FormGroup,
      {
        labelMuted: true,
        label: "Type"
      },
      R(
        "div",
        { key: "single", className: "radio" },
        R(
          "label",
          null,
          R("input", { type: "radio", checked: this.state.mode === "single", onChange: this.handleSingleMode }),
          `Single ${this.props.segmentType}`,
          R(
            "span",
            { className: "text-muted" },
            ` - used for summary ${this.props.segmentType}s and empty ${this.props.segmentType}s`
          )
        )
      ),

      R(
        "div",
        { key: "multiple", className: "radio" },
        R(
          "label",
          null,
          R("input", { type: "radio", checked: this.state.mode === "multiple", onChange: this.handleMultipleMode }),
          `Multiple ${this.props.segmentType}s`,
          R("span", { className: "text-muted" }, " - disaggregate data by a field")
        )
      )
    )
  }

  renderLabel() {
    return R(
      ui.FormGroup,
      {
        labelMuted: true,
        label: "Label",
        help: this.state.mode === "multiple" ? `Optional label for the ${this.props.segmentType}s` : undefined
      },
      R("input", {
        ref: (elem: any) => {
          return (this.labelElem = elem)
        },
        type: "text",
        className: "form-control",
        value: this.props.segment.label || "",
        onChange: this.handleLabelChange
      })
    )
  }

  renderValueAxis() {
    return R(
      ui.FormGroup,
      {
        labelMuted: true,
        label: "Field",
        help: "Field to disaggregate data by"
      },
      R(
        "div",
        { style: { marginLeft: 8 } },
        R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.table,
          types: ["enum", "text", "boolean", "date"],
          aggrNeed: "none",
          value: this.props.segment.valueAxis,
          onChange: this.handleValueAxisChange,
          allowExcludedValues: true,
          filters: this.props.filters
        })
      )
    )
  }

  renderFilter() {
    return R(
      ui.FormGroup,
      {
        labelMuted: true,
        label: [R(ui.Icon, { id: "glyphicon-filter" }), " Filters"],
        hint: `Filters all data associated with this ${this.props.segmentType}`
      },
      R(FilterExprComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        onChange: this.handleFilterChange,
        table: this.props.table,
        value: this.props.segment.filter
      })
    )
  }

  renderStyling() {
    return R(
      ui.FormGroup,
      {
        labelMuted: true,
        label: "Styling"
      },
      R(
        "label",
        { className: "checkbox-inline", key: "bold" },
        R("input", {
          type: "checkbox",
          checked: this.props.segment.bold === true,
          onChange: (ev) => this.update({ bold: ev.target.checked })
        }),
        "Bold"
      ),
      R(
        "label",
        { className: "checkbox-inline", key: "italic" },
        R("input", {
          type: "checkbox",
          checked: this.props.segment.italic === true,
          onChange: (ev) => this.update({ italic: ev.target.checked })
        }),
        "Italic"
      ),
      this.props.segment.valueAxis && this.props.segment.label
        ? R(
            "label",
            { className: "checkbox-inline", key: "valueLabelBold" },
            R("input", {
              type: "checkbox",
              checked: this.props.segment.valueLabelBold === true,
              onChange: (ev) => this.update({ valueLabelBold: ev.target.checked })
            }),
            "Header Bold"
          )
        : undefined,
      this.props.segment.valueAxis && this.props.segment.label
        ? R(
            "div",
            { style: { paddingTop: 5 } },
            "Shade filler cells: ",
            R(ColorComponent, {
              color: this.props.segment.fillerColor,
              onChange: (color: any) => this.update({ fillerColor: color })
            })
          )
        : undefined
    )
  }

  renderBorders() {
    return R(
      ui.FormGroup,
      {
        labelMuted: true,
        label: "Borders"
      },
      R("div", { key: "before" }, this.props.segmentType === "row" ? "Top: " : "Left: "),
      R(BorderComponent, {
        value: this.props.segment.borderBefore,
        defaultValue: 2,
        onChange: (value: any) => this.update({ borderBefore: value })
      }),
      R("div", { key: "within" }, "Within: "),
      R(BorderComponent, {
        value: this.props.segment.borderWithin,
        defaultValue: 1,
        onChange: (value: any) => this.update({ borderWithin: value })
      }),
      R("div", { key: "after" }, this.props.segmentType === "row" ? "Bottom: " : "Right: "),
      R(BorderComponent, {
        value: this.props.segment.borderAfter,
        defaultValue: 2,
        onChange: (value: any) => this.update({ borderAfter: value })
      })
    )
  }

  renderOrderExpr() {
    return R(
      ui.FormGroup,
      {
        labelMuted: true,
        label: [R(ui.Icon, { id: "fa-sort-amount-asc" }), " Sort"],
        hint: `Sorts the display of this ${this.props.segmentType}`
      },
      R(ExprComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        onChange: this.handleOrderExprChange,
        table: this.props.table,
        types: ["enum", "text", "boolean", "date", "datetime", "number"],
        aggrStatuses: ["aggregate"],
        value: this.props.segment.orderExpr
      }),

      this.props.segment.orderExpr
        ? R(
            "div",
            null,
            R(
              ui.Radio,
              {
                value: this.props.segment.orderDir || "asc",
                radioValue: "asc",
                onChange: this.handleOrderDirChange,
                inline: true
              },
              "Ascending"
            ),
            R(
              ui.Radio,
              {
                value: this.props.segment.orderDir || "asc",
                radioValue: "desc",
                onChange: this.handleOrderDirChange,
                inline: true
              },
              "Descending"
            )
          )
        : undefined
    )
  }

  render() {
    return R(
      "div",
      null,
      this.renderMode(),
      this.state.mode ? this.renderLabel() : undefined,
      this.state.mode === "multiple" ? this.renderValueAxis() : undefined,
      this.state.mode ? this.renderFilter() : undefined,
      this.state.mode === "multiple" ? this.renderOrderExpr() : undefined,
      this.state.mode ? this.renderStyling() : undefined,
      this.state.mode ? this.renderBorders() : undefined
    )
  }
}

interface BorderComponentProps {
  value?: number
  defaultValue?: number
  onChange: any
}

// Allows setting border heaviness
class BorderComponent extends React.Component<BorderComponentProps> {
  render() {
    const value = this.props.value != null ? this.props.value : this.props.defaultValue

    return R(
      "span",
      null,
      R(
        "label",
        { className: "radio-inline" },
        R("input", { type: "radio", checked: value === 0, onClick: () => this.props.onChange(0) }),
        "None"
      ),
      R(
        "label",
        { className: "radio-inline" },
        R("input", { type: "radio", checked: value === 1, onClick: () => this.props.onChange(1) }),
        "Light"
      ),
      R(
        "label",
        { className: "radio-inline" },
        R("input", { type: "radio", checked: value === 2, onClick: () => this.props.onChange(2) }),
        "Medium"
      ),
      R(
        "label",
        { className: "radio-inline" },
        R("input", { type: "radio", checked: value === 3, onClick: () => this.props.onChange(3) }),
        "Heavy"
      )
    )
  }
}
