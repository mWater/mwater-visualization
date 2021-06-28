"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let IdArrayQuickfilterComponent;
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
// Quickfilter for an id[]
exports.default = IdArrayQuickfilterComponent = (function () {
    IdArrayQuickfilterComponent = class IdArrayQuickfilterComponent extends react_1.default.Component {
        static initClass() {
            this.propTypes = {
                label: prop_types_1.default.string.isRequired,
                schema: prop_types_1.default.object.isRequired,
                dataSource: prop_types_1.default.object.isRequired,
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
        }
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
    };
    IdArrayQuickfilterComponent.initClass();
    return IdArrayQuickfilterComponent;
})();
