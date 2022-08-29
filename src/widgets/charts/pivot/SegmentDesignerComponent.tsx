import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import * as ui from "react-library/lib/bootstrap"
import AxisComponent from "../../../axes/AxisComponent"
import ColorComponent from "../../../ColorComponent"
import { ExprComponent } from "mwater-expressions-ui"
import { FilterExprComponent } from "mwater-expressions-ui"
import { Radio } from "react-library/lib/bootstrap"
import { DataSource, Schema } from "mwater-expressions"
import { AxisBuilder } from "../../.."
import { PivotChartSegment } from "./PivotChartDesign"
import PopoverHelpComponent from "react-library/lib/PopoverHelpComponent"

export interface SegmentDesignerComponentProps {
  segment: PivotChartSegment
  table: string
  schema: Schema
  dataSource: DataSource
  /** "row" or "column" */
  segmentType: "row" | "column"
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
  labelElem: HTMLInputElement | null

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

  handleMode = (mode: any) => {
    this.update({ valueAxis: null })
    return this.setState({ mode })
  }

  handleValueAxisChange = (valueAxis: any) => {
    return this.update({ valueAxis })
  }

  handleValueAxisOnlyValuesPresentChange = (valueAxisOnlyValuesPresent: boolean) => {
    return this.update({ valueAxisOnlyValuesPresent })
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
      <ui.Radio key="single" value={this.state.mode} radioValue={"single"} onChange={this.handleMode}>
        {`Single ${this.props.segmentType}`}
        <span className="text-muted">
          {` - used for summary ${this.props.segmentType}s and empty ${this.props.segmentType}s`}
        </span>
      </ui.Radio>,

      <ui.Radio key="multiple" value={this.state.mode} radioValue={"multiple"} onChange={this.handleMode}>
        {`Multiple ${this.props.segmentType}s`}
        <span className="text-muted">{` - disaggregate data by a field`}</span>
      </ui.Radio>
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
        ref: (elem: HTMLInputElement | null) => {
          this.labelElem = elem
        },
        type: "text",
        className: "form-control",
        value: this.props.segment.label || "",
        onChange: this.handleLabelChange
      })
    )
  }

  renderValueAxis() {
    // Get type of axis
    const axisBuilder = new AxisBuilder({ schema: this.props.schema })

    const axisType = axisBuilder.getAxisType(this.props.segment.valueAxis)
    const allowValueAxisOnlyValuesPresent = axisType == "enum" || axisType == "enumset" || axisType == "date"

    return <ui.FormGroup labelMuted label="Field" help="Field to disaggregate data by">
      <div style={{ marginLeft: 8 }}>
        {
          R(AxisComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.table,
            types: ["enum", "text", "boolean", "date"],
            aggrNeed: "none",
            value: this.props.segment.valueAxis,
            onChange: this.handleValueAxisChange,
            allowExcludedValues: true,
            filters: this.props.filters,
            collapseCategories: true
          })
        }
        { allowValueAxisOnlyValuesPresent ?
          <ui.Checkbox
            value={this.props.segment.valueAxisOnlyValuesPresent}
            onChange={this.handleValueAxisOnlyValuesPresentChange}
          >
            Only show values actually present&nbsp;
            <PopoverHelpComponent placement="bottom">
              Limits values to those that are present in the data, as opposed
              to all choices or all dates within range
            </PopoverHelpComponent>
          </ui.Checkbox>
        : null }
      </div>
    </ui.FormGroup>
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
      <div>
        <ui.Checkbox
          key="bold"
          inline
          value={this.props.segment.bold === true}
          onChange={(value) => this.update({ bold: value })}
        >
          Bold
        </ui.Checkbox>
        <ui.Checkbox
          key="italic"
          inline
          value={this.props.segment.italic === true}
          onChange={(value) => this.update({ italic: value })}
        >
          Italic
        </ui.Checkbox>
        { this.props.segment.valueAxis && this.props.segment.label ? 
        <ui.Checkbox
          key="valueLabelBold"
          inline
          value={this.props.segment.valueLabelBold === true}
          onChange={(value) => this.update({ valueLabelBold: value })}
        >
          Header Bold
        </ui.Checkbox>
        : undefined}
        {this.props.segment.valueAxis && this.props.segment.label
          ? R(
              "div",
              { style: { paddingTop: 5 } },
              "Shade filler cells: ",
              R(ColorComponent, {
                color: this.props.segment.fillerColor,
                onChange: (color: any) => this.update({ fillerColor: color })
              })
            )
          : undefined}
      </div>
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
        value: this.props.segment.orderExpr ?? null
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
      <Radio inline value={value} radioValue={0} onChange={() => this.props.onChange(0)}>
        None
      </Radio>,
      <Radio inline value={value} radioValue={1} onChange={() => this.props.onChange(1)}>
        Light
      </Radio>,
      <Radio inline value={value} radioValue={2} onChange={() => this.props.onChange(2)}>
        Medium
      </Radio>,
      <Radio inline value={value} radioValue={3} onChange={() => this.props.onChange(3)}>
        Heavy
      </Radio>
    )
  }
}
