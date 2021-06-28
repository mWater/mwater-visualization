"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
// Edits the orderings of a chart
// Orderings are an array of { axis: axis to order by, direction: "asc"/"desc" }
// NOTE: no longer uses complete axis, just the expr
class OrderingsComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleAdd = () => {
            const orderings = this.props.orderings.slice();
            orderings.push({ axis: null, direction: "asc" });
            return this.props.onOrderingsChange(orderings);
        };
        this.handleOrderingRemove = (index) => {
            const orderings = this.props.orderings.slice();
            orderings.splice(index, 1);
            return this.props.onOrderingsChange(orderings);
        };
        this.handleOrderingChange = (index, ordering) => {
            const orderings = this.props.orderings.slice();
            orderings[index] = ordering;
            return this.props.onOrderingsChange(orderings);
        };
    }
    render() {
        return R("div", null, lodash_1.default.map(this.props.orderings, (ordering, i) => {
            return R(OrderingComponent, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                ordering,
                table: this.props.table,
                onOrderingChange: this.handleOrderingChange.bind(null, i),
                onOrderingRemove: this.handleOrderingRemove.bind(null, i)
            });
        }), R("button", { type: "button", className: "btn btn-sm btn-default", onClick: this.handleAdd, key: "add" }, R("span", { className: "glyphicon glyphicon-plus" }), " Add Ordering"));
    }
}
exports.default = OrderingsComponent;
class OrderingComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleAxisChange = (axis) => {
            return this.props.onOrderingChange(lodash_1.default.extend({}, this.props.ordering, { axis }));
        };
        this.handleExprChange = (expr) => {
            const axis = lodash_1.default.extend({}, this.props.ordering.axis || {}, { expr });
            return this.handleAxisChange(axis);
        };
        this.handleDirectionChange = (ev) => {
            return this.props.onOrderingChange(lodash_1.default.extend({}, this.props.ordering, { direction: ev.target.checked ? "desc" : "asc" }));
        };
    }
    render() {
        var _a;
        return R("div", { style: { marginLeft: 5 } }, R("div", { style: { textAlign: "right" } }, R("button", { className: "btn btn-xs btn-link", type: "button", onClick: this.props.onOrderingRemove }, R("span", { className: "glyphicon glyphicon-remove" }))), R(mwater_expressions_ui_1.ExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.table,
            types: ["text", "number", "boolean", "date", "datetime"],
            aggrStatuses: ["individual", "aggregate"],
            value: (_a = this.props.ordering.axis) === null || _a === void 0 ? void 0 : _a.expr,
            onChange: this.handleExprChange
        }), R("div", null, R("div", { className: "checkbox-inline" }, R("label", null, R("input", {
            type: "checkbox",
            checked: this.props.ordering.direction === "desc",
            onChange: this.handleDirectionChange
        }), "Reverse"))));
    }
}
