import _ from "lodash"
import React from "react"
const R = React.createElement
import { produce } from "immer"

import { ExprComponent, FilterExprComponent } from "mwater-expressions-ui"
import { ExprCompiler, Schema, DataSource, Expr, OpExpr } from "mwater-expressions"
import AxisComponent from "../axes/AxisComponent"
import TableSelectComponent from "../TableSelectComponent"
import Rcslider from "rc-slider"
import GridLayerDesign from "./GridLayerDesign"
import { JsonQLFilter } from "../index"
import EditPopupComponent from "./EditPopupComponent"
import ZoomLevelsComponent from "./ZoomLevelsComponent"
import * as ui from "react-library/lib/bootstrap"
import { Axis } from "../axes/Axis"
import PopoverHelpComponent from "react-library/lib/PopoverHelpComponent"

/** Designer for a grid layer */
export default class GridLayerDesigner extends React.Component<{
  schema: Schema
  dataSource: DataSource
  design: GridLayerDesign
  onDesignChange: (design: GridLayerDesign) => void
  /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
  filters: JsonQLFilter[]
}> {
  update(mutation: (d: GridLayerDesign) => void) {
    this.props.onDesignChange(produce(this.props.design, mutation))
  }

  handleShapeChange = (shape: "square" | "hex") => {
    this.update((d) => {
      d.shape = shape
    })
  }

  handleTableChange = (table: string) => {
    this.update((d) => {
      d.table = table
    })
  }

  handleFilterChange = (filter: Expr) => {
    this.update((d) => {
      d.filter = filter
    })
  }

  handleColorAxisChange = (axis: Axis) => {
    this.update((d) => {
      d.colorAxis = axis
    })
  }

  handleGeometryExprChange = (expr: Expr) => {
    this.update((d) => {
      d.geometryExpr = expr
    })
  }

  handleSizeUnitsChange = (sizeUnits: "pixels" | "meters") => {
    if (sizeUnits === "pixels") {
      this.update((d) => {
        d.sizeUnits = sizeUnits
        d.size = 30
      })
    } else {
      this.update((d) => {
        d.sizeUnits = sizeUnits
        d.size = 1000
      })
    }
  }

  handleSizeChange = (size: number) => {
    this.update((d) => {
      d.size = size
    })
  }

  handleFillOpacityChange = (fillOpacity: number) => {
    this.update((d) => {
      d.fillOpacity = fillOpacity
    })
  }

  handleBorderStyleChange = (borderStyle: "none" | "color") => {
    this.update((d) => {
      d.borderStyle = borderStyle
    })
  }

  renderShape() {
    return (
      <div className="mb-3">
        <label className="text-muted">Grid Type</label>
        <div style={{ marginLeft: 10 }}>
          <ui.Toggle<"square" | "hex" | undefined>
            allowReset={false}
            value={this.props.design.shape as any}
            onChange={this.handleShapeChange}
            size="sm"
            options={[
              { value: "hex", label: "Hexagonal" },
              { value: "square", label: "Square" }
            ]}
          />
        </div>
      </div>
    )
  }

  renderSize() {
    return (
      <div className="mb-3">
        <label className="text-muted">Size</label>
        <div style={{ marginLeft: 10 }}>
          <div style={{ display: "inline-block" }}>
            <ui.NumberInput decimal={true} value={this.props.design.size} onChange={this.handleSizeChange} />
          </div>
          &nbsp;
          <div style={{ display: "inline-block" }}>
            <ui.Toggle<"pixels" | "meters" | undefined>
              allowReset={false}
              value={this.props.design.sizeUnits as any}
              onChange={this.handleSizeUnitsChange}
              size="sm"
              options={[
                { value: "pixels", label: "Pixels" },
                { value: "meters", label: "Meters (approximate)" }
              ]}
            />
          </div>
          &nbsp;
          <PopoverHelpComponent placement="bottom">
            Pixel grids always appear to be the same size when zoomed. Meters are for a fixed-size grid and have limits
            on how far the user can zoom out.
          </PopoverHelpComponent>
        </div>
      </div>
    )
  }

  renderTable() {
    return (
      <div className="mb-3">
        <label className="text-muted">
          <i className="fa fa-database" />
          {" Data Source"}
        </label>
        <TableSelectComponent
          schema={this.props.schema}
          value={this.props.design.table}
          onChange={this.handleTableChange}
          filter={this.props.design.filter}
          onFilterChange={this.handleFilterChange}
        />
      </div>
    )
  }

  renderGeometryExpr() {
    // If no data, hide
    if (!this.props.design.table) {
      return null
    }

    return (
      <div className="mb-3">
        <label className="text-muted">
          <i className="fas fa-map-marker-alt" />
          {" Location"}
        </label>
        <div style={{ marginLeft: 8 }}>
          <ExprComponent
            schema={this.props.schema}
            dataSource={this.props.dataSource}
            onChange={this.handleGeometryExprChange}
            table={this.props.design.table}
            types={["geometry"]}
            value={this.props.design.geometryExpr}
          />
        </div>
      </div>
    )
  }

  renderColorAxis() {
    if (!this.props.design.table) {
      return null
    }

    const filters = _.clone(this.props.filters) || []

    if (this.props.design.filter) {
      const exprCompiler = new ExprCompiler(this.props.schema)
      const jsonql = exprCompiler.compileExpr({ expr: this.props.design.filter, tableAlias: "{alias}" })
      let filterTable = (this.props.design.filter as OpExpr).table
      if (jsonql && filterTable) {
        filters.push({ table: filterTable, jsonql })
      }
    }

    const table = this.props.design.table

    return R(
      "div",
      null,
      R(
        "div",
        { className: "mb-3" },
        R("label", { className: "text-muted" }, R("span", { className: "fas fa-tint" }), "Color By Data"),

        R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: this.props.design.table,
          types: ["text", "enum", "boolean", "date"],
          aggrNeed: "required",
          value: this.props.design.colorAxis,
          showColorMap: true,
          onChange: this.handleColorAxisChange,
          allowExcludedValues: true,
          filters: filters
        })
      )
    )
  }

  renderFillOpacity() {
    return R(
      "div",
      { className: "mb-3" },
      R("label", { className: "text-muted" }, "Fill Opacity (%)"),
      ": ",
      R(Rcslider, {
        min: 0,
        max: 100,
        step: 1,
        tipTransitionName: "rc-slider-tooltip-zoom-down",
        value: this.props.design.fillOpacity! * 100,
        onChange: (val: number) => this.handleFillOpacityChange(val / 100)
      })
    )
  }

  renderBorderStyle() {
    return (
      <div className="mb-3">
        <label className="text-muted">Border Style</label>
        <div style={{ marginLeft: 10 }}>
          <ui.Toggle<"none" | "color" | undefined>
            allowReset={false}
            value={this.props.design.borderStyle as any}
            onChange={this.handleBorderStyleChange}
            size="sm"
            options={[
              { value: "none", label: "None" },
              { value: "color", label: "Line" }
            ]}
          />
        </div>
      </div>
    )
  }
  renderFilter() {
    // If not with table, hide
    if (!this.props.design.table) {
      return null
    }

    return R(
      "div",
      { className: "mb-3" },
      R("label", { className: "text-muted" }, R("span", { className: "fas fa-filter" }), " Filters"),
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

  // renderPopup() {
  //   // If not in indirect mode with table, hide
  //   if (this.props.design.regionMode !== "indirect" || !this.props.design.table) {
  //     return null
  //   }

  //   const regionsTable = this.props.design.regionsTable || "admin_regions";

  //   const defaultPopupFilterJoins = {};
  //   if (this.props.design.adminRegionExpr) {
  //     defaultPopupFilterJoins[this.props.design.table] = this.props.design.adminRegionExpr;
  //   }

  //   return R(EditPopupComponent, {
  //     design: this.props.design,
  //     onDesignChange: this.props.onDesignChange,
  //     schema: this.props.schema,
  //     dataSource: this.props.dataSource,
  //     table: this.props.design.table,
  //     idTable: regionsTable,
  //     defaultPopupFilterJoins
  //   })
  // }

  render() {
    return R(
      "div",
      null,
      this.renderShape(),
      this.renderSize(),
      this.renderTable(),
      this.renderGeometryExpr(),
      this.renderColorAxis(),
      this.renderFillOpacity(),
      this.renderBorderStyle(),
      this.renderFilter(),
      // this.renderPopup(),
      R(ZoomLevelsComponent, { design: this.props.design, onDesignChange: this.props.onDesignChange })
    )
  }
}
