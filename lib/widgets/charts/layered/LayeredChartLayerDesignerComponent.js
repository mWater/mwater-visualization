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
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const AxisComponent_1 = __importDefault(require("../../../axes/AxisComponent"));
const AxisBuilder_1 = __importDefault(require("../../../axes/AxisBuilder"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const mwater_expressions_1 = require("mwater-expressions");
const ColorComponent_1 = __importDefault(require("../../../ColorComponent"));
const LayeredChartUtils = __importStar(require("./LayeredChartUtils"));
const LayeredChartCompiler_1 = __importDefault(require("./LayeredChartCompiler"));
const uiComponents = __importStar(require("../../../UIComponents"));
const TableSelectComponent_1 = __importDefault(require("../../../TableSelectComponent"));
const ui = __importStar(require("react-library/lib/bootstrap"));
const bootstrap_1 = require("react-library/lib/bootstrap");
class LayeredChartLayerDesignerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleNameChange = (ev) => {
            return this.updateLayer({ name: ev.target.value });
        };
        this.handleTableChange = (table) => {
            return this.updateLayer({ table });
        };
        this.handleXAxisChange = (axis) => {
            var _a;
            const layer = this.props.design.layers[this.props.index];
            const axesChanges = { x: axis };
            // Default y to count if x or color present and not scatter
            if (axis && this.doesLayerNeedGrouping(layer) && !((_a = layer.axes) === null || _a === void 0 ? void 0 : _a.y)) {
                axesChanges.y = { expr: { type: "op", op: "count", table: layer.table, exprs: [] } };
            }
            return this.updateAxes(axesChanges);
        };
        this.handleXColorMapChange = (xColorMap) => {
            const layer = this.props.design.layers[this.props.index];
            return this.updateLayer({ xColorMap });
        };
        this.handleColorAxisChange = (axis) => {
            var _a;
            const layer = this.props.design.layers[this.props.index];
            const axesChanges = { color: axis };
            // Default y to count if x or color present and not scatter
            if (axis && this.doesLayerNeedGrouping(layer) && !((_a = layer.axes) === null || _a === void 0 ? void 0 : _a.y)) {
                axesChanges.y = { expr: { type: "op", op: "count", table: layer.table, exprs: [] } };
            }
            return this.updateAxes(axesChanges);
        };
        this.handleYAxisChange = (axis) => {
            return this.updateAxes({ y: axis });
        };
        this.handleFilterChange = (filter) => {
            return this.updateLayer({ filter });
        };
        this.handleColorChange = (color) => {
            return this.updateLayer({ color });
        };
        this.handleCumulativeChange = (value) => {
            return this.updateLayer({ cumulative: value });
        };
        this.handleTrendlineChange = (value) => {
            return this.updateLayer({ trendline: value ? "linear" : undefined });
        };
        this.handleStackedChange = (value) => {
            return this.updateLayer({ stacked: value });
        };
    }
    isLayerPolar(layer) {
        return ["pie", "donut"].includes(layer.type || this.props.design.type);
    }
    doesLayerNeedGrouping(layer) {
        return !["scatter"].includes(layer.type || this.props.design.type);
    }
    // Determine if x-axis required
    isXAxisRequired(layer) {
        return !this.isLayerPolar(layer);
    }
    getAxisTypes(layer, axisKey) {
        return LayeredChartUtils.getAxisTypes(this.props.design, layer, axisKey);
    }
    getAxisLabel(icon, label) {
        return R("span", null, R("span", { className: "glyphicon glyphicon-" + icon }), " " + label);
    }
    // Determine icon/label for color axis
    getXAxisLabel(layer) {
        if (this.props.design.transpose) {
            return this.getAxisLabel("resize-vertical", "Vertical Axis");
        }
        else {
            return this.getAxisLabel("resize-horizontal", "Horizontal Axis");
        }
    }
    // Determine icon/label for color axis
    getYAxisLabel(layer) {
        if (this.isLayerPolar(layer)) {
            return this.getAxisLabel("repeat", "Angle Axis");
        }
        else if (this.props.design.transpose) {
            return this.getAxisLabel("resize-horizontal", "Horizontal Axis");
        }
        else {
            return this.getAxisLabel("resize-vertical", "Vertical Axis");
        }
    }
    // Determine icon/label for color axis
    getColorAxisLabel(layer) {
        if (this.isLayerPolar(layer)) {
            return this.getAxisLabel("text-color", "Label Axis");
        }
        else {
            return this.getAxisLabel("equalizer", "Split Axis");
        }
    }
    // Updates layer with the specified changes
    updateLayer(changes) {
        const layer = lodash_1.default.extend({}, this.props.design.layers[this.props.index], changes);
        return this.props.onChange(layer);
    }
    // Update axes with specified changes
    updateAxes(changes) {
        const axes = lodash_1.default.extend({}, this.props.design.layers[this.props.index].axes, changes);
        return this.updateLayer({ axes });
    }
    renderName() {
        const layer = this.props.design.layers[this.props.index];
        // R 'div', className: "form-group",
        //   R 'label', className: "text-muted", "Series Name"
        const placeholder = this.props.design.layers.length === 1 ? "Value" : `Series ${this.props.index + 1}`;
        return R("input", {
            type: "text",
            className: "form-control form-control-sm",
            value: layer.name,
            onChange: this.handleNameChange,
            placeholder
        });
    }
    renderRemove() {
        if (this.props.design.layers.length > 1) {
            return R("button", { className: "btn btn-sm btn-link float-right", type: "button", onClick: this.props.onRemove }, R("span", { className: "fas fa-times" }));
        }
    }
    renderTable() {
        const layer = this.props.design.layers[this.props.index];
        return R(uiComponents.SectionComponent, { icon: "fa-database", label: "Data Source" }, R(TableSelectComponent_1.default, {
            schema: this.props.schema,
            value: layer.table,
            onChange: this.handleTableChange,
            filter: layer.filter,
            onFilterChange: this.handleFilterChange
        }));
    }
    renderXAxis() {
        const layer = this.props.design.layers[this.props.index];
        if (!layer.table) {
            return;
        }
        if (!this.isXAxisRequired(layer)) {
            return;
        }
        const title = this.getXAxisLabel(layer);
        const filters = lodash_1.default.clone(this.props.filters) || [];
        if (layer.filter != null) {
            const exprCompiler = new mwater_expressions_1.ExprCompiler(this.props.schema);
            const jsonql = exprCompiler.compileExpr({ expr: layer.filter, tableAlias: "{alias}" });
            if (jsonql) {
                filters.push({ table: layer.filter.table, jsonql });
            }
        }
        const categoricalX = new LayeredChartCompiler_1.default({ schema: this.props.schema }).isCategoricalX(this.props.design);
        return R(uiComponents.SectionComponent, { label: title }, R(AxisComponent_1.default, {
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
        }));
    }
    renderColorAxis() {
        const layer = this.props.design.layers[this.props.index];
        if (!layer.table) {
            return;
        }
        const title = this.getColorAxisLabel(layer);
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, title), R("div", { style: { marginLeft: 10 } }, R(AxisComponent_1.default, {
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
        })));
    }
    renderYAxis() {
        const layer = this.props.design.layers[this.props.index];
        if (!layer.table) {
            return;
        }
        const title = this.getYAxisLabel(layer);
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, title), R("div", { style: { marginLeft: 10 } }, R(AxisComponent_1.default, {
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
        }), this.renderCumulative(), this.renderStacked(), this.renderTrendline()));
    }
    renderCumulative() {
        const layer = this.props.design.layers[this.props.index];
        // Can only cumulative if non-polar and y axis determined and x axis supports cumulative
        const axisBuilder = new AxisBuilder_1.default({ schema: this.props.schema });
        if (!layer.axes.y || !layer.axes.x || !axisBuilder.doesAxisSupportCumulative(layer.axes.x)) {
            return;
        }
        return R("div", { key: "cumulative" }, react_1.default.createElement(bootstrap_1.Checkbox, { inline: true, value: layer.cumulative, onChange: this.handleCumulativeChange }, "Cumulative"));
    }
    renderTrendline() {
        const layer = this.props.design.layers[this.props.index];
        // Can only have trendline if non-polar and y + x axis determined and not cumulative and not stacked
        const axisBuilder = new AxisBuilder_1.default({ schema: this.props.schema });
        if (!layer.axes.y || !layer.axes.x || layer.cumulative || layer.stacked || this.props.design.stacked) {
            return;
        }
        return R("div", { key: "trendline" }, react_1.default.createElement(bootstrap_1.Checkbox, { value: layer.trendline === "linear", onChange: this.handleTrendlineChange }, "Show linear trendline"));
    }
    renderStacked() {
        const layer = this.props.design.layers[this.props.index];
        // Only if has color axis and there are more than one layer
        if (layer.axes.color && this.props.design.layers.length > 1) {
            const stacked = layer.stacked != null ? layer.stacked : true;
            return R("div", { key: "stacked" }, react_1.default.createElement(bootstrap_1.Checkbox, { value: stacked, onChange: this.handleStackedChange }, "Stacked"));
        }
        return null;
    }
    renderColor() {
        const layer = this.props.design.layers[this.props.index];
        // If not table do nothing
        if (!layer.table) {
            return;
        }
        const categoricalX = new LayeredChartCompiler_1.default({ schema: this.props.schema }).isCategoricalX(this.props.design);
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, layer.axes.color ? "Default Color" : "Color"), R("div", { style: { marginLeft: 8 } }, R(ColorComponent_1.default, { color: layer.color, onChange: this.handleColorChange }), 
        // Allow toggling of colors
        layer.axes.x && categoricalX && !layer.axes.color
            ? R(ui.Checkbox, { value: layer.xColorMap, onChange: this.handleXColorMapChange }, "Set Individual Colors")
            : undefined));
    }
    renderFilter() {
        const layer = this.props.design.layers[this.props.index];
        // If no table, hide
        if (!layer.table) {
            return null;
        }
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, R("span", { className: "fas fa-filter" }), " ", "Filters"), R("div", { style: { marginLeft: 8 } }, R(mwater_expressions_ui_1.FilterExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: this.handleFilterChange,
            table: layer.table,
            value: layer.filter
        })));
    }
    render() {
        const layer = this.props.design.layers[this.props.index];
        return R("div", null, this.props.index > 0 ? R("hr") : undefined, this.renderRemove(), this.renderTable(), 
        // Color axis first for pie
        this.isLayerPolar(layer) ? this.renderColorAxis() : undefined, this.renderXAxis(), layer.axes.x || layer.axes.color ? this.renderYAxis() : undefined, layer.axes.x && layer.axes.y && !this.isLayerPolar(layer) ? this.renderColorAxis() : undefined, 
        // No default color for polar
        (() => {
            if (!this.isLayerPolar(layer)) {
                if (layer.axes.y) {
                    return this.renderColor();
                }
            }
        })(), layer.axes.y ? this.renderFilter() : undefined, layer.axes.y ? this.renderName() : undefined);
    }
}
exports.default = LayeredChartLayerDesignerComponent;
