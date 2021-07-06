"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const async_1 = __importDefault(require("react-select/async"));
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_2 = require("mwater-expressions");
// Displays a combo box that allows selecting single or multiple text values from an expression
// The expression can be type `text` or `text[]`
class TextLiteralComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleSingleChange = (val) => {
            const value = val ? val.value || null : null; // Blank is null
            return this.props.onChange(value);
        };
        this.handleMultipleChange = (val) => {
            const value = val ? lodash_1.default.pluck(val, "value") : [];
            if (value.length > 0) {
                return this.props.onChange(value);
            }
            else {
                return this.props.onChange(null);
            }
        };
        this.getOptions = (input, cb) => {
            // Determine type of expression
            let filters;
            const exprUtils = new mwater_expressions_2.ExprUtils(this.props.schema);
            const exprType = exprUtils.getExprType(this.props.expr);
            // Create query to get matches
            const exprCompiler = new mwater_expressions_1.ExprCompiler(this.props.schema);
            // Add filter for input (simple if just text)
            if (exprType === "text") {
                filters = this.props.filters || [];
                if (input) {
                    filters.push({
                        table: this.props.expr.table,
                        jsonql: {
                            type: "op",
                            op: "~*",
                            exprs: [
                                exprCompiler.compileExpr({ expr: this.props.expr, tableAlias: "{alias}" }),
                                escapeRegex(input) // Don't use _.escapeRegExp as adds weird backslashes that postgres doesn't like
                            ]
                        }
                    });
                }
            }
            else if (exprType === "text[]") {
                // Special filter for text[]
                filters = this.props.filters || [];
                if (input) {
                    filters.push({
                        table: "_values_",
                        jsonql: {
                            type: "op",
                            op: "~*",
                            exprs: [
                                { type: "field", tableAlias: "{alias}", column: "value" },
                                "^" + escapeRegex(input) // Don't use _.escapeRegExp as adds weird backslashes that postgres doesn't like
                            ]
                        }
                    });
                }
            }
            else {
                return;
            }
            // Execute query
            this.props.quickfiltersDataSource.getValues(this.props.index, this.props.expr, filters, null, 250, (err, values) => {
                if (err) {
                    return;
                }
                // Filter null and blank
                values = lodash_1.default.filter(values, (value) => value);
                return cb(lodash_1.default.map(values, (value) => ({
                    value,
                    label: value
                })));
            });
        };
    }
    renderSingle() {
        const currentValue = this.props.value ? { value: this.props.value, label: this.props.value } : null;
        return R(async_1.default, {
            key: JSON.stringify(this.props.filters),
            placeholder: "All",
            value: currentValue,
            loadOptions: this.getOptions,
            onChange: this.props.onChange ? this.handleSingleChange : undefined,
            isClearable: true,
            defaultOptions: true,
            isDisabled: this.props.onChange == null,
            noOptionsMessage: () => "Type to search",
            styles: {
                // Keep menu above fixed data table headers
                menu: (style) => lodash_1.default.extend({}, style, { zIndex: 2000 })
            }
        });
    }
    renderMultiple() {
        const currentValue = this.props.value ? lodash_1.default.map(this.props.value, (v) => ({ value: v, label: v })) : null;
        return R(async_1.default, {
            placeholder: "All",
            value: currentValue,
            key: JSON.stringify(this.props.filters),
            isMulti: true,
            loadOptions: this.getOptions,
            defaultOptions: true,
            onChange: this.props.onChange ? this.handleMultipleChange : undefined,
            isClearable: true,
            isDisabled: this.props.onChange == null,
            noOptionsMessage: () => "Type to search",
            styles: {
                // Keep menu above fixed data table headers
                menu: (style) => lodash_1.default.extend({}, style, { zIndex: 2000 })
            }
        });
    }
    render() {
        return R("div", { style: { width: "100%" } }, this.props.multi ? this.renderMultiple() : this.renderSingle());
    }
}
exports.default = TextLiteralComponent;
TextLiteralComponent.propTypes = {
    value: prop_types_1.default.any,
    onChange: prop_types_1.default.func,
    schema: prop_types_1.default.object.isRequired,
    quickfiltersDataSource: prop_types_1.default.object.isRequired,
    expr: prop_types_1.default.object.isRequired,
    index: prop_types_1.default.number.isRequired,
    multi: prop_types_1.default.bool,
    // Filters to add to the component to restrict values
    filters: prop_types_1.default.arrayOf(prop_types_1.default.shape({
        table: prop_types_1.default.string.isRequired,
        jsonql: prop_types_1.default.object.isRequired // jsonql filter with {alias} for tableAlias
    }))
};
function escapeRegex(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}
