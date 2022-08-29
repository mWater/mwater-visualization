import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import AxisComponent from "../../../axes/AxisComponent"
import AxisBuilder from "../../../axes/AxisBuilder"
import { FilterExprComponent } from "mwater-expressions-ui"
import { DataSource, ExprUtils, Schema } from "mwater-expressions"
import { ExprCompiler } from "mwater-expressions"
import ColorComponent from "../../../ColorComponent"
import * as LayeredChartUtils from "./LayeredChartUtils"
import LayeredChartCompiler from "./LayeredChartCompiler"
import * as uiComponents from "../../../UIComponents"
import TableSelectComponent from "../../../TableSelectComponent"
import * as ui from "react-library/lib/bootstrap"
import { Checkbox } from "react-library/lib/bootstrap"
import PopoverHelpComponent from "react-library/lib/PopoverHelpComponent"

export interface LayeredChartLayerDesignerComponentProps {
  design: any
  schema: Schema
  dataSource: DataSource
  index: number
  onChange: any
  onRemove: any
  filters?: any
}

export default class LayeredChartLayerDesignerComponent extends React.Component<LayeredChartLayerDesignerComponentProps> {
  isLayerPolar(layer: any) {
    return ["pie", "donut"].includes(layer.type || this.props.design.type)
  }

  doesLayerNeedGrouping(layer: any) {
    return !["scatter"].includes(layer.type || this.props.design.type)
  }

  // Determine if x-axis required
  isXAxisRequired(layer: any) {
    return !this.isLayerPolar(layer)
  }

  getAxisTypes(layer: any, axisKey: any) {
    return LayeredChartUtils.getAxisTypes(this.props.design, layer, axisKey)
  }

  getAxisLabel(icon: any, label: any) {
    return R("span", null, R("span", { className: "glyphicon glyphicon-" + icon }), " " + label)
  }

  // Determine icon/label for color axis
  getXAxisLabel(layer: any) {
    if (this.props.design.transpose) {
      return this.getAxisLabel("resize-vertical", "Vertical Axis")
    } else {
      return this.getAxisLabel("resize-horizontal", "Horizontal Axis")
    }
  }

  // Determine icon/label for color axis
  getYAxisLabel(layer: any) {
    if (this.isLayerPolar(layer)) {
      return this.getAxisLabel("repeat", "Angle Axis")
    } else if (this.props.design.transpose) {
      return this.getAxisLabel("resize-horizontal", "Horizontal Axis")
    } else {
      return this.getAxisLabel("resize-vertical", "Vertical Axis")
    }
  }

  // Determine icon/label for color axis
  getColorAxisLabel(layer: any) {
    if (this.isLayerPolar(layer)) {
      return this.getAxisLabel("text-color", "Label Axis")
    } else {
      return this.getAxisLabel("equalizer", "Split Axis")
    }
  }

  // Updates layer with the specified changes
  updateLayer(changes: any) {
    const layer = _.extend({}, this.props.design.layers[this.props.index], changes)
    return this.props.onChange(layer)
  }

  // Update axes with specified changes
  updateAxes(changes: any) {
    const axes = _.extend({}, this.props.design.layers[this.props.index].axes, changes)
    return this.updateLayer({ axes })
  }

  handleNameChange = (ev: any) => {
    return this.updateLayer({ name: ev.target.value })
  }
  handleTableChange = (table: any) => {
    return this.updateLayer({ table })
  }

  handleXAxisChange = (axis: any) => {
    const layer = this.props.design.layers[this.props.index]
    const axesChanges: any = { x: axis }

    // Default y to count if x or color present and not scatter
    if (axis && this.doesLayerNeedGrouping(layer) && !layer.axes?.y) {
      axesChanges.y = { expr: { type: "op", op: "count", table: layer.table, exprs: [] } }
    }

    return this.updateAxes(axesChanges)
  }

  handleXColorMapChange = (xColorMap: any) => {
    const layer = this.props.design.layers[this.props.index]
    return this.updateLayer({ xColorMap })
  }

  handleColorAxisChange = (axis: any) => {
    const layer = this.props.design.layers[this.props.index]
    const axesChanges: any = { color: axis }

    // Default y to count if x or color present and not scatter
    if (axis && this.doesLayerNeedGrouping(layer) && !layer.axes?.y) {
      axesChanges.y = { expr: { type: "op", op: "count", table: layer.table, exprs: [] } }
    }

    return this.updateAxes(axesChanges)
  }

  handleYAxisChange = (axis: any) => {
    return this.updateAxes({ y: axis })
  }
  handleFilterChange = (filter: any) => {
    return this.updateLayer({ filter })
  }
  handleColorChange = (color: any) => {
    return this.updateLayer({ color })
  }
  handleCumulativeChange = (value: any) => {
    return this.updateLayer({ cumulative: value })
  }
  handleTrendlineChange = (value: any) => {
    return this.updateLayer({ trendline: value ? "linear" : undefined })
  }
  handleStackedChange = (value: any) => {
    return this.updateLayer({ stacked: value })
  }

  renderName() {
    const layer = this.props.design.layers[this.props.index]

    // R 'div', className: "form-group",
    //   R 'label', className: "text-muted", "Series Name"
    const placeholder = this.props.design.layers.length === 1 ? "Value" : `Series ${this.props.index + 1}`
    return R("input", {
      type: "text",
      className: "form-control form-control-sm",
      value: layer.name,
      onChange: this.handleNameChange,
      placeholder
    })
  }

  renderRemove() {
    if (this.props.design.layers.length > 1) {
      return R(
        "button",
        { className: "btn btn-sm btn-link float-end", type: "button", onClick: this.props.onRemove },
        R("span", { className: "fas fa-times" })
      )
    }
    return null
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

  handlexAxisOnlyValuesPresentChange = (xAxisOnlyValuesPresent: boolean) => {
    this.updateLayer({xAxisOnlyValuesPresent})
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

    return [
      R(
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
      ),
      categoricalX ? R(ui.Checkbox, {
        value: layer.xAxisOnlyValuesPresent,
        onChange: this.handlexAxisOnlyValuesPresentChange
      }, 
        "Only show values actually present", 
        R(PopoverHelpComponent, {placement: 'bottom'}, "Limits values to those that are present in the data, as opposed to all choices or all dates within range")
      ):undefined

    ]
  }

  renderColorAxis() {
    const layer = this.props.design.layers[this.props.index]
    if (!layer.table) {
      return
    }

    const title = this.getColorAxisLabel(layer)

    return R(
      "div",
      { className: "mb-3" },
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
      { className: "mb-3" },
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
      <Checkbox inline value={layer.cumulative} onChange={this.handleCumulativeChange}>
        Cumulative
      </Checkbox>
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
      <Checkbox value={layer.trendline === "linear"} onChange={this.handleTrendlineChange}>
        Show linear trendline
      </Checkbox>
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
        <Checkbox value={stacked} onChange={this.handleStackedChange}>
          Stacked
        </Checkbox>
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
      { className: "mb-3" },
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
      { className: "mb-3" },
      R("label", { className: "text-muted" }, R("span", { className: "fas fa-filter" }), " ", "Filters"),
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
        return null
      })(),
      layer.axes.y ? this.renderFilter() : undefined,
      layer.axes.y ? this.renderName() : undefined
    )
  }
}
