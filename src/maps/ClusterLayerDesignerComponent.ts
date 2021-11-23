import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { FilterExprComponent } from "mwater-expressions-ui"
import { DataSource, ExprUtils, Schema } from "mwater-expressions"
import { ExprCompiler } from "mwater-expressions"
import AxisComponent from "./../axes/AxisComponent"
import ColorComponent from "../ColorComponent"
import TableSelectComponent from "../TableSelectComponent"
import ZoomLevelsComponent from "./ZoomLevelsComponent"

export interface ClusterLayerDesignerComponentProps {
  /** Schema to use */
  schema: Schema
  dataSource: DataSource
  /** Design of the design */
  design: any
  /** Called with new design */
  onDesignChange: any
  filters?: any
}

export default class ClusterLayerDesignerComponent extends React.Component<ClusterLayerDesignerComponentProps> {
  // Apply updates to design
  update(updates: any) {
    return this.props.onDesignChange(_.extend({}, this.props.design, updates))
  }

  // Update axes with specified changes
  updateAxes(changes: any) {
    const axes = _.extend({}, this.props.design.axes, changes)
    return this.update({ axes })
  }

  handleTableChange = (table: any) => {
    return this.update({ table })
  }
  handleGeometryAxisChange = (axis: any) => {
    return this.updateAxes({ geometry: axis })
  }
  handleFilterChange = (expr: any) => {
    return this.update({ filter: expr })
  }
  handleTextColorChange = (color: any) => {
    return this.update({ textColor: color })
  }
  handleFillColorChange = (color: any) => {
    return this.update({ fillColor: color })
  }

  renderTable() {
    return R(
      "div",
      { className: "mb-3" },
      R("label", { className: "text-muted" }, R("i", { className: "fa fa-database" }), " ", "Data Source"),
      R(
        "div",
        { style: { marginLeft: 10 } },
        R(TableSelectComponent, {
          schema: this.props.schema,
          value: this.props.design.table,
          onChange: this.handleTableChange,
          filter: this.props.design.filter,
          onFilterChange: this.handleFilterChange
        })
      )
    )
  }

  renderGeometryAxis() {
    if (!this.props.design.table) {
      return
    }

    const title = R("span", null, R("span", { className: "fas fa-map-marker-alt" }), " Locations to Cluster")

    const filters = _.clone(this.props.filters) || []

    if (this.props.design.filter != null) {
      const exprCompiler = new ExprCompiler(this.props.schema)
      const jsonql = exprCompiler.compileExpr({ expr: this.props.design.filter, tableAlias: "{alias}" })
      if (jsonql) {
        filters.push({ table: this.props.design.filter.table, jsonql })
      }
    }

    return R(
      "div",
      { className: "mb-3" },
      R("label", { className: "text-muted" }, title),
      R(
        "div",
        { style: { marginLeft: 10 } },
        React.createElement(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.design.table,
          types: ["geometry"],
          aggrNeed: "none",
          value: this.props.design.axes.geometry,
          onChange: this.handleGeometryAxisChange,
          filters
        })
      )
    )
  }

  renderTextColor() {
    if (!this.props.design.axes.geometry) {
      return
    }

    return R(
      "div",
      { className: "mb-3" },
      R("label", { className: "text-muted" }, R("span", { className: "fas fa-tint" }), "Text Color"),

      R(
        "div",
        null,
        R(ColorComponent, {
          color: this.props.design.textColor,
          onChange: this.handleTextColorChange
        })
      )
    )
  }

  renderFillColor() {
    if (!this.props.design.axes.geometry) {
      return
    }

    return R(
      "div",
      { className: "mb-3" },
      R("label", { className: "text-muted" }, R("span", { className: "fas fa-tint" }), "Marker Color"),

      R(
        "div",
        null,
        R(ColorComponent, {
          color: this.props.design.fillColor,
          onChange: this.handleFillColorChange
        })
      )
    )
  }

  renderFilter() {
    // If no data, hide
    if (!this.props.design.axes.geometry) {
      return null
    }

    return R(
      "div",
      { className: "mb-3" },
      R("label", { className: "text-muted" }, R("span", { className: "fas fa-filter" }), " Filters"),
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

  render() {
    return R(
      "div",
      null,
      this.renderTable(),
      this.renderGeometryAxis(),
      this.renderTextColor(),
      this.renderFillColor(),
      this.renderFilter(),
      this.props.design.table
        ? R(ZoomLevelsComponent, { design: this.props.design, onDesignChange: this.props.onDesignChange })
        : undefined
    )
  }
}
