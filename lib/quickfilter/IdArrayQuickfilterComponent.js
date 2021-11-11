"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
// Quickfilter for an id[]
class IdArrayQuickfilterComponent extends react_1.default.Component {
    render() {
        // Determine table
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
        const idTable = exprUtils.getExprIdTable(this.props.expr);
        return R("div", { style: { display: "inline-block", paddingRight: 10 } }, this.props.label ? R("span", { style: { color: "gray" } }, this.props.label + ":\u00a0") : undefined, R("div", { style: { display: "inline-block", minWidth: "280px", verticalAlign: "middle" } }, 
        // TODO should use quickfilter data source, but is complicated
        R(mwater_expressions_ui_1.IdLiteralComponent, {
            value: this.props.value,
            onChange: this.props.onValueChange,
            idTable,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            placeholder: "All",
            multi: this.props.multi
            // TODO Does not use filters that are passed in
        })), !this.props.onValueChange ? R("i", { className: "text-warning fa fa-fw fa-lock" }) : undefined);
    }
}
exports.default = IdArrayQuickfilterComponent;
