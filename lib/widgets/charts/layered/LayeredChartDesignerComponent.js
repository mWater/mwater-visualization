"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let LayeredChartDesignerComponent;
const lodash_1 = __importDefault(require("lodash"));
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const LayeredChartLayerDesignerComponent_1 = __importDefault(require("./LayeredChartLayerDesignerComponent"));
const LayeredChartCompiler_1 = __importDefault(require("./LayeredChartCompiler"));
const TabbedComponent_1 = __importDefault(require("react-library/lib/TabbedComponent"));
const uiComponents = __importStar(require("../../../UIComponents"));
const ColorComponent_1 = __importDefault(require("../../../ColorComponent"));
const bootstrap_1 = __importDefault(require("react-library/lib/bootstrap"));
exports.default = LayeredChartDesignerComponent = (function () {
    var _a;
    LayeredChartDesignerComponent = (_a = class LayeredChartDesignerComponent extends react_1.default.Component {
            constructor() {
                super(...arguments);
                this.handleTypeChange = (type) => {
                    return this.updateDesign({ type });
                };
                this.handleTransposeChange = (ev) => {
                    return this.updateDesign({ transpose: ev.target.checked });
                };
                this.handleStackedChange = (ev) => {
                    return this.updateDesign({ stacked: ev.target.checked });
                };
                this.handleProportionalChange = (ev) => {
                    return this.updateDesign({ proportional: ev.target.checked });
                };
                this.handleLabelsChange = (ev) => {
                    return this.updateDesign({ labels: ev.target.checked });
                };
                this.handlePercentageVisibilityChange = (ev) => {
                    return this.updateDesign({ hidePercentage: ev.target.checked });
                };
                this.handlePolarOrderChange = (ev) => {
                    return this.updateDesign({ polarOrder: ev.target.checked ? "desc" : "natural" });
                };
                this.handleYThresholdsChange = (yThresholds) => {
                    return this.updateDesign({ yThresholds });
                };
                this.handleLayerChange = (index, layer) => {
                    const layers = this.props.design.layers.slice();
                    layers[index] = layer;
                    return this.updateDesign({ layers });
                };
                this.handleRemoveLayer = (index) => {
                    const layers = this.props.design.layers.slice();
                    layers.splice(index, 1);
                    return this.updateDesign({ layers });
                };
                this.handleAddLayer = () => {
                    const layers = this.props.design.layers.slice();
                    layers.push({});
                    return this.updateDesign({ layers });
                };
                this.handleXAxisLabelTextChange = (ev) => {
                    return this.updateDesign({ xAxisLabelText: ev.target.value });
                };
                this.handleYAxisLabelTextChange = (ev) => {
                    return this.updateDesign({ yAxisLabelText: ev.target.value });
                };
                this.handleToggleXAxisLabelClick = (ev) => {
                    return this.updateDesign({ xAxisLabelText: this.props.design.xAxisLabelText != null ? null : "" });
                };
                this.handleToggleYAxisLabelClick = (ev) => {
                    return this.updateDesign({ yAxisLabelText: this.props.design.yAxisLabelText != null ? null : "" });
                };
                this.handleYMinChange = (yMin) => {
                    return this.updateDesign({ yMin });
                };
                this.handleYMaxChange = (yMax) => {
                    return this.updateDesign({ yMax });
                };
                this.renderLayer = (index) => {
                    const style = {
                        paddingTop: 10,
                        paddingBottom: 10
                    };
                    return R("div", { style, key: index }, R(LayeredChartLayerDesignerComponent_1.default, {
                        design: this.props.design,
                        schema: this.props.schema,
                        dataSource: this.props.dataSource,
                        index,
                        filters: this.props.filters,
                        onChange: this.handleLayerChange.bind(null, index),
                        onRemove: this.handleRemoveLayer.bind(null, index)
                    }));
                };
            }
            // Determine if axes labels needed
            areAxesLabelsNeeded(layer) {
                return !["pie", "donut"].includes(this.props.design.type);
            }
            // Updates design with the specified changes
            updateDesign(changes) {
                const design = lodash_1.default.extend({}, this.props.design, changes);
                return this.props.onDesignChange(design);
            }
            renderLabels() {
                if (!this.props.design.type) {
                    return;
                }
                const compiler = new LayeredChartCompiler_1.default({ schema: this.props.schema });
                return R("div", null, R("p", { className: "help-block" }, "To edit title of chart, click on it directly"), this.areAxesLabelsNeeded()
                    ? R("div", { className: "form-group" }, R("span", null, R("label", { className: "text-muted" }, this.props.design.transpose ? "Vertical Axis Label" : "Horizontal Axis Label"), " ", R("button", { className: "btn btn-default btn-xs", onClick: this.handleToggleXAxisLabelClick }, this.props.design.xAxisLabelText != null ? "Hide" : "Show")), this.props.design.xAxisLabelText != null
                        ? R("input", {
                            type: "text",
                            className: "form-control input-sm",
                            value: this.props.design.xAxisLabelText,
                            onChange: this.handleXAxisLabelTextChange,
                            placeholder: compiler.compileDefaultXAxisLabelText(this.props.design)
                        })
                        : undefined)
                    : undefined, this.areAxesLabelsNeeded()
                    ? R("div", { className: "form-group" }, R("span", null, R("label", { className: "text-muted" }, !this.props.design.transpose ? "Vertical Axis Label" : "Horizontal Axis Label"), " ", R("button", { className: "btn btn-default btn-xs", onClick: this.handleToggleYAxisLabelClick }, this.props.design.yAxisLabelText != null ? "Hide" : "Show")), this.props.design.yAxisLabelText != null
                        ? R("input", {
                            type: "text",
                            className: "form-control input-sm",
                            value: this.props.design.yAxisLabelText,
                            onChange: this.handleYAxisLabelTextChange,
                            placeholder: compiler.compileDefaultYAxisLabelText(this.props.design)
                        })
                        : undefined)
                    : undefined);
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
                ];
                const current = lodash_1.default.findWhere(chartTypes, { id: this.props.design.type });
                return R(uiComponents.SectionComponent, { icon: "glyphicon-th", label: "Chart Type" }, R(uiComponents.ToggleEditComponent, {
                    forceOpen: !this.props.design.type,
                    label: current ? current.name : "",
                    editor: (onClose) => {
                        return R(uiComponents.OptionListComponent, {
                            hint: "Select a Chart Type",
                            items: lodash_1.default.map(chartTypes, (ct) => ({
                                name: ct.name,
                                desc: ct.desc,
                                onClick: () => {
                                    onClose(); // Close editor first
                                    return this.handleTypeChange(ct.id);
                                }
                            }))
                        });
                    }
                }), this.renderOptions());
            }
            renderLayers() {
                if (!this.props.design.type) {
                    return;
                }
                return R("div", null, lodash_1.default.map(this.props.design.layers, (layer, i) => this.renderLayer(i)), 
                // Only add if last has table
                this.props.design.layers.length > 0 && lodash_1.default.last(this.props.design.layers).table
                    ? R("button", { className: "btn btn-link", type: "button", onClick: this.handleAddLayer }, R("span", { className: "glyphicon glyphicon-plus" }), " Add Another Series")
                    : undefined);
            }
            renderOptions() {
                const { design } = this.props;
                if (!design.type) {
                    return;
                }
                // Can only stack if multiple series or one with color and not polar
                let canStack = !["pie", "donut"].includes(design.type) && design.layers.length > 0;
                if (design.layers.length === 1 && !design.layers[0].axes.color) {
                    canStack = false;
                }
                // Don't include if transpose
                const canTranspose = !["pie", "donut"].includes(design.type);
                return R("div", { className: "text-muted" }, canTranspose
                    ? R("label", { className: "checkbox-inline", key: "transpose" }, R("input", { type: "checkbox", checked: design.transpose, onChange: this.handleTransposeChange }), "Horizontal")
                    : undefined, canStack
                    ? R("label", { className: "checkbox-inline", key: "stacked" }, R("input", { type: "checkbox", checked: design.stacked, onChange: this.handleStackedChange }), "Stacked")
                    : undefined, canStack
                    ? R("label", { className: "checkbox-inline", key: "proportional" }, R("input", { type: "checkbox", checked: design.proportional, onChange: this.handleProportionalChange }), "Proportional")
                    : undefined, R("label", { className: "checkbox-inline", key: "labels" }, R("input", { type: "checkbox", checked: design.labels || false, onChange: this.handleLabelsChange }), "Show Values"), ["pie", "donut"].includes(design.type)
                    ? [
                        R("label", { className: "checkbox-inline", key: "polarOrder" }, R("input", {
                            type: "checkbox",
                            checked: design.hidePercentage,
                            onChange: this.handlePercentageVisibilityChange
                        }), "Hide Percentage"),
                        R("label", { className: "checkbox-inline", key: "polarOrder" }, R("input", {
                            type: "checkbox",
                            checked: (design.polarOrder || "desc") === "desc",
                            onChange: this.handlePolarOrderChange
                        }), "Descending Order")
                    ]
                    : undefined);
            }
            renderThresholds() {
                // Doesn't apply to polar
                if (this.props.design.type && !["pie", "donut"].includes(this.props.design.type)) {
                    return R(uiComponents.SectionComponent, { label: "Y Threshold Lines" }, R(ThresholdsComponent, {
                        thresholds: this.props.design.yThresholds,
                        onThresholdsChange: this.handleYThresholdsChange,
                        showHighlightColor: this.props.design.type === "bar"
                    }));
                }
            }
            renderYRange() {
                // Doesn't apply to polar
                if (this.props.design.type && !["pie", "donut"].includes(this.props.design.type)) {
                    return R(uiComponents.SectionComponent, { label: "Y Axis Range" }, R(LabeledInlineComponent, { key: "min", label: "Min:" }, R(bootstrap_1.default.NumberInput, {
                        decimal: true,
                        style: { display: "inline-block" },
                        size: "sm",
                        value: this.props.design.yMin,
                        onChange: this.handleYMinChange,
                        placeholder: "Auto"
                    })), "  ", R(LabeledInlineComponent, { key: "label", label: "Max:" }, R(bootstrap_1.default.NumberInput, {
                        decimal: true,
                        style: { display: "inline-block" },
                        size: "sm",
                        value: this.props.design.yMax,
                        onChange: this.handleYMaxChange,
                        placeholder: "Auto"
                    })));
                }
            }
            render() {
                const tabs = [];
                tabs.push({
                    id: "design",
                    label: "Design",
                    elem: R("div", { style: { paddingBottom: 200 } }, R("br"), this.renderType(), this.renderLayers(), this.renderThresholds(), this.renderYRange())
                });
                if (this.props.design.type) {
                    tabs.push({
                        id: "labels",
                        label: "Labels",
                        elem: R("div", null, R("br"), this.renderLabels())
                    });
                }
                return R(TabbedComponent_1.default, {
                    initialTabId: "design",
                    tabs
                });
            }
        },
        _a.propTypes = {
            design: prop_types_1.default.object.isRequired,
            schema: prop_types_1.default.object.isRequired,
            dataSource: prop_types_1.default.object.isRequired,
            onDesignChange: prop_types_1.default.func.isRequired,
            filters: prop_types_1.default.array
        },
        _a);
    return LayeredChartDesignerComponent;
})();
// Thresholds are lines that are added at certain values
class ThresholdsComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleAdd = () => {
            const thresholds = (this.props.thresholds || []).slice();
            thresholds.push({ value: null, label: "", highlightColor: null });
            return this.props.onThresholdsChange(thresholds);
        };
        this.handleChange = (index, value) => {
            const thresholds = (this.props.thresholds || []).slice();
            thresholds[index] = value;
            return this.props.onThresholdsChange(thresholds);
        };
        this.handleRemove = (index) => {
            const thresholds = (this.props.thresholds || []).slice();
            thresholds.splice(index, 1);
            return this.props.onThresholdsChange(thresholds);
        };
    }
    render() {
        return R("div", null, lodash_1.default.map(this.props.thresholds, (threshold, index) => {
            return R(ThresholdComponent, {
                threshold,
                onThresholdChange: this.handleChange.bind(null, index),
                onRemove: this.handleRemove.bind(null, index),
                showHighlightColor: this.props.showHighlightColor
            });
        }), R("button", { type: "button", className: "btn btn-xs btn-link", onClick: this.handleAdd }, R("i", { className: "fa fa-plus" }), " Add Y Threshold"));
    }
}
ThresholdsComponent.propTypes = {
    thresholds: prop_types_1.default.arrayOf(prop_types_1.default.shape({ value: prop_types_1.default.number, label: prop_types_1.default.string, highlightColor: prop_types_1.default.string })),
    onThresholdsChange: prop_types_1.default.func.isRequired,
    showHighlightColor: prop_types_1.default.bool.isRequired
};
class ThresholdComponent extends react_1.default.Component {
    render() {
        return R("div", null, R(LabeledInlineComponent, { key: "value", label: "Value:" }, R(bootstrap_1.default.NumberInput, {
            decimal: true,
            style: { display: "inline-block" },
            size: "sm",
            value: this.props.threshold.value,
            onChange: (v) => this.props.onThresholdChange(lodash_1.default.extend({}, this.props.threshold, { value: v }))
        })), "  ", R(LabeledInlineComponent, { key: "label", label: "Label:" }, R(bootstrap_1.default.TextInput, {
            style: { display: "inline-block", width: "8em" },
            size: "sm",
            value: this.props.threshold.label,
            onChange: (v) => this.props.onThresholdChange(lodash_1.default.extend({}, this.props.threshold, { label: v }))
        })), "  ", this.props.showHighlightColor
            ? R(LabeledInlineComponent, { key: "color", label: "Highlight color:" }, R("div", { style: { verticalAlign: "middle", display: "inline-block" } }, R(ColorComponent_1.default, {
                color: this.props.threshold.highlightColor,
                onChange: (v) => this.props.onThresholdChange(lodash_1.default.extend({}, this.props.threshold, { highlightColor: v }))
            })))
            : undefined, "  ", R("button", { className: "btn btn-xs btn-link", onClick: this.props.onRemove }, R("i", { className: "fa fa-remove" })));
    }
}
ThresholdComponent.propTypes = {
    threshold: prop_types_1.default.shape({ value: prop_types_1.default.number, label: prop_types_1.default.string, highlightColor: prop_types_1.default.string })
        .isRequired,
    onThresholdChange: prop_types_1.default.func.isRequired,
    onRemove: prop_types_1.default.func.isRequired,
    showHighlightColor: prop_types_1.default.bool.isRequired
};
function LabeledInlineComponent(props) {
    return R("div", { style: { display: "inline-block" } }, R("label", { className: "text-muted" }, props.label), " ", props.children);
}
