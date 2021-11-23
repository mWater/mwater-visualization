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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const uuid_1 = __importDefault(require("uuid"));
const AsyncLoadComponent_1 = __importDefault(require("react-library/lib/AsyncLoadComponent"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const mwater_expressions_1 = require("mwater-expressions");
const AxisBuilder_1 = __importDefault(require("./AxisBuilder"));
const update_object_1 = __importDefault(require("update-object"));
const ui = __importStar(require("../UIComponents"));
const BinsComponent_1 = __importDefault(require("./BinsComponent"));
const RangesComponent_1 = __importDefault(require("./RangesComponent"));
const AxisColorEditorComponent_1 = __importDefault(require("./AxisColorEditorComponent"));
const CategoryMapComponent_1 = __importDefault(require("./CategoryMapComponent"));
const mwater_expressions_2 = require("mwater-expressions");
const valueFormatter_1 = require("../valueFormatter");
const valueFormatter_2 = require("../valueFormatter");
const immer_1 = __importDefault(require("immer"));
// Axis component that allows designing of an axis
class AxisComponent extends AsyncLoadComponent_1.default {
    constructor(props) {
        super(props);
        this.handleExprChange = (expr) => {
            // If no expression, reset
            if (!expr) {
                this.props.onChange(null);
                return;
            }
            // Set expression and clear xform
            return this.props.onChange(this.cleanAxis(lodash_1.default.extend({}, lodash_1.default.omit(this.props.value || {}, ["drawOrder"]), { expr })));
        };
        this.handleFormatChange = (ev) => {
            return this.props.onChange((0, immer_1.default)(this.props.value, (draft) => {
                draft.format = ev.target.value;
            }));
        };
        this.handleXformTypeChange = (type) => {
            var _a;
            // Remove
            let xform;
            if (!type) {
                this.props.onChange((0, immer_1.default)(this.props.value, (draft) => {
                    delete draft.xform;
                    delete draft.colorMap;
                    delete draft.drawOrder;
                }));
                return;
            }
            // Save bins if going from bins to custom ranges and has ranges
            if (type === "ranges" &&
                ((_a = this.props.value.xform) === null || _a === void 0 ? void 0 : _a.type) === "bin" &&
                this.props.value.xform.min != null &&
                this.props.value.xform.max != null &&
                this.props.value.xform.min !== this.props.value.xform.max &&
                this.props.value.xform.numBins) {
                const { min } = this.props.value.xform;
                const { max } = this.props.value.xform;
                const { numBins } = this.props.value.xform;
                const ranges = [{ id: (0, uuid_1.default)(), maxValue: min, minOpen: false, maxOpen: true }];
                for (let i = 1, end1 = numBins, asc = 1 <= end1; asc ? i <= end1 : i >= end1; asc ? i++ : i--) {
                    const start = ((i - 1) / numBins) * (max - min) + min;
                    const end = (i / numBins) * (max - min) + min;
                    ranges.push({ id: (0, uuid_1.default)(), minValue: start, minOpen: false, maxValue: end, maxOpen: true });
                }
                ranges.push({ id: (0, uuid_1.default)(), minValue: max, minOpen: true, maxOpen: true });
                xform = {
                    type: "ranges",
                    ranges
                };
            }
            else {
                xform = {
                    type
                };
            }
            return this.props.onChange((0, immer_1.default)(this.props.value, (draft) => {
                delete draft.colorMap;
                delete draft.drawOrder;
                draft.xform = xform;
            }));
        };
        this.handleXformChange = (xform) => {
            return this.props.onChange(this.cleanAxis((0, update_object_1.default)(lodash_1.default.omit(this.props.value, ["drawOrder"]), { xform: { $set: xform } })));
        };
        this.state = {
            loading: false,
            categories: null // Categories of the axis. Loaded whenever axis is changed
        };
    }
    isLoadNeeded(newProps, oldProps) {
        const hasColorChanged = !lodash_1.default.isEqual(lodash_1.default.omit(newProps.value, ["colorMap", "drawOrder"]), lodash_1.default.omit(oldProps.value, ["colorMap", "drawOrder"]));
        const filtersChanged = !lodash_1.default.isEqual(newProps.filters, oldProps.filters);
        return hasColorChanged || filtersChanged;
    }
    // Asynchronously get the categories of the axis, which requires a query when the field is a text field or other non-enum type
    load(props, prevProps, callback) {
        var _a;
        const axisBuilder = new AxisBuilder_1.default({ schema: props.schema });
        // Clean axis first
        const axis = axisBuilder.cleanAxis({
            axis: props.value,
            table: props.table,
            types: props.types,
            aggrNeed: props.aggrNeed
        });
        // Ignore if error
        if (!axis || axisBuilder.validateAxis({ axis })) {
            return;
        }
        // Handle literal expression
        const values = [];
        if (((_a = axis.expr) === null || _a === void 0 ? void 0 : _a.type) === "literal") {
            values.push(axis.expr.value);
        }
        // Get categories (value + label)
        let categories = axisBuilder.getCategories(axis, values);
        // Just "None" and so doesn't count
        if (lodash_1.default.any(categories, (category) => category.value != null)) {
            callback({ categories });
            return;
        }
        // Can't get values of aggregate axis
        if (axisBuilder.isAxisAggr(axis)) {
            callback({ categories: [] });
            return;
        }
        // If no table, cannot query
        if (!axis.expr || !axis.expr.table) {
            callback({ categories: [] });
            return;
        }
        // If no categories, we need values as input
        const valuesQuery = {
            type: "query",
            selects: [{ type: "select", expr: axisBuilder.compileAxis({ axis, tableAlias: "main" }), alias: "val" }],
            from: { type: "table", table: axis.expr.table, alias: "main" },
            groupBy: [1],
            limit: 50
        };
        const filters = lodash_1.default.where(this.props.filters || [], { table: axis.expr.table });
        let whereClauses = lodash_1.default.map(filters, (f) => (0, mwater_expressions_2.injectTableAlias)(f.jsonql, "main"));
        whereClauses = lodash_1.default.compact(whereClauses);
        // Wrap if multiple
        if (whereClauses.length > 1) {
            valuesQuery.where = { type: "op", op: "and", exprs: whereClauses };
        }
        else {
            valuesQuery.where = whereClauses[0];
        }
        return props.dataSource.performQuery(valuesQuery, (error, rows) => {
            if (error) {
                return; // Ignore errors
            }
            // Get categories (value + label)
            categories = axisBuilder.getCategories(axis, lodash_1.default.pluck(rows, "val"));
            return callback({ categories });
        });
    }
    cleanAxis(axis) {
        const axisBuilder = new AxisBuilder_1.default({ schema: this.props.schema });
        return axisBuilder.cleanAxis({
            axis,
            table: this.props.table,
            aggrNeed: this.props.aggrNeed,
            types: this.props.types
        });
    }
    renderXform(axis) {
        if (!axis) {
            return null;
        }
        if (axis.xform && ["bin", "ranges", "floor"].includes(axis.xform.type)) {
            let comp;
            if (axis.xform.type === "ranges") {
                comp = R(RangesComponent_1.default, {
                    schema: this.props.schema,
                    expr: axis.expr,
                    xform: axis.xform,
                    onChange: this.handleXformChange
                });
            }
            else if (axis.xform.type === "bin") {
                comp = R(BinsComponent_1.default, {
                    schema: this.props.schema,
                    dataSource: this.props.dataSource,
                    expr: axis.expr,
                    xform: axis.xform,
                    onChange: this.handleXformChange
                });
            }
            else {
                comp = null;
            }
            return R("div", null, R(ui.ButtonToggleComponent, {
                value: axis.xform ? axis.xform.type : null,
                options: [
                    { value: "bin", label: "Equal Bins" },
                    { value: "ranges", label: "Custom Ranges" },
                    { value: "floor", label: "Whole Numbers" }
                ],
                onChange: this.handleXformTypeChange
            }), comp);
        }
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
        const exprType = exprUtils.getExprType(axis.expr);
        switch (exprType) {
            case "date":
                return R(ui.ButtonToggleComponent, {
                    value: axis.xform ? axis.xform.type : null,
                    options: [
                        { value: null, label: "Exact Date" },
                        { value: "year", label: "Year" },
                        { value: "yearmonth", label: "Year/Month" },
                        { value: "month", label: "Month" },
                        { value: "week", label: "Week" },
                        { value: "yearweek", label: "Year/Week" },
                        { value: "yearquarter", label: "Year/Quarter" }
                    ],
                    onChange: this.handleXformTypeChange
                });
            case "datetime":
                return R(ui.ButtonToggleComponent, {
                    value: axis.xform ? axis.xform.type : null,
                    options: [
                        { value: "date", label: "Date" },
                        { value: "year", label: "Year" },
                        { value: "yearmonth", label: "Year/Month" },
                        { value: "month", label: "Month" },
                        { value: "week", label: "Week" },
                        { value: "yearweek", label: "Year/Week" },
                        { value: "yearquarter", label: "Year/Quarter" }
                    ],
                    onChange: this.handleXformTypeChange
                });
        }
        return null;
    }
    renderColorMap(axis) {
        if (!this.props.showColorMap || !axis || !axis.expr) {
            return null;
        }
        return [
            R("br"),
            R(AxisColorEditorComponent_1.default, {
                schema: this.props.schema,
                axis,
                categories: this.state.categories,
                onChange: this.props.onChange,
                reorderable: this.props.reorderable,
                defaultColor: this.props.defaultColor,
                allowExcludedValues: this.props.allowExcludedValues,
                autosetColors: this.props.autosetColors,
                initiallyExpanded: true
            })
        ];
    }
    renderExcludedValues(axis) {
        // Only if no color map and allows excluded values
        if (this.props.showColorMap || !axis || !axis.expr || !this.props.allowExcludedValues) {
            return null;
        }
        // Use categories
        if (!this.state.categories || this.state.categories.length < 1) {
            return null;
        }
        return [
            R("br"),
            R(CategoryMapComponent_1.default, {
                schema: this.props.schema,
                axis,
                onChange: this.props.onChange,
                categories: this.state.categories,
                reorderable: false,
                showColorMap: false,
                allowExcludedValues: true,
                initiallyExpanded: true
            })
        ];
    }
    renderFormat(axis) {
        const axisBuilder = new AxisBuilder_1.default({ schema: this.props.schema });
        const valueType = axisBuilder.getAxisType(axis);
        if (!valueType) {
            return null;
        }
        const formats = (0, valueFormatter_1.getFormatOptions)(valueType);
        if (!formats) {
            return null;
        }
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, "Format"), ": ", R("select", {
            value: axis.format != null ? axis.format : (0, valueFormatter_2.getDefaultFormat)(valueType),
            className: "form-select",
            style: { width: "auto", display: "inline-block" },
            onChange: this.handleFormatChange
        }, lodash_1.default.map(formats, (format) => R("option", { key: format.value, value: format.value }, format.label))));
    }
    render() {
        let aggrStatuses;
        const axisBuilder = new AxisBuilder_1.default({ schema: this.props.schema });
        // Clean before render
        const axis = this.cleanAxis(this.props.value);
        // Determine aggrStatuses that are possible
        switch (this.props.aggrNeed) {
            case "none":
                aggrStatuses = ["literal", "individual"];
                break;
            case "optional":
                aggrStatuses = ["literal", "individual", "aggregate"];
                break;
            case "required":
                aggrStatuses = ["literal", "aggregate"];
                break;
        }
        return R("div", null, R("div", null, R(mwater_expressions_ui_1.ExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.table,
            types: axisBuilder.getExprTypes(this.props.types),
            // preventRemove: @props.required
            onChange: this.handleExprChange,
            value: this.props.value ? this.props.value.expr : null,
            aggrStatuses
        })), this.renderXform(axis), this.props.showFormat ? this.renderFormat(axis) : undefined, this.renderColorMap(axis), this.renderExcludedValues(axis));
    }
}
exports.default = AxisComponent;
AxisComponent.defaultProps = {
    reorderable: false,
    allowExcludedValues: false,
    autosetColors: true
};
AxisComponent.contextTypes = { locale: prop_types_1.default.string };
