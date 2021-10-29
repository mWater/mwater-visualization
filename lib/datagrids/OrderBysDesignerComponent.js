"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const bootstrap_1 = require("react-library/lib/bootstrap");
// Edits an orderBys which is a list of expressions and directions. See README.md
class OrderBysDesignerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (index, orderBy) => {
            const orderBys = this.props.orderBys.slice();
            orderBys[index] = orderBy;
            return this.props.onChange(orderBys);
        };
        this.handleRemove = (index) => {
            const orderBys = this.props.orderBys.slice();
            orderBys.splice(index, 1);
            return this.props.onChange(orderBys);
        };
        this.handleAdd = () => {
            const orderBys = this.props.orderBys.slice();
            orderBys.push({ expr: null, direction: "asc" });
            return this.props.onChange(orderBys);
        };
    }
    render() {
        return R("div", null, lodash_1.default.map(this.props.orderBys, (orderBy, index) => {
            return R(OrderByDesignerComponent, {
                key: index,
                schema: this.props.schema,
                table: this.props.table,
                dataSource: this.props.dataSource,
                orderBy,
                onChange: this.handleChange.bind(null, index),
                onRemove: this.handleRemove.bind(null, index)
            });
        }), R("button", {
            key: "add",
            type: "button",
            className: "btn btn-link",
            onClick: this.handleAdd
        }, R("span", { className: "fas fa-plus" }), " Add Ordering"));
    }
}
exports.default = OrderBysDesignerComponent;
OrderBysDesignerComponent.defaultProps = { orderBys: [] };
class OrderByDesignerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleExprChange = (expr) => {
            return this.props.onChange(lodash_1.default.extend({}, this.props.orderBy, { expr }));
        };
        this.handleDirectionChange = (value) => {
            return this.props.onChange(lodash_1.default.extend({}, this.props.orderBy, { direction: value ? "desc" : "asc" }));
        };
    }
    render() {
        return R("div", { className: "row" }, R("div", { className: "col-7" }, R(mwater_expressions_ui_1.ExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.table,
            types: ["text", "number", "boolean", "date", "datetime"],
            aggrStatuses: ["individual", "literal", "aggregate"],
            value: this.props.orderBy.expr,
            onChange: this.handleExprChange
        })), R("div", { className: "col-3" }, react_1.default.createElement(bootstrap_1.Checkbox, { inline: true, value: this.props.orderBy.direction === "desc", onChange: this.handleDirectionChange }, "Reverse")), R("div", { className: "col-1" }, R("button", { className: "btn btn-sm btn-link", type: "button", onClick: this.props.onRemove }, R("span", { className: "fas fa-times" }))));
    }
}
