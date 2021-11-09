import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import uuid from "uuid"
import * as ui from "react-library/lib/bootstrap"
import { FilterExprComponent } from "mwater-expressions-ui"
import TableSelectComponent from "../../../TableSelectComponent"
import AxisComponent from "../../../axes/AxisComponent"
import { DataSource, Schema } from "mwater-expressions"

interface PivotChartDesignerComponentProps {
  design: any
  schema: Schema
  dataSource: DataSource
  onDesignChange: any
  filters?: any
}

interface PivotChartDesignerComponentState {
  isNew: any
}

// Designer for overall chart. Has a special setup mode first time it is run
export default class PivotChartDesignerComponent extends React.Component<
  PivotChartDesignerComponentProps,
  PivotChartDesignerComponentState
> {
  constructor(props: any) {
    super(props)

    this.state = {
      isNew: !props.design.table // True if new pivot table
    }
  }

  // Updates design with the specified changes
  updateDesign(changes: any) {
    const design = _.extend({}, this.props.design, changes)
    return this.props.onDesignChange(design)
  }

  handleTableChange = (table: any) => {
    // Create default
    const row = { id: uuid(), label: "" }
    const column = { id: uuid(), label: "" }

    const intersections = {}
    intersections[`${row.id}:${column.id}`] = { valueAxis: { expr: { type: "op", op: "count", table, exprs: [] } } }

    return this.updateDesign({
      table,
      rows: [row],
      columns: [column],
      intersections
    })
  }

  handleColumnChange = (axis: any) => {
    return this.updateDesign({ columns: [_.extend({}, this.props.design.columns[0], { valueAxis: axis })] })
  }

  handleRowChange = (axis: any) => {
    return this.updateDesign({ rows: [_.extend({}, this.props.design.rows[0], { valueAxis: axis })] })
  }

  handleFilterChange = (filter: any) => {
    return this.updateDesign({ filter })
  }

  handleIntersectionValueAxisChange = (valueAxis: any) => {
    const intersectionId = `${this.props.design.rows[0].id}:${this.props.design.columns[0].id}`

    const intersections = {}
    intersections[intersectionId] = { valueAxis }
    return this.updateDesign({ intersections })
  }

  renderTable() {
    return R(
      "div",
      { className: "mb-3" },
      R("label", { className: "text-muted" }, R("i", { className: "fa fa-database" }), " ", "Data Source"),
      ": ",
      R(TableSelectComponent, {
        schema: this.props.schema,
        value: this.props.design.table,
        onChange: this.handleTableChange,
        filter: this.props.design.filter,
        onFilterChange: this.handleFilterChange
      })
    )
  }

  renderFilter() {
    // If no table, hide
    if (!this.props.design.table) {
      return null
    }

    return R(
      "div",
      { className: "mb-3" },
      R("label", { className: "text-muted" }, R("span", { className: "fas fa-filter" }), " ", "Filters"),
      R(
        "div",
        { style: { marginLeft: 8 } },
        R(FilterExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onChange: this.handleFilterChange,
          table: this.props.design.table,
          value: this.props.design.filter
        })
      )
    )
  }

  renderStriping() {
    // If no table, hide
    if (!this.props.design.table) {
      return null
    }

    return R(
      ui.FormGroup,
      {
        labelMuted: true,
        label: "Striping"
      },
      <ui.Radio
        key="none"
        inline
        radioValue={null}
        value={this.props.design.striping || null}
        onChange={(value) => this.updateDesign({ striping: value })}
      >
        None
      </ui.Radio>,

      <ui.Radio
        key="columns"
        inline
        radioValue={"columns"}
        value={this.props.design.striping}
        onChange={(value) => this.updateDesign({ striping: value })}
      >
        Columns
      </ui.Radio>,

      <ui.Radio
        key="rows"
        inline
        value={this.props.design.striping}
        radioValue={"rows"}
        onChange={(value) => this.updateDesign({ striping: value })}
      >
        Rows
      </ui.Radio>
    )
  }

  // Show setup options
  renderSetup() {
    const intersectionId = `${this.props.design.rows[0].id}:${this.props.design.columns[0].id}`

    return R(
      "div",
      null,
      R(
        ui.FormGroup,
        {
          labelMuted: true,
          label: "Columns",
          help: "Field to optionally make columns out of"
        },
        R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.design.table,
          types: ["enum", "text", "boolean", "date"],
          aggrNeed: "none",
          value: this.props.design.columns[0].valueAxis,
          onChange: this.handleColumnChange,
          filters: this.props.filters
        })
      ),

      R(
        ui.FormGroup,
        {
          labelMuted: true,
          label: "Rows",
          help: "Field to optionally make rows out of"
        },
        R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.design.table,
          types: ["enum", "text", "boolean", "date"],
          aggrNeed: "none",
          value: this.props.design.rows[0].valueAxis,
          onChange: this.handleRowChange,
          filters: this.props.filters
        })
      ),

      R(
        ui.FormGroup,
        {
          labelMuted: true,
          label: "Value",
          help: "Field show in cells"
        },
        R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.design.table,
          types: ["enum", "text", "boolean", "date", "number"],
          aggrNeed: "required",
          value: this.props.design.intersections[intersectionId].valueAxis,
          onChange: this.handleIntersectionValueAxisChange,
          showFormat: true,
          filters: this.props.filters
        })
      )
    )
  }

  render() {
    return R(
      "div",
      null,
      this.renderTable(),
      this.state.isNew && this.props.design.table ? this.renderSetup() : undefined,
      this.renderFilter(),
      this.renderStriping()
    )
  }
}
