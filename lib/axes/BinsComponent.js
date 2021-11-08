"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const update_object_1 = __importDefault(require("update-object"));
const mwater_expressions_1 = require("mwater-expressions");
const AxisBuilder_1 = __importDefault(require("./AxisBuilder"));
const NumberInputComponent_1 = __importDefault(require("react-library/lib/NumberInputComponent"));
const bootstrap_1 = require("react-library/lib/bootstrap");
// Allows setting of bins (min, max and number). Computes defaults if not present
class BinsComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            guessing: false // True when guessing ranges
        };
    }
    componentDidMount() {
        var _a;
        // Check if computing is needed
        if (this.props.xform.min == null || this.props.xform.max == null) {
            // Only do for individual (not aggregate) expressions
            const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
            if (exprUtils.getExprAggrStatus(this.props.expr) !== "individual") {
                // Percent is a special case where 0-100
                if (((_a = this.props.expr) === null || _a === void 0 ? void 0 : _a.op) === "percent where") {
                    this.props.onChange(update_object_1.default(this.props.xform, {
                        min: { $set: 0 },
                        max: { $set: 100 },
                        excludeLower: { $set: true },
                        excludeUpper: { $set: true }
                    }));
                }
                return;
            }
            const axisBuilder = new AxisBuilder_1.default({ schema: this.props.schema });
            // Get min and max from a query
            const minMaxQuery = axisBuilder.compileBinMinMax(this.props.expr, this.props.expr.table, null, this.props.xform.numBins);
            if (!minMaxQuery) {
                return;
            }
            this.setState({ guessing: true });
            return this.props.dataSource.performQuery(minMaxQuery, (error, rows) => {
                let max, min;
                if (this.unmounted) {
                    return;
                }
                this.setState({ guessing: false });
                if (error) {
                    return; // Ignore
                }
                if (rows[0].min != null) {
                    min = parseFloat(rows[0].min);
                    max = parseFloat(rows[0].max);
                }
                return this.props.onChange(update_object_1.default(this.props.xform, { min: { $set: min }, max: { $set: max } }));
            });
        }
    }
    componentWillUnmount() {
        return (this.unmounted = true);
    }
    render() {
        return R("div", null, R("div", { key: "vals" }, R(LabeledInlineComponent, { key: "min", label: "Min:" }, R(NumberInputComponent_1.default, {
            small: true,
            value: this.props.xform.min,
            onChange: (v) => this.props.onChange(update_object_1.default(this.props.xform, { min: { $set: v } }))
        })), " ", R(LabeledInlineComponent, { key: "max", label: "Max:" }, R(NumberInputComponent_1.default, {
            small: true,
            value: this.props.xform.max,
            onChange: (v) => this.props.onChange(update_object_1.default(this.props.xform, { max: { $set: v } }))
        })), " ", R(LabeledInlineComponent, { key: "numBins", label: "# of Bins:" }, R(NumberInputComponent_1.default, {
            small: true,
            value: this.props.xform.numBins,
            decimal: false,
            onChange: (v) => this.props.onChange(update_object_1.default(this.props.xform, { numBins: { $set: v } }))
        })), (() => {
            if (this.state.guessing) {
                return R("i", { className: "fa fa-spinner fa-spin" });
            }
            else if (this.props.xform.min == null || this.props.xform.max == null || !this.props.xform.numBins) {
                return R("span", { className: "text-danger", style: { paddingLeft: 10 } }, "Min and max are required");
            }
            return null;
        })()), this.props.xform.min != null && this.props.xform.max != null && this.props.xform.numBins ? (react_1.default.createElement("div", { key: "excludes" },
            react_1.default.createElement(bootstrap_1.Checkbox, { key: "lower", inline: true, value: !this.props.xform.excludeLower, onChange: (value) => this.props.onChange(update_object_1.default(this.props.xform, { excludeLower: { $set: !value } })) }, `Include < ${this.props.xform.min}`),
            react_1.default.createElement(bootstrap_1.Checkbox, { key: "upper", inline: true, value: !this.props.xform.excludeUpper, onChange: (value) => this.props.onChange(update_object_1.default(this.props.xform, { excludeUpper: { $set: !value } })) }, `Include > ${this.props.xform.max}`))) : undefined);
    }
}
exports.default = BinsComponent;
function LabeledInlineComponent(props) {
    return R("div", { style: { display: "inline-block" } }, R("label", { className: "text-muted" }, props.label), props.children);
}
