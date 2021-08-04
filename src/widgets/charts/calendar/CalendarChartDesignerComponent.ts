import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import * as ui from "../../../UIComponents"
import { ExprUtils } from "mwater-expressions"
import AxisBuilder from "../../../axes/AxisBuilder"
import AxisComponent from "../../../axes/AxisComponent"
import { FilterExprComponent } from "mwater-expressions-ui"
import TableSelectComponent from "../../../TableSelectComponent"

interface CalendarChartDesignerComponentProps {
  design: any
  schema: any
  dataSource: any
  onDesignChange: any
  filters?: any
}

export default class CalendarChartDesignerComponent extends React.Component<CalendarChartDesignerComponentProps> {
  // Updates design with the specified changes
  updateDesign(changes: any) {
    const design = _.extend({}, this.props.design, changes)
    return this.props.onDesignChange(design)
  }

  handleTitleTextChange = (ev: any) => {
    return this.updateDesign({ titleText: ev.target.value })
  }
  handleTableChange = (table: any) => {
    return this.updateDesign({ table })
  }
  handleFilterChange = (filter: any) => {
    return this.updateDesign({ filter })
  }

  handleDateAxisChange = (dateAxis: any) => {
    // Default value axis to count if date axis present
    if (!this.props.design.valueAxis && dateAxis) {
      // Create count expr
      const valueAxis = { expr: { type: "op", op: "count", table: this.props.design.table, exprs: [] }, xform: null }
      return this.updateDesign({ dateAxis, valueAxis })
    } else {
      return this.updateDesign({ dateAxis })
    }
  }

  handleValueAxisChange = (valueAxis: any) => {
    return this.updateDesign({ valueAxis })
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

  renderTitle() {
    return R(
      "div",
      { className: "form-group" },
      R("label", { className: "text-muted" }, "Title"),
      R("input", {
        type: "text",
        className: "form-control input-sm",
        value: this.props.design.titleText,
        onChange: this.handleTitleTextChange,
        placeholder: "Untitled"
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
        React.createElement(FilterExprComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          onChange: this.handleFilterChange,
          table: this.props.design.table,
          value: this.props.design.filter
        })
      )
    )
  }

  renderDateAxis() {
    if (!this.props.design.table) {
      return
    }

    return R(
      ui.SectionComponent,
      { label: "Date Axis" },
      R(AxisComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        table: this.props.design.table,
        types: ["date"],
        aggrNeed: "none",
        required: true,
        value: this.props.design.dateAxis,
        onChange: this.handleDateAxisChange,
        filters: this.props.filter
      })
    )
  }

  renderValueAxis() {
    if (!this.props.design.table || !this.props.design.dateAxis) {
      return
    }

    return R(
      ui.SectionComponent,
      { label: "Value Axis" },
      R(AxisComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        table: this.props.design.table,
        types: ["number"],
        aggrNeed: "required",
        required: true,
        value: this.props.design.valueAxis,
        onChange: this.handleValueAxisChange,
        filters: this.props.filter
      })
    )
  }

  render() {
    return R(
      "div",
      null,
      this.renderTable(),
      this.renderDateAxis(),
      this.renderValueAxis(),
      this.renderFilter(),
      R("hr"),
      this.renderTitle()
    )
  }
}