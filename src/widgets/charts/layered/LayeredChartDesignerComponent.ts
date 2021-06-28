// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let LayeredChartDesignerComponent
import _ from "lodash"
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement
import LayeredChartLayerDesignerComponent from "./LayeredChartLayerDesignerComponent"
import LayeredChartCompiler from "./LayeredChartCompiler"
import TabbedComponent from "react-library/lib/TabbedComponent"
import * as uiComponents from "../../../UIComponents"
import ColorComponent from "../../../ColorComponent"
import ui from "react-library/lib/bootstrap"

export default LayeredChartDesignerComponent = (function () {
  LayeredChartDesignerComponent = class LayeredChartDesignerComponent extends React.Component {
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

    // Determine if axes labels needed
    areAxesLabelsNeeded(layer: any) {
      return !["pie", "donut"].includes(this.props.design.type)
    }

    // Updates design with the specified changes
    updateDesign(changes: any) {
      const design = _.extend({}, this.props.design, changes)
      return this.props.onDesignChange(design)
    }

    handleTypeChange = (type: any) => {
      return this.updateDesign({ type })
    }

    handleTransposeChange = (ev: any) => {
      return this.updateDesign({ transpose: ev.target.checked })
    }

    handleStackedChange = (ev: any) => {
      return this.updateDesign({ stacked: ev.target.checked })
    }
    handleProportionalChange = (ev: any) => {
      return this.updateDesign({ proportional: ev.target.checked })
    }
    handleLabelsChange = (ev: any) => {
      return this.updateDesign({ labels: ev.target.checked })
    }
    handlePercentageVisibilityChange = (ev: any) => {
      return this.updateDesign({ hidePercentage: ev.target.checked })
    }
    handlePolarOrderChange = (ev: any) => {
      return this.updateDesign({ polarOrder: ev.target.checked ? "desc" : "natural" })
    }
    handleYThresholdsChange = (yThresholds: any) => {
      return this.updateDesign({ yThresholds })
    }

    handleLayerChange = (index: any, layer: any) => {
      const layers = this.props.design.layers.slice()
      layers[index] = layer
      return this.updateDesign({ layers })
    }

    handleRemoveLayer = (index: any) => {
      const layers = this.props.design.layers.slice()
      layers.splice(index, 1)
      return this.updateDesign({ layers })
    }

    handleAddLayer = () => {
      const layers = this.props.design.layers.slice()
      layers.push({})
      return this.updateDesign({ layers })
    }

    handleXAxisLabelTextChange = (ev: any) => {
      return this.updateDesign({ xAxisLabelText: ev.target.value })
    }
    handleYAxisLabelTextChange = (ev: any) => {
      return this.updateDesign({ yAxisLabelText: ev.target.value })
    }

    handleToggleXAxisLabelClick = (ev: any) => {
      return this.updateDesign({ xAxisLabelText: this.props.design.xAxisLabelText != null ? null : "" })
    }

    handleToggleYAxisLabelClick = (ev: any) => {
      return this.updateDesign({ yAxisLabelText: this.props.design.yAxisLabelText != null ? null : "" })
    }

    handleYMinChange = (yMin: any) => {
      return this.updateDesign({ yMin })
    }

    handleYMaxChange = (yMax: any) => {
      return this.updateDesign({ yMax })
    }

    renderLabels() {
      if (!this.props.design.type) {
        return
      }

      const compiler = new LayeredChartCompiler({ schema: this.props.schema })

      return R(
        "div",
        null,
        R("p", { className: "help-block" }, "To edit title of chart, click on it directly"),
        this.areAxesLabelsNeeded()
          ? R(
              "div",
              { className: "form-group" },
              R(
                "span",
                null,
                R(
                  "label",
                  { className: "text-muted" },
                  this.props.design.transpose ? "Vertical Axis Label" : "Horizontal Axis Label"
                ),
                " ",
                R(
                  "button",
                  { className: "btn btn-default btn-xs", onClick: this.handleToggleXAxisLabelClick },
                  this.props.design.xAxisLabelText != null ? "Hide" : "Show"
                )
              ),
              this.props.design.xAxisLabelText != null
                ? R("input", {
                    type: "text",
                    className: "form-control input-sm",
                    value: this.props.design.xAxisLabelText,
                    onChange: this.handleXAxisLabelTextChange,
                    placeholder: compiler.compileDefaultXAxisLabelText(this.props.design)
                  })
                : undefined
            )
          : undefined,
        this.areAxesLabelsNeeded()
          ? R(
              "div",
              { className: "form-group" },
              R(
                "span",
                null,
                R(
                  "label",
                  { className: "text-muted" },
                  !this.props.design.transpose ? "Vertical Axis Label" : "Horizontal Axis Label"
                ),
                " ",
                R(
                  "button",
                  { className: "btn btn-default btn-xs", onClick: this.handleToggleYAxisLabelClick },
                  this.props.design.yAxisLabelText != null ? "Hide" : "Show"
                )
              ),
              this.props.design.yAxisLabelText != null
                ? R("input", {
                    type: "text",
                    className: "form-control input-sm",
                    value: this.props.design.yAxisLabelText,
                    onChange: this.handleYAxisLabelTextChange,
                    placeholder: compiler.compileDefaultYAxisLabelText(this.props.design)
                  })
                : undefined
            )
          : undefined
      )
    }

    renderType() {
      const chartTypes = [
        { id: "bar", name: "Bar", desc: "Best for most charts" },
        { id: "pie", name: "Pie", desc: "Compare ratios of one variable" },
        { id: "donut", name: "Donut", desc: "Pie chart with center removed" },
        { id: "line", name: "Line", desc: "Show how data changes smoothly over time" },
        { id: "spline", name: "Smoothed Line", desc: "For noisy data over time" },
        { id: "scatter", name: "Scatter", desc: "Show correlation between two number variables" },
        { id: "area", name: "Area", desc: "For cumulative data over time" }
      ]

      const current = _.findWhere(chartTypes, { id: this.props.design.type })

      return R(
        uiComponents.SectionComponent,
        { icon: "glyphicon-th", label: "Chart Type" },
        R(uiComponents.ToggleEditComponent, {
          forceOpen: !this.props.design.type,
          label: current ? current.name : "",
          editor: (onClose: any) => {
            return R(uiComponents.OptionListComponent, {
              hint: "Select a Chart Type",
              items: _.map(chartTypes, (ct) => ({
                name: ct.name,
                desc: ct.desc,
                onClick: () => {
                  onClose() // Close editor first
                  return this.handleTypeChange(ct.id)
                }
              }))
            })
          }
        }),
        this.renderOptions()
      );
    }

    renderLayer = (index: any) => {
      const style = {
        paddingTop: 10,
        paddingBottom: 10
      }
      return R(
        "div",
        { style, key: index },
        R(LayeredChartLayerDesignerComponent, {
          design: this.props.design,
          schema: this.props.schema,
          dataSource: this.props.dataSource,
          index,
          filters: this.props.filters,
          onChange: this.handleLayerChange.bind(null, index),
          onRemove: this.handleRemoveLayer.bind(null, index)
        })
      )
    }

    renderLayers() {
      if (!this.props.design.type) {
        return
      }

      return R(
        "div",
        null,
        _.map(this.props.design.layers, (layer, i) => this.renderLayer(i)),
        // Only add if last has table
        this.props.design.layers.length > 0 && _.last(this.props.design.layers).table
          ? R(
              "button",
              { className: "btn btn-link", type: "button", onClick: this.handleAddLayer },
              R("span", { className: "glyphicon glyphicon-plus" }),
              " Add Another Series"
            )
          : undefined
      )
    }

    renderOptions() {
      const { design } = this.props
      if (!design.type) {
        return
      }

      // Can only stack if multiple series or one with color and not polar
      let canStack = !["pie", "donut"].includes(design.type) && design.layers.length > 0
      if (design.layers.length === 1 && !design.layers[0].axes.color) {
        canStack = false
      }

      // Don't include if transpose
      const canTranspose = !["pie", "donut"].includes(design.type)

      return R(
        "div",
        { className: "text-muted" },
        canTranspose
          ? R(
              "label",
              { className: "checkbox-inline", key: "transpose" },
              R("input", { type: "checkbox", checked: design.transpose, onChange: this.handleTransposeChange }),
              "Horizontal"
            )
          : undefined,
        canStack
          ? R(
              "label",
              { className: "checkbox-inline", key: "stacked" },
              R("input", { type: "checkbox", checked: design.stacked, onChange: this.handleStackedChange }),
              "Stacked"
            )
          : undefined,
        canStack
          ? R(
              "label",
              { className: "checkbox-inline", key: "proportional" },
              R("input", { type: "checkbox", checked: design.proportional, onChange: this.handleProportionalChange }),
              "Proportional"
            )
          : undefined,
        R(
          "label",
          { className: "checkbox-inline", key: "labels" },
          R("input", { type: "checkbox", checked: design.labels || false, onChange: this.handleLabelsChange }),
          "Show Values"
        ),
        ["pie", "donut"].includes(design.type)
          ? [
              R(
                "label",
                { className: "checkbox-inline", key: "polarOrder" },
                R("input", {
                  type: "checkbox",
                  checked: design.hidePercentage,
                  onChange: this.handlePercentageVisibilityChange
                }),
                "Hide Percentage"
              ),
              R(
                "label",
                { className: "checkbox-inline", key: "polarOrder" },
                R("input", {
                  type: "checkbox",
                  checked: (design.polarOrder || "desc") === "desc",
                  onChange: this.handlePolarOrderChange
                }),
                "Descending Order"
              )
            ]
          : undefined
      )
    }

    renderThresholds() {
      // Doesn't apply to polar
      if (this.props.design.type && !["pie", "donut"].includes(this.props.design.type)) {
        return R(
          uiComponents.SectionComponent,
          { label: "Y Threshold Lines" },
          R(ThresholdsComponent, {
            thresholds: this.props.design.yThresholds,
            onThresholdsChange: this.handleYThresholdsChange,
            showHighlightColor: this.props.design.type === "bar"
          })
        )
      }
    }

    renderYRange() {
      // Doesn't apply to polar
      if (this.props.design.type && !["pie", "donut"].includes(this.props.design.type)) {
        return R(
          uiComponents.SectionComponent,
          { label: "Y Axis Range" },
          R(
            LabeledInlineComponent,
            { key: "min", label: "Min:" },
            R(ui.NumberInput, {
              decimal: true,
              style: { display: "inline-block" },
              size: "sm",
              value: this.props.design.yMin,
              onChange: this.handleYMinChange,
              placeholder: "Auto"
            })
          ),
          "  ",
          R(
            LabeledInlineComponent,
            { key: "label", label: "Max:" },
            R(ui.NumberInput, {
              decimal: true,
              style: { display: "inline-block" },
              size: "sm",
              value: this.props.design.yMax,
              onChange: this.handleYMaxChange,
              placeholder: "Auto"
            })
          )
        )
      }
    }

    render() {
      const tabs = []

      tabs.push({
        id: "design",
        label: "Design",
        elem: R(
          "div",
          { style: { paddingBottom: 200 } },
          R("br"),
          this.renderType(),
          this.renderLayers(),
          this.renderThresholds(),
          this.renderYRange()
        )
      })

      if (this.props.design.type) {
        tabs.push({
          id: "labels",
          label: "Labels",
          elem: R("div", null, R("br"), this.renderLabels())
        })
      }

      return R(TabbedComponent, {
        initialTabId: "design",
        tabs
      })
    }
  }
  LayeredChartDesignerComponent.initClass()
  return LayeredChartDesignerComponent
})()

// Thresholds are lines that are added at certain values
class ThresholdsComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      thresholds: PropTypes.arrayOf(
        PropTypes.shape({ value: PropTypes.number, label: PropTypes.string, highlightColor: PropTypes.string })
      ),
      onThresholdsChange: PropTypes.func.isRequired,
      showHighlightColor: PropTypes.bool.isRequired
    }
    // True to show highlight color
  }

  handleAdd = () => {
    const thresholds = (this.props.thresholds || []).slice()
    thresholds.push({ value: null, label: "", highlightColor: null })
    return this.props.onThresholdsChange(thresholds)
  }

  handleChange = (index: any, value: any) => {
    const thresholds = (this.props.thresholds || []).slice()
    thresholds[index] = value
    return this.props.onThresholdsChange(thresholds)
  }

  handleRemove = (index: any) => {
    const thresholds = (this.props.thresholds || []).slice()
    thresholds.splice(index, 1)
    return this.props.onThresholdsChange(thresholds)
  }

  render() {
    return R(
      "div",
      null,
      _.map(this.props.thresholds, (threshold, index) => {
        return R(ThresholdComponent, {
          threshold,
          onThresholdChange: this.handleChange.bind(null, index),
          onRemove: this.handleRemove.bind(null, index),
          showHighlightColor: this.props.showHighlightColor
        })
      }),

      R(
        "button",
        { type: "button", className: "btn btn-xs btn-link", onClick: this.handleAdd },
        R("i", { className: "fa fa-plus" }),
        " Add Y Threshold"
      )
    )
  }
}
ThresholdsComponent.initClass()

class ThresholdComponent extends React.Component {
  static initClass() {
    this.propTypes = {
      threshold: PropTypes.shape({ value: PropTypes.number, label: PropTypes.string, highlightColor: PropTypes.string })
        .isRequired,
      onThresholdChange: PropTypes.func.isRequired,
      onRemove: PropTypes.func.isRequired,
      showHighlightColor: PropTypes.bool.isRequired
    }
    // True to show highlight color
  }

  render() {
    return R(
      "div",
      null,
      R(
        LabeledInlineComponent,
        { key: "value", label: "Value:" },
        R(ui.NumberInput, {
          decimal: true,
          style: { display: "inline-block" },
          size: "sm",
          value: this.props.threshold.value,
          onChange: (v) => this.props.onThresholdChange(_.extend({}, this.props.threshold, { value: v }))
        })
      ),
      "  ",
      R(
        LabeledInlineComponent,
        { key: "label", label: "Label:" },
        R(ui.TextInput, {
          style: { display: "inline-block", width: "8em" },
          size: "sm",
          value: this.props.threshold.label,
          onChange: (v) => this.props.onThresholdChange(_.extend({}, this.props.threshold, { label: v }))
        })
      ),
      "  ",
      this.props.showHighlightColor
        ? R(
            LabeledInlineComponent,
            { key: "color", label: "Highlight color:" },
            R(
              "div",
              { style: { verticalAlign: "middle", display: "inline-block" } },
              R(ColorComponent, {
                color: this.props.threshold.highlightColor,
                onChange: (v: any) => this.props.onThresholdChange(_.extend({}, this.props.threshold, { highlightColor: v }))
              })
            )
          )
        : undefined,
      "  ",
      R(
        "button",
        { className: "btn btn-xs btn-link", onClick: this.props.onRemove },
        R("i", { className: "fa fa-remove" })
      )
    );
  }
}
ThresholdComponent.initClass()

function LabeledInlineComponent(props: any) {
  return R(
    "div",
    { style: { display: "inline-block" } },
    R("label", { className: "text-muted" }, props.label),
    " ",
    props.children
  )
}
