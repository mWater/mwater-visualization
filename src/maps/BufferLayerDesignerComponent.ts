import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import { FilterExprComponent } from "mwater-expressions-ui"
import { DataSource, ExprUtils, OpExpr, Schema } from "mwater-expressions"
import { ExprCompiler } from "mwater-expressions"
import NumberInputComponent from "react-library/lib/NumberInputComponent"
import AxisComponent from "./../axes/AxisComponent"
import ColorComponent from "../ColorComponent"
import TableSelectComponent from "../TableSelectComponent"
import { default as Rcslider } from "rc-slider"
import EditPopupComponent from "./EditPopupComponent"
import ZoomLevelsComponent from "./ZoomLevelsComponent"
import * as PopupFilterJoinsUtils from "./PopupFilterJoinsUtils"
import { Checkbox } from "react-library/lib/bootstrap"
import { BufferLayerDesign } from "./BufferLayerDesign"
import { JsonQLFilter } from "../JsonQLFilter"
import { areVectorMapsEnabled } from "./vectorMaps"

export interface BufferLayerDesignerComponentProps {
  /** Schema to use */
  schema: Schema
  dataSource: DataSource
  /** Design of the design */
  design: BufferLayerDesign
  /** Called with new design */
  onDesignChange: (design: BufferLayerDesign) => void
  filters?: JsonQLFilter[]
}

export default class BufferLayerDesignerComponent extends React.Component<BufferLayerDesignerComponentProps> {
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
  handleRadiusChange = (radius: any) => {
    return this.update({ radius })
  }
  handleGeometryAxisChange = (axis: any) => {
    return this.updateAxes({ geometry: axis })
  }
  handleFilterChange = (expr: any) => {
    return this.update({ filter: expr })
  }
  handleColorChange = (color: any) => {
    return this.update({ color })
  }
  handleColorAxisChange = (axis: any) => {
    return this.updateAxes({ color: axis })
  }
  handleFillOpacityChange = (fillOpacity: any) => {
    return this.update({ fillOpacity: fillOpacity / 100 })
  }

  handleUnionShapesChange = (unionShapes: boolean) => {
    this.props.onDesignChange({ ...this.props.design, unionShapes })
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

    const title = R("span", null, R("span", { className: "fas fa-map-marker-alt" }), " Circle Centers")

    const filters = _.clone(this.props.filters) || []

    if (this.props.design.filter != null) {
      const exprCompiler = new ExprCompiler(this.props.schema)
      const jsonql = exprCompiler.compileExpr({ expr: this.props.design.filter, tableAlias: "{alias}" })
      if (jsonql) {
        filters.push({ table: (this.props.design.filter as OpExpr).table!, jsonql })
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

  renderRadius() {
    return R(
      "div",
      { className: "mb-3" },
      R("label", { className: "text-muted" }, "Radius (meters)"),
      ": ",
      React.createElement(NumberInputComponent, {
        value: this.props.design.radius,
        onChange: this.handleRadiusChange
      })
    )
  }

  renderUnionShapes() {
    // Only implemented for vector maps
    if (!areVectorMapsEnabled()) {
      return null
    }

    return R(
      "div",
      { className: "mb-3" },
      React.createElement(Checkbox, {
        value: this.props.design.unionShapes,
        onChange: this.handleUnionShapesChange
      }, "Combine circles (advanced)")
    )
  }

  renderColor() {
    if (!this.props.design.axes.geometry) {
      return
    }

    const filters = _.clone(this.props.filters) || []

    if (this.props.design.filter != null) {
      const exprCompiler = new ExprCompiler(this.props.schema)
      const jsonql = exprCompiler.compileExpr({ expr: this.props.design.filter, tableAlias: "{alias}" })
      if (jsonql) {
        filters.push({ table: (this.props.design.filter as OpExpr).table!, jsonql })
      }
    }

    return R(
      "div",
      null,
      !this.props.design.axes.color
        ? R(
            "div",
            { className: "mb-3" },
            R("label", { className: "text-muted" }, R("span", { className: "fas fa-tint" }), "Circle Color"),

            R(
              "div",
              null,
              R(ColorComponent, {
                color: this.props.design.color,
                onChange: this.handleColorChange
              })
            )
          )
        : undefined,

      R(
        "div",
        { className: "mb-3" },
        R("label", { className: "text-muted" }, R("span", { className: "fas fa-tint" }), "Color By Data"),

        R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.design.table,
          types: ["text", "enum", "boolean", "date"],
          aggrNeed: "none",
          value: this.props.design.axes.color,
          defaultColor: this.props.design.color,
          showColorMap: true,
          onChange: this.handleColorAxisChange,
          allowExcludedValues: true,
          reorderable: true,
          filters
        })
      )
    )
  }

  renderFillOpacity() {
    return R(
      "div",
      { className: "mb-3" },
      R("label", { className: "text-muted" }, "Circle Opacity (%)"),
      ": ",
      React.createElement(Rcslider, {
        min: 0,
        max: 100,
        step: 1,
        tipTransitionName: "rc-slider-tooltip-zoom-down",
        value: this.props.design.fillOpacity * 100,
        onChange: this.handleFillOpacityChange
      })
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

  renderPopup() {
    if (!this.props.design.table) {
      return null
    }

    return R(EditPopupComponent, {
      design: this.props.design,
      onDesignChange: this.props.onDesignChange,
      schema: this.props.schema,
      dataSource: this.props.dataSource,
      table: this.props.design.table,
      idTable: this.props.design.table,
      defaultPopupFilterJoins: PopupFilterJoinsUtils.createDefaultPopupFilterJoins(this.props.design.table)
    })
  }

  render() {
    return R(
      "div",
      null,
      this.renderTable(),
      this.renderGeometryAxis(),
      this.renderRadius(),
      this.renderUnionShapes(),
      this.renderColor(),
      this.renderFillOpacity(),
      this.renderFilter(),
      this.renderPopup(),
      this.props.design.table
        ? R(ZoomLevelsComponent, { design: this.props.design, onDesignChange: this.props.onDesignChange })
        : undefined
    )
  }
}
