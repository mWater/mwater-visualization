// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let MarkersLayerDesignerComponent
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement
import { FilterExprComponent } from "mwater-expressions-ui"
import { ExprUtils } from "mwater-expressions"
import { ExprCompiler } from "mwater-expressions"
import AxisComponent from "./../axes/AxisComponent"
import ColorComponent from "../ColorComponent"
import TableSelectComponent from "../TableSelectComponent"
import EditPopupComponent from "./EditPopupComponent"
import ZoomLevelsComponent from "./ZoomLevelsComponent"
import MarkerSymbolSelectComponent from "./MarkerSymbolSelectComponent"
import PopupFilterJoinsUtils from "./PopupFilterJoinsUtils"
import ui from "react-library/lib/bootstrap"

// Designer for a markers layer
export default MarkersLayerDesignerComponent = (function () {
  MarkersLayerDesignerComponent = class MarkersLayerDesignerComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired, // Schema to use
        dataSource: PropTypes.object.isRequired,
        design: PropTypes.object.isRequired, // Design of the marker layer
        onDesignChange: PropTypes.func.isRequired, // Called with new design
        filters: PropTypes.array
      }
      // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    }

    // Apply updates to design
    update(updates) {
      return this.props.onDesignChange(_.extend({}, this.props.design, updates))
    }

    // Update axes with specified changes
    updateAxes(changes) {
      const axes = _.extend({}, this.props.design.axes, changes)
      return this.update({ axes })
    }

    handleTableChange = (table) => {
      return this.update({ table })
    }
    handleGeometryAxisChange = (axis) => {
      return this.updateAxes({ geometry: axis })
    }
    handleColorAxisChange = (axis) => {
      return this.updateAxes({ color: axis })
    }
    handleFilterChange = (expr) => {
      return this.update({ filter: expr })
    }
    handleColorChange = (color) => {
      return this.update({ color })
    }
    handleSymbolChange = (symbol) => {
      return this.update({ symbol })
    }
    handleNameChange = (e) => {
      return this.update({ name: e.target.value })
    }
    handleMarkerSizeChange = (markerSize) => {
      return this.update({ markerSize })
    }
    handleLineWidthChange = (lineWidth) => {
      return this.update({ lineWidth })
    }

    renderTable() {
      return R(
        "div",
        { className: "form-group" },
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

      const title = R("span", null, R("span", { className: "glyphicon glyphicon-map-marker" }), " Location")

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
        { className: "form-group" },
        R("label", { className: "text-muted" }, title),
        R(
          "div",
          { style: { marginLeft: 10 } },
          R(AxisComponent, {
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

    renderColor() {
      if (!this.props.design.axes.geometry) {
        return
      }

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
        null,
        !this.props.design.axes.color
          ? R(
              "div",
              { className: "form-group" },
              R(
                "label",
                { className: "text-muted" },
                R("span", { className: "glyphicon glyphicon glyphicon-tint" }),
                "Color"
              ),

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
          { className: "form-group" },
          R(
            "label",
            { className: "text-muted" },
            R("span", { className: "glyphicon glyphicon glyphicon-tint" }),
            "Color By Data"
          ),

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
            filters
          })
        )
      )
    }

    renderSymbol() {
      if (!this.props.design.axes.geometry) {
        return
      }

      return R(MarkerSymbolSelectComponent, { symbol: this.props.design.symbol, onChange: this.handleSymbolChange })
    }

    renderMarkerSize() {
      if (!this.props.design.axes.geometry) {
        return
      }

      return R(
        "div",
        { className: "form-group" },
        R("label", { className: "text-muted" }, "Marker Size"),
        R(ui.Select, {
          value: this.props.design.markerSize || 10,
          options: [
            { value: 5, label: "Extra small" },
            { value: 8, label: "Small" },
            { value: 10, label: "Normal" },
            { value: 13, label: "Large" },
            { value: 16, label: "Extra large" }
          ],
          onChange: this.handleMarkerSizeChange
        })
      )
    }

    renderLineWidth() {
      if (!this.props.design.axes.geometry) {
        return
      }

      return R(
        "div",
        { className: "form-group" },
        R("label", { className: "text-muted" }, "Line Width (for shapes)"),
        R(ui.Select, {
          value: this.props.design.lineWidth != null ? this.props.design.lineWidth : 3,
          options: [
            { value: 0, label: "None" },
            { value: 1, label: "1 pixel" },
            { value: 2, label: "2 pixels" },
            { value: 3, label: "3 pixels" },
            { value: 4, label: "4 pixels" },
            { value: 5, label: "5 pixels" },
            { value: 6, label: "6 pixels" }
          ],
          onChange: this.handleLineWidthChange
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
        { className: "form-group" },
        R("label", { className: "text-muted" }, R("span", { className: "glyphicon glyphicon-filter" }), " Filters"),
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
        this.renderColor(),
        this.renderSymbol(),
        this.renderMarkerSize(),
        this.renderLineWidth(),
        this.renderFilter(),
        this.renderPopup(),
        this.props.design.table
          ? R(ZoomLevelsComponent, { design: this.props.design, onDesignChange: this.props.onDesignChange })
          : undefined
      )
    }
  }
  MarkersLayerDesignerComponent.initClass()
  return MarkersLayerDesignerComponent
})()
