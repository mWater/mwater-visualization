// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let LayeredChartLayerDesignerComponent
import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import AxisComponent from "../../../axes/AxisComponent"
import AxisBuilder from "../../../axes/AxisBuilder"
import { FilterExprComponent } from "mwater-expressions-ui"
import { ExprUtils } from "mwater-expressions"
import { ExprCompiler } from "mwater-expressions"
import ColorComponent from "../../../ColorComponent"
import * as LayeredChartUtils from "./LayeredChartUtils"
import LayeredChartCompiler from "./LayeredChartCompiler"
import * as uiComponents from "../../../UIComponents"
import TableSelectComponent from "../../../TableSelectComponent"
import ui from "react-library/lib/bootstrap"

export default LayeredChartLayerDesignerComponent = (function () {
  LayeredChartLayerDesignerComponent = class LayeredChartLayerDesignerComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        design: PropTypes.object.isRequired,
        schema: PropTypes.object.isRequired,
        dataSource: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,
        onChange: PropTypes.func.isRequired,
        onRemove: PropTypes.func.isRequired,
        filters: PropTypes.array
      }
      // array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    }

    isLayerPolar(layer) {
      return ["pie", "donut"].includes(layer.type || this.props.design.type)
    }

    doesLayerNeedGrouping(layer) {
      return !["scatter"].includes(layer.type || this.props.design.type)
    }

    // Determine if x-axis required
    isXAxisRequired(layer) {
      return !this.isLayerPolar(layer)
    }

    getAxisTypes(layer, axisKey) {
      return LayeredChartUtils.getAxisTypes(this.props.design, layer, axisKey)
    }

    getAxisLabel(icon, label) {
      return R("span", null, R("span", { className: "glyphicon glyphicon-" + icon }), " " + label)
    }

    // Determine icon/label for color axis
    getXAxisLabel(layer) {
      if (this.props.design.transpose) {
        return this.getAxisLabel("resize-vertical", "Vertical Axis")
      } else {
        return this.getAxisLabel("resize-horizontal", "Horizontal Axis")
      }
    }

    // Determine icon/label for color axis
    getYAxisLabel(layer) {
      if (this.isLayerPolar(layer)) {
        return this.getAxisLabel("repeat", "Angle Axis")
      } else if (this.props.design.transpose) {
        return this.getAxisLabel("resize-horizontal", "Horizontal Axis")
      } else {
        return this.getAxisLabel("resize-vertical", "Vertical Axis")
      }
    }

    // Determine icon/label for color axis
    getColorAxisLabel(layer) {
      if (this.isLayerPolar(layer)) {
        return this.getAxisLabel("text-color", "Label Axis")
      } else {
        return this.getAxisLabel("equalizer", "Split Axis")
      }
    }

    // Updates layer with the specified changes
    updateLayer(changes) {
      const layer = _.extend({}, this.props.design.layers[this.props.index], changes)
      return this.props.onChange(layer)
    }

    // Update axes with specified changes
    updateAxes(changes) {
      const axes = _.extend({}, this.props.design.layers[this.props.index].axes, changes)
      return this.updateLayer({ axes })
    }

    handleNameChange = (ev) => {
      return this.updateLayer({ name: ev.target.value })
    }
    handleTableChange = (table) => {
      return this.updateLayer({ table })
    }

    handleXAxisChange = (axis) => {
      const layer = this.props.design.layers[this.props.index]
      const axesChanges = { x: axis }

      // Default y to count if x or color present and not scatter
      if (axis && this.doesLayerNeedGrouping(layer) && !layer.axes?.y) {
        axesChanges.y = { expr: { type: "op", op: "count", table: layer.table, exprs: [] } }
      }

      return this.updateAxes(axesChanges)
    }

    handleXColorMapChange = (xColorMap) => {
      const layer = this.props.design.layers[this.props.index]
      return this.updateLayer({ xColorMap })
    }

    handleColorAxisChange = (axis) => {
      const layer = this.props.design.layers[this.props.index]
      const axesChanges = { color: axis }

      // Default y to count if x or color present and not scatter
      if (axis && this.doesLayerNeedGrouping(layer) && !layer.axes?.y) {
        axesChanges.y = { expr: { type: "op", op: "count", table: layer.table, exprs: [] } }
      }

      return this.updateAxes(axesChanges)
    }

    handleYAxisChange = (axis) => {
      return this.updateAxes({ y: axis })
    }
    handleFilterChange = (filter) => {
      return this.updateLayer({ filter })
    }
    handleColorChange = (color) => {
      return this.updateLayer({ color })
    }
    handleCumulativeChange = (ev) => {
      return this.updateLayer({ cumulative: ev.target.checked })
    }
    handleTrendlineChange = (ev) => {
      return this.updateLayer({ trendline: ev.target.checked ? "linear" : undefined })
    }
    handleStackedChange = (ev) => {
      return this.updateLayer({ stacked: ev.target.checked })
    }

    renderName() {
      const layer = this.props.design.layers[this.props.index]

      // R 'div', className: "form-group",
      //   R 'label', className: "text-muted", "Series Name"
      const placeholder = this.props.design.layers.length === 1 ? "Value" : `Series ${this.props.index + 1}`
      return R("input", {
        type: "text",
        className: "form-control input-sm",
        value: layer.name,
        onChange: this.handleNameChange,
        placeholder
      })
    }

    renderRemove() {
      if (this.props.design.layers.length > 1) {
        return R(
          "button",
          { className: "btn btn-xs btn-link pull-right", type: "button", onClick: this.props.onRemove },
          R("span", { className: "glyphicon glyphicon-remove" })
        )
      }
    }

    renderTable() {
      const layer = this.props.design.layers[this.props.index]

      return R(
        uiComponents.SectionComponent,
        { icon: "fa-database", label: "Data Source" },
        R(TableSelectComponent, {
          schema: this.props.schema,
          value: layer.table,
          onChange: this.handleTableChange,
          filter: layer.filter,
          onFilterChange: this.handleFilterChange
        })
      )
    }

    renderXAxis() {
      const layer = this.props.design.layers[this.props.index]
      if (!layer.table) {
        return
      }

      if (!this.isXAxisRequired(layer)) {
        return
      }

      const title = this.getXAxisLabel(layer)

      const filters = _.clone(this.props.filters) || []
      if (layer.filter != null) {
        const exprCompiler = new ExprCompiler(this.props.schema)
        const jsonql = exprCompiler.compileExpr({ expr: layer.filter, tableAlias: "{alias}" })

        if (jsonql) {
          filters.push({ table: layer.filter.table, jsonql })
        }
      }

      const categoricalX = new LayeredChartCompiler({ schema: this.props.schema }).isCategoricalX(this.props.design)

      return R(
        uiComponents.SectionComponent,
        { label: title },
        R(AxisComponent, {
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          table: layer.table,
          types: this.getAxisTypes(layer, "x"),
          aggrNeed: "none",
          required: true,
          value: layer.axes.x,
          onChange: this.handleXAxisChange,
          filters,
          // Only show x color map if no color axis and is categorical and enabled
          showColorMap: layer.xColorMap && categoricalX && !layer.axes.color,
          autosetColors: false,
          // Categorical X can exclude values
          allowExcludedValues: categoricalX
        })
      )
    }

    renderColorAxis() {
      const layer = this.props.design.layers[this.props.index]
      if (!layer.table) {
        return
      }

      const title = this.getColorAxisLabel(layer)

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
            table: layer.table,
            types: this.getAxisTypes(layer, "color"),
            aggrNeed: "none",
            required: this.isLayerPolar(layer),
            showColorMap: true,
            value: layer.axes.color,
            onChange: this.handleColorAxisChange,
            allowExcludedValues: true,
            filters: this.props.filters
          })
        )
      )
    }

    renderYAxis() {
      const layer = this.props.design.layers[this.props.index]
      if (!layer.table) {
        return
      }

      const title = this.getYAxisLabel(layer)

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
            table: layer.table,
            types: this.getAxisTypes(layer, "y"),
            aggrNeed: this.doesLayerNeedGrouping(layer) ? "required" : "none",
            value: layer.axes.y,
            required: true,
            filters: this.props.filters,
            showFormat: true,
            onChange: this.handleYAxisChange
          }),
          this.renderCumulative(),
          this.renderStacked(),
          this.renderTrendline()
        )
      )
    }

    renderCumulative() {
      const layer = this.props.design.layers[this.props.index]

      // Can only cumulative if non-polar and y axis determined and x axis supports cumulative
      const axisBuilder = new AxisBuilder({ schema: this.props.schema })
      if (!layer.axes.y || !layer.axes.x || !axisBuilder.doesAxisSupportCumulative(layer.axes.x)) {
        return
      }

      return R(
        "div",
        { key: "cumulative" },
        R(
          "label",
          { className: "checkbox-inline" },
          R("input", { type: "checkbox", checked: layer.cumulative, onChange: this.handleCumulativeChange }),
          "Cumulative"
        )
      )
    }

    renderTrendline() {
      const layer = this.props.design.layers[this.props.index]

      // Can only have trendline if non-polar and y + x axis determined and not cumulative and not stacked
      const axisBuilder = new AxisBuilder({ schema: this.props.schema })
      if (!layer.axes.y || !layer.axes.x || layer.cumulative || layer.stacked || this.props.design.stacked) {
        return
      }

      return R(
        "div",
        { key: "trendline" },
        R(
          "label",
          { className: "checkbox-inline" },
          R("input", { type: "checkbox", checked: layer.trendline === "linear", onChange: this.handleTrendlineChange }),
          "Show linear trendline"
        )
      )
    }

    renderStacked() {
      const layer = this.props.design.layers[this.props.index]

      // Only if has color axis and there are more than one layer
      if (layer.axes.color && this.props.design.layers.length > 1) {
        const stacked = layer.stacked != null ? layer.stacked : true

        return R(
          "div",
          { key: "stacked" },
          R(
            "label",
            { className: "checkbox-inline" },
            R("input", { type: "checkbox", checked: stacked, onChange: this.handleStackedChange }),
            "Stacked"
          )
        )
      }

      return null
    }

    renderColor() {
      const layer = this.props.design.layers[this.props.index]

      // If not table do nothing
      if (!layer.table) {
        return
      }

      const categoricalX = new LayeredChartCompiler({ schema: this.props.schema }).isCategoricalX(this.props.design)

      return R(
        "div",
        { className: "form-group" },
        R("label", { className: "text-muted" }, layer.axes.color ? "Default Color" : "Color"),
        R(
          "div",
          { style: { marginLeft: 8 } },
          R(ColorComponent, { color: layer.color, onChange: this.handleColorChange }),
          // Allow toggling of colors
          layer.axes.x && categoricalX && !layer.axes.color
            ? R(ui.Checkbox, { value: layer.xColorMap, onChange: this.handleXColorMapChange }, "Set Individual Colors")
            : undefined
        )
      )
    }

    renderFilter() {
      const layer = this.props.design.layers[this.props.index]

      // If no table, hide
      if (!layer.table) {
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
            table: layer.table,
            value: layer.filter
          })
        )
      )
    }

    render() {
      const layer = this.props.design.layers[this.props.index]
      return R(
        "div",
        null,
        this.props.index > 0 ? R("hr") : undefined,
        this.renderRemove(),
        this.renderTable(),
        // Color axis first for pie
        this.isLayerPolar(layer) ? this.renderColorAxis() : undefined,
        this.renderXAxis(),
        layer.axes.x || layer.axes.color ? this.renderYAxis() : undefined,
        layer.axes.x && layer.axes.y && !this.isLayerPolar(layer) ? this.renderColorAxis() : undefined,
        // No default color for polar
        (() => {
          if (!this.isLayerPolar(layer)) {
            if (layer.axes.y) {
              return this.renderColor()
            }
          }
        })(),
        layer.axes.y ? this.renderFilter() : undefined,
        layer.axes.y ? this.renderName() : undefined
      )
    }
  }
  LayeredChartLayerDesignerComponent.initClass()
  return LayeredChartLayerDesignerComponent
})()
