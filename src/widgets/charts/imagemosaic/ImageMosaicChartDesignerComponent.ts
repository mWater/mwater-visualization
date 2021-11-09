import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import * as ui from "../../../UIComponents"
import { DataSource, ExprUtils, Schema } from "mwater-expressions"
import AxisBuilder from "../../../axes/AxisBuilder"
import AxisComponent from "../../../axes/AxisComponent"
import { FilterExprComponent } from "mwater-expressions-ui"
import TableSelectComponent from "../../../TableSelectComponent"

interface ImageMosaicChartDesignerComponentProps {
  design: any
  schema: Schema
  dataSource: DataSource
  onDesignChange: any
  filters?: any
}

export default class ImageMosaicChartDesignerComponent extends React.Component<ImageMosaicChartDesignerComponentProps> {
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
  handleImageAxisChange = (imageAxis: any) => {
    return this.updateDesign({ imageAxis })
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

  renderTitle() {
    return R(
      "div",
      { className: "mb-3" },
      R("label", { className: "text-muted" }, "Title"),
      R("input", {
        type: "text",
        className: "form-control form-control-sm",
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
      { className: "mb-3" },
      R("label", { className: "text-muted" }, R("span", { className: "fas fa-filter" }), " ", "Filters"),
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

  renderImageAxis() {
    if (!this.props.design.table) {
      return
    }

    return R(
      ui.SectionComponent,
      { label: "Image Axis" },
      R(AxisComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        table: this.props.design.table,
        types: ["image", "imagelist"],
        aggrNeed: "none",
        required: true,
        value: this.props.design.imageAxis,
        onChange: this.handleImageAxisChange,
        filters: this.props.filters
      })
    )
  }

  render() {
    return R("div", null, this.renderTable(), this.renderImageAxis(), this.renderFilter(), R("hr"), this.renderTitle())
  }
}
