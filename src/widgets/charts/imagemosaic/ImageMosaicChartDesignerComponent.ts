// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let ImageMosaicChartDesignerComponent
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

export default ImageMosaicChartDesignerComponent = (function () {
  ImageMosaicChartDesignerComponent = class ImageMosaicChartDesignerComponent extends React.Component {
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
      return R(
        "div",
        null,
        this.renderTable(),
        this.renderImageAxis(),
        this.renderFilter(),
        R("hr"),
        this.renderTitle()
      )
    }
  }
  ImageMosaicChartDesignerComponent.initClass()
  return ImageMosaicChartDesignerComponent
})()
