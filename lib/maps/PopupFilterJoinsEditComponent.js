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
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const mwater_expressions_1 = require("mwater-expressions");
const DashboardUtils = __importStar(require("../dashboards/DashboardUtils"));
// Designer for popup filter joins (see PopupFilterJoins.md)
class PopupFilterJoinsEditComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleExprChange = (table, expr) => {
            let design = this.props.design || this.props.defaultPopupFilterJoins;
            design = lodash_1.default.clone(design);
            design[table] = expr;
            return this.props.onDesignChange(design);
        };
        this.state = {
            expanded: false
        };
    }
    render() {
        if (!this.state.expanded) {
            return R("a", { className: "btn btn-link", onClick: () => this.setState({ expanded: true }) }, "Advanced Popup Options");
        }
        // Get filterable tables of popup
        const popupDashboard = { items: this.props.popup.items, layout: "blocks" };
        let filterableTables = DashboardUtils.getFilterableTables(popupDashboard, this.props.schema);
        // Always include self as first
        filterableTables = [this.props.table].concat(lodash_1.default.without(filterableTables, this.props.table));
        // Get popupFilterJoins
        const popupFilterJoins = this.props.design || this.props.defaultPopupFilterJoins;
        return R("div", null, R("div", { className: "text-muted" }, "Optional connections for other tables to filtering the popup"), R("table", { className: "table table-sm table-bordered" }, R("thead", null, R("tr", null, R("th", null, "Data Source"), R("th", null, "Connection"))), R("tbody", null, lodash_1.default.map(filterableTables, (filterableTable) => {
            var _a;
            return R("tr", { key: filterableTable }, R("td", { style: { verticalAlign: "middle" } }, mwater_expressions_1.ExprUtils.localizeString((_a = this.props.schema.getTable(filterableTable)) === null || _a === void 0 ? void 0 : _a.name)), R("td", null, R(mwater_expressions_ui_1.ExprComponent, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: filterableTable,
                value: popupFilterJoins[filterableTable],
                onChange: this.handleExprChange.bind(null, filterableTable),
                types: this.props.table === this.props.idTable ? ["id", "id[]"] : ["id"],
                idTable: this.props.idTable,
                preferLiteral: false,
                placeholder: "None"
            })));
        }))));
    }
}
exports.default = PopupFilterJoinsEditComponent;
