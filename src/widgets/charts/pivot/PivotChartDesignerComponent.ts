// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let PivotChartDesignerComponent
import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import uuid from "uuid"
import ui from "react-library/lib/bootstrap"
import { FilterExprComponent } from "mwater-expressions-ui"
import TableSelectComponent from "../../../TableSelectComponent"
import AxisComponent from "../../../axes/AxisComponent"

// Designer for overall chart. Has a special setup mode first time it is run
export default PivotChartDesignerComponent = (function () {
  PivotChartDesignerComponent = class PivotChartDesignerComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        design: PropTypes.object.isRequired,
        schema: PropTypes.object.isRequired,
        dataSource: PropTypes.object.isRequired,
        onDesignChange: PropTypes.func.isRequired,
        filters: PropTypes.array
      }
      // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    }

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
        { className: "form-group" },
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
        { className: "form-group" },
        R("label", { className: "text-muted" }, R("span", { className: "glyphicon glyphicon-filter" }), " ", "Filters"),
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
        R(
          "label",
          { key: "none", className: "radio-inline" },
          R("input", {
            type: "radio",
            checked: !this.props.design.striping,
            onClick: () => this.updateDesign({ striping: null })
          }),
          "None"
        ),

        R(
          "label",
          { key: "columns", className: "radio-inline" },
          R("input", {
            type: "radio",
            checked: this.props.design.striping === "columns",
            onClick: () => this.updateDesign({ striping: "columns" })
          }),
          "Columns"
        ),

        R(
          "label",
          { key: "rows", className: "radio-inline" },
          R("input", {
            type: "radio",
            checked: this.props.design.striping === "rows",
            onClick: () => this.updateDesign({ striping: "rows" })
          }),
          "Rows"
        )
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
  PivotChartDesignerComponent.initClass()
  return PivotChartDesignerComponent
})()
