"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let QuickfiltersComponent;
const lodash_1 = __importDefault(require("lodash"));
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const react_select_1 = __importDefault(require("react-select"));
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_2 = require("mwater-expressions");
const TextLiteralComponent_1 = __importDefault(require("./TextLiteralComponent"));
const DateExprComponent_1 = __importDefault(require("./DateExprComponent"));
const QuickfilterCompiler_1 = __importDefault(require("./QuickfilterCompiler"));
const IdArrayQuickfilterComponent_1 = __importDefault(require("./IdArrayQuickfilterComponent"));
// Displays quick filters and allows their value to be modified
exports.default = QuickfiltersComponent = (function () {
    var _a;
    QuickfiltersComponent = (_a = class QuickfiltersComponent extends react_1.default.Component {
            renderQuickfilter(item, index) {
                // Skip if merged
                let onValueChange;
                if (item.merged) {
                    return null;
                }
                let values = this.props.values || [];
                let itemValue = values[index];
                // Clean expression first
                const expr = new mwater_expressions_2.ExprCleaner(this.props.schema).cleanExpr(item.expr);
                // Do not render if nothing
                if (!expr) {
                    return null;
                }
                // Get type of expr
                const type = new mwater_expressions_1.ExprUtils(this.props.schema).getExprType(expr);
                // Determine if locked
                const lock = lodash_1.default.find(this.props.locks, (lock) => lodash_1.default.isEqual(lock.expr, expr));
                if (lock) {
                    // Overrides item value
                    itemValue = lock.value;
                    onValueChange = null;
                }
                else {
                    // Can change value if not locked
                    onValueChange = (v) => {
                        values = (this.props.values || []).slice();
                        values[index] = v;
                        // Also set any subsequent merged ones
                        for (let start = index + 1, i = start, end = this.props.design.length, asc = start <= end; asc ? i < end : i > end; asc ? i++ : i--) {
                            if (this.props.design[i].merged) {
                                values[i] = v;
                            }
                            else {
                                break;
                            }
                        }
                        return this.props.onValuesChange(values);
                    };
                }
                // Determine additional filters that come from other quickfilters. This is to make sure that each quickfilter is filtered
                // by any other active quickfilters (excluding self)
                const compiler = new QuickfilterCompiler_1.default(this.props.schema);
                const otherDesign = (this.props.design || []).slice();
                const otherValues = (this.props.values || []).slice();
                const otherLocks = (this.props.locks || []).slice();
                otherDesign.splice(index, 1);
                otherValues.splice(index, 1);
                otherLocks.splice(index, 1);
                const otherQuickFilterFilters = compiler.compile(otherDesign, otherValues, otherLocks);
                const filters = (this.props.filters || []).concat(otherQuickFilterFilters);
                if (["enum", "enumset"].includes(type)) {
                    return R(EnumQuickfilterComponent, {
                        key: JSON.stringify(item),
                        label: item.label,
                        expr,
                        schema: this.props.schema,
                        options: new mwater_expressions_1.ExprUtils(this.props.schema).getExprEnumValues(expr),
                        value: itemValue,
                        onValueChange,
                        multi: item.multi
                    });
                }
                if (type === "text") {
                    return R(TextQuickfilterComponent, {
                        key: JSON.stringify(item),
                        index,
                        label: item.label,
                        expr,
                        schema: this.props.schema,
                        quickfiltersDataSource: this.props.quickfiltersDataSource,
                        value: itemValue,
                        onValueChange,
                        filters,
                        multi: item.multi
                    });
                }
                if (["date", "datetime"].includes(type)) {
                    return R(DateQuickfilterComponent, {
                        key: JSON.stringify(item),
                        label: item.label,
                        expr,
                        schema: this.props.schema,
                        value: itemValue,
                        onValueChange
                    });
                }
                if (type === "id[]") {
                    return R(IdArrayQuickfilterComponent_1.default, {
                        key: JSON.stringify(item),
                        index,
                        label: item.label,
                        expr,
                        schema: this.props.schema,
                        dataSource: this.props.dataSource,
                        value: itemValue,
                        onValueChange,
                        filters,
                        multi: item.multi
                    });
                }
                if (type === "text[]") {
                    return R(TextArrayQuickfilterComponent, {
                        key: JSON.stringify(item),
                        index,
                        label: item.label,
                        expr,
                        schema: this.props.schema,
                        quickfiltersDataSource: this.props.quickfiltersDataSource,
                        value: itemValue,
                        onValueChange,
                        filters,
                        multi: item.multi
                    });
                }
            }
            render() {
                if (!this.props.design || this.props.design.length === 0) {
                    return null;
                }
                return R("div", {
                    style: {
                        borderTop: !this.props.hideTopBorder ? "solid 1px #E8E8E8" : undefined,
                        borderBottom: "solid 1px #E8E8E8",
                        padding: 5
                    }
                }, lodash_1.default.map(this.props.design, (item, i) => this.renderQuickfilter(item, i)), this.props.onHide
                    ? R("button", { className: "btn btn-xs btn-link", onClick: this.props.onHide }, R("i", { className: "fa fa-angle-double-up" }))
                    : undefined);
            }
        },
        _a.propTypes = {
            design: prop_types_1.default.arrayOf(prop_types_1.default.shape({
                expr: prop_types_1.default.object.isRequired,
                label: prop_types_1.default.string
            })),
            values: prop_types_1.default.array,
            onValuesChange: prop_types_1.default.func.isRequired,
            // Locked quickfilters. Locked ones cannot be changed and are shown with a lock
            locks: prop_types_1.default.arrayOf(prop_types_1.default.shape({
                expr: prop_types_1.default.object.isRequired,
                value: prop_types_1.default.any
            })),
            schema: prop_types_1.default.object.isRequired,
            dataSource: prop_types_1.default.object.isRequired,
            quickfiltersDataSource: prop_types_1.default.object.isRequired,
            // Filters to add to restrict quick filter data to
            filters: prop_types_1.default.arrayOf(prop_types_1.default.shape({
                table: prop_types_1.default.string.isRequired,
                jsonql: prop_types_1.default.object.isRequired // jsonql filter with {alias} for tableAlias
            })),
            // True to hide top border
            hideTopBorder: prop_types_1.default.bool,
            // Called when user hides the quickfilter bar
            onHide: prop_types_1.default.func
        },
        _a);
    return QuickfiltersComponent;
})();
// Quickfilter for an enum
class EnumQuickfilterComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleSingleChange = (val) => {
            if (val) {
                return this.props.onValueChange(val);
            }
            else {
                return this.props.onValueChange(null);
            }
        };
        this.handleMultiChange = (val) => {
            if ((val === null || val === void 0 ? void 0 : val.length) > 0) {
                return this.props.onValueChange(lodash_1.default.pluck(val, "value"));
            }
            else {
                return this.props.onValueChange(null);
            }
        };
    }
    renderSingleSelect(options) {
        return R(react_select_1.default, {
            placeholder: "All",
            value: lodash_1.default.findWhere(options, { value: this.props.value }) || null,
            options,
            isClearable: true,
            onChange: (value) => {
                if (this.props.onValueChange) {
                    return this.handleSingleChange(value === null || value === void 0 ? void 0 : value.value);
                }
            },
            isDisabled: this.props.onValueChange == null,
            styles: {
                // Keep menu above fixed data table headers
                menu: (style) => lodash_1.default.extend({}, style, { zIndex: 2000 })
            }
        });
    }
    renderMultiSelect(options) {
        return R(react_select_1.default, {
            placeholder: "All",
            value: lodash_1.default.map(this.props.value, (v) => lodash_1.default.find(options, (o) => o.value === v)),
            isClearable: true,
            isMulti: true,
            options,
            onChange: this.props.onValueChange ? this.handleMultiChange : undefined,
            isDisabled: this.props.onValueChange == null,
            styles: {
                // Keep menu above fixed data table headers
                menu: (style) => lodash_1.default.extend({}, style, { zIndex: 2000 })
            }
        });
    }
    render() {
        var _a, _b;
        const options = lodash_1.default.map(this.props.options, (opt) => ({
            value: opt.id,
            label: mwater_expressions_1.ExprUtils.localizeString(opt.name, this.context.locale)
        }));
        // Determine width, estimating about 8 px per letter with 120px padding
        let width = (_b = (_a = lodash_1.default.max(options, (o) => o.label.length)) === null || _a === void 0 ? void 0 : _a.label) === null || _b === void 0 ? void 0 : _b.length;
        width = width ? width * 8 + 120 : 280;
        const minWidth = width > 280 || this.props.multi ? "280px" : `${width}px`;
        return R("div", { style: { display: "inline-block", paddingRight: 10 } }, this.props.label ? R("span", { style: { color: "gray" } }, this.props.label + ":\u00a0") : undefined, R("div", { style: { display: "inline-block", minWidth, verticalAlign: "middle" } }, this.props.multi ? this.renderMultiSelect(options) : this.renderSingleSelect(options)), !this.props.onValueChange ? R("i", { className: "text-warning fa fa-fw fa-lock" }) : undefined);
    }
}
EnumQuickfilterComponent.propTypes = {
    label: prop_types_1.default.string,
    schema: prop_types_1.default.object.isRequired,
    options: prop_types_1.default.arrayOf(prop_types_1.default.shape({
        id: prop_types_1.default.string.isRequired,
        name: prop_types_1.default.object.isRequired // Localized name
    })).isRequired,
    multi: prop_types_1.default.bool,
    value: prop_types_1.default.any,
    onValueChange: prop_types_1.default.func // Called when value changes
};
EnumQuickfilterComponent.contextTypes = { locale: prop_types_1.default.string };
// Quickfilter for a text value
class TextQuickfilterComponent extends react_1.default.Component {
    render() {
        return R("div", { style: { display: "inline-block", paddingRight: 10 } }, this.props.label ? R("span", { style: { color: "gray" } }, this.props.label + ":\u00a0") : undefined, R("div", { style: { display: "inline-block", minWidth: "280px", verticalAlign: "middle" } }, R(TextLiteralComponent_1.default, {
            value: this.props.value,
            onChange: this.props.onValueChange,
            schema: this.props.schema,
            expr: this.props.expr,
            index: this.props.index,
            multi: this.props.multi,
            quickfiltersDataSource: this.props.quickfiltersDataSource,
            filters: this.props.filters
        })), !this.props.onValueChange ? R("i", { className: "text-warning fa fa-fw fa-lock" }) : undefined);
    }
}
TextQuickfilterComponent.propTypes = {
    label: prop_types_1.default.string.isRequired,
    schema: prop_types_1.default.object.isRequired,
    quickfiltersDataSource: prop_types_1.default.object.isRequired,
    expr: prop_types_1.default.object.isRequired,
    index: prop_types_1.default.number.isRequired,
    value: prop_types_1.default.any,
    onValueChange: prop_types_1.default.func,
    multi: prop_types_1.default.bool,
    // Filters to add to the quickfilter to restrict values
    filters: prop_types_1.default.arrayOf(prop_types_1.default.shape({
        table: prop_types_1.default.string.isRequired,
        jsonql: prop_types_1.default.object.isRequired // jsonql filter with {alias} for tableAlias
    }))
};
// Quickfilter for a date value
class DateQuickfilterComponent extends react_1.default.Component {
    render() {
        return R("div", { style: { display: "inline-block", paddingRight: 10 } }, this.props.label ? R("span", { style: { color: "gray" } }, this.props.label + ":\u00a0") : undefined, R("div", { style: { display: "inline-block", minWidth: "280px", verticalAlign: "middle" } }, R(DateExprComponent_1.default, {
            datetime: new mwater_expressions_1.ExprUtils(this.props.schema).getExprType(this.props.expr) === "datetime",
            value: this.props.value,
            onChange: this.props.onValueChange
        })), !this.props.onValueChange ? R("i", { className: "text-warning fa fa-fw fa-lock" }) : undefined);
    }
}
DateQuickfilterComponent.propTypes = {
    label: prop_types_1.default.string,
    schema: prop_types_1.default.object.isRequired,
    expr: prop_types_1.default.object.isRequired,
    value: prop_types_1.default.any,
    onValueChange: prop_types_1.default.func.isRequired
};
// Quickfilter for a text value
class TextArrayQuickfilterComponent extends react_1.default.Component {
    render() {
        return R("div", { style: { display: "inline-block", paddingRight: 10 } }, this.props.label ? R("span", { style: { color: "gray" } }, this.props.label + ":\u00a0") : undefined, R("div", { style: { display: "inline-block", minWidth: "280px", verticalAlign: "middle" } }, R(TextLiteralComponent_1.default, {
            value: this.props.value,
            onChange: this.props.onValueChange,
            schema: this.props.schema,
            expr: this.props.expr,
            index: this.props.index,
            multi: this.props.multi,
            quickfiltersDataSource: this.props.quickfiltersDataSource,
            filters: this.props.filters
        })), !this.props.onValueChange ? R("i", { className: "text-warning fa fa-fw fa-lock" }) : undefined);
    }
}
TextArrayQuickfilterComponent.propTypes = {
    label: prop_types_1.default.string.isRequired,
    schema: prop_types_1.default.object.isRequired,
    quickfiltersDataSource: prop_types_1.default.object.isRequired,
    expr: prop_types_1.default.object.isRequired,
    index: prop_types_1.default.number.isRequired,
    value: prop_types_1.default.any,
    onValueChange: prop_types_1.default.func,
    multi: prop_types_1.default.bool,
    // Filters to add to the quickfilter to restrict values
    filters: prop_types_1.default.arrayOf(prop_types_1.default.shape({
        table: prop_types_1.default.string.isRequired,
        jsonql: prop_types_1.default.object.isRequired // jsonql filter with {alias} for tableAlias
    }))
};
