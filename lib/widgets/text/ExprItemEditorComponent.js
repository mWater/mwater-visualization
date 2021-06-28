"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const TableSelectComponent_1 = __importDefault(require("../../TableSelectComponent"));
const valueFormatter_1 = require("../../valueFormatter");
const valueFormatter_2 = require("../../valueFormatter");
// Expression editor that allows changing an expression item
class ExprItemEditorComponent extends react_1.default.Component {
    constructor(props) {
        var _a;
        super(props);
        this.handleTableChange = (table) => {
            return this.setState({ table });
        };
        this.handleExprChange = (expr) => {
            const exprItem = lodash_1.default.extend({}, this.props.exprItem, { expr });
            return this.props.onChange(exprItem);
        };
        this.handleIncludeLabelChange = (ev) => {
            const exprItem = lodash_1.default.extend({}, this.props.exprItem, {
                includeLabel: ev.target.checked,
                labelText: ev.target.checked ? this.props.exprItem.labelText : undefined
            });
            return this.props.onChange(exprItem);
        };
        this.handleLabelTextChange = (ev) => {
            const exprItem = lodash_1.default.extend({}, this.props.exprItem, { labelText: ev.target.value || null });
            return this.props.onChange(exprItem);
        };
        this.handleFormatChange = (ev) => {
            const exprItem = lodash_1.default.extend({}, this.props.exprItem, { format: ev.target.value || null });
            return this.props.onChange(exprItem);
        };
        // Keep table in state as it can be set before the expression
        this.state = {
            table: ((_a = props.exprItem.expr) === null || _a === void 0 ? void 0 : _a.table) || props.singleRowTable
        };
    }
    renderFormat() {
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
        const exprType = exprUtils.getExprType(this.props.exprItem.expr);
        const formats = valueFormatter_1.getFormatOptions(exprType);
        if (!formats) {
            return null;
        }
        return R("div", { className: "form-group" }, R("label", { className: "text-muted" }, "Format"), ": ", R("select", {
            value: this.props.exprItem.format != null ? this.props.exprItem.format : valueFormatter_2.getDefaultFormat(exprType),
            className: "form-control",
            style: { width: "auto", display: "inline-block" },
            onChange: this.handleFormatChange
        }, lodash_1.default.map(formats, (format) => R("option", { key: format.value, value: format.value }, format.label))));
    }
    render() {
        return R("div", { style: { paddingBottom: 200 } }, R("div", { className: "form-group" }, R("label", { className: "text-muted" }, R("i", { className: "fa fa-database" }), " ", "Data Source"), ": ", R(TableSelectComponent_1.default, {
            schema: this.props.schema,
            value: this.state.table,
            onChange: this.handleTableChange
        }), R("br")), this.state.table
            ? R("div", { className: "form-group" }, R("label", { className: "text-muted" }, "Field"), ": ", R(mwater_expressions_ui_1.ExprComponent, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: this.state.table,
                types: ["text", "number", "enum", "date", "datetime", "boolean", "enumset", "geometry"],
                value: this.props.exprItem.expr,
                aggrStatuses: ["individual", "literal", "aggregate"],
                onChange: this.handleExprChange
            }))
            : undefined, this.state.table && this.props.exprItem.expr
            ? R("div", { className: "form-group" }, R("label", { key: "includeLabel" }, R("input", {
                type: "checkbox",
                checked: this.props.exprItem.includeLabel,
                onChange: this.handleIncludeLabelChange
            }), " Include Label"), this.props.exprItem.includeLabel
                ? R("input", {
                    key: "labelText",
                    className: "form-control",
                    type: "text",
                    value: this.props.exprItem.labelText || "",
                    onChange: this.handleLabelTextChange,
                    placeholder: new mwater_expressions_1.ExprUtils(this.props.schema).summarizeExpr(this.props.exprItem.expr) + ": "
                })
                : undefined)
            : undefined, this.renderFormat());
    }
}
exports.default = ExprItemEditorComponent;
