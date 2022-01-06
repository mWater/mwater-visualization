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
const uuid_1 = __importDefault(require("uuid"));
const ui = __importStar(require("react-library/lib/bootstrap"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const TableSelectComponent_1 = __importDefault(require("../../../TableSelectComponent"));
const AxisComponent_1 = __importDefault(require("../../../axes/AxisComponent"));
// Designer for overall chart. Has a special setup mode first time it is run
class PivotChartDesignerComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleTableChange = (table) => {
            // Create default
            const row = { id: uuid_1.default(), label: "" };
            const column = { id: uuid_1.default(), label: "" };
            const intersections = {};
            intersections[`${row.id}:${column.id}`] = { valueAxis: { expr: { type: "op", op: "count", table, exprs: [] } } };
            return this.updateDesign({
                table,
                rows: [row],
                columns: [column],
                intersections
            });
        };
        this.handleColumnChange = (axis) => {
            return this.updateDesign({ columns: [lodash_1.default.extend({}, this.props.design.columns[0], { valueAxis: axis })] });
        };
        this.handleRowChange = (axis) => {
            return this.updateDesign({ rows: [lodash_1.default.extend({}, this.props.design.rows[0], { valueAxis: axis })] });
        };
        this.handleFilterChange = (filter) => {
            return this.updateDesign({ filter });
        };
        this.handleIntersectionValueAxisChange = (valueAxis) => {
            const intersectionId = `${this.props.design.rows[0].id}:${this.props.design.columns[0].id}`;
            const intersections = {};
            intersections[intersectionId] = { valueAxis };
            return this.updateDesign({ intersections });
        };
        this.state = {
            isNew: !props.design.table // True if new pivot table
        };
    }
    // Updates design with the specified changes
    updateDesign(changes) {
        const design = lodash_1.default.extend({}, this.props.design, changes);
        return this.props.onDesignChange(design);
    }
    renderTable() {
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, R("i", { className: "fa fa-database" }), " ", "Data Source"), ": ", R(TableSelectComponent_1.default, {
            schema: this.props.schema,
            value: this.props.design.table,
            onChange: this.handleTableChange,
            filter: this.props.design.filter,
            onFilterChange: this.handleFilterChange
        }));
    }
    renderFilter() {
        // If no table, hide
        if (!this.props.design.table) {
            return null;
        }
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, R("span", { className: "fas fa-filter" }), " ", "Filters"), R("div", { style: { marginLeft: 8 } }, R(mwater_expressions_ui_1.FilterExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: this.handleFilterChange,
            table: this.props.design.table,
            value: this.props.design.filter
        })));
    }
    renderStriping() {
        // If no table, hide
        if (!this.props.design.table) {
            return null;
        }
        return R(ui.FormGroup, {
            labelMuted: true,
            label: "Striping"
        }, react_1.default.createElement(ui.Radio, { key: "none", inline: true, radioValue: null, value: this.props.design.striping || null, onChange: (value) => this.updateDesign({ striping: value }) }, "None"), react_1.default.createElement(ui.Radio, { key: "columns", inline: true, radioValue: "columns", value: this.props.design.striping, onChange: (value) => this.updateDesign({ striping: value }) }, "Columns"), react_1.default.createElement(ui.Radio, { key: "rows", inline: true, value: this.props.design.striping, radioValue: "rows", onChange: (value) => this.updateDesign({ striping: value }) }, "Rows"));
    }
    // Show setup options
    renderSetup() {
        const intersectionId = `${this.props.design.rows[0].id}:${this.props.design.columns[0].id}`;
        return R("div", null, R(ui.FormGroup, {
            labelMuted: true,
            label: "Columns",
            help: "Field to optionally make columns out of"
        }, R(AxisComponent_1.default, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.design.table,
            types: ["enum", "text", "boolean", "date"],
            aggrNeed: "none",
            value: this.props.design.columns[0].valueAxis,
            onChange: this.handleColumnChange,
            filters: this.props.filters
        })), R(ui.FormGroup, {
            labelMuted: true,
            label: "Rows",
            help: "Field to optionally make rows out of"
        }, R(AxisComponent_1.default, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.design.table,
            types: ["enum", "text", "boolean", "date"],
            aggrNeed: "none",
            value: this.props.design.rows[0].valueAxis,
            onChange: this.handleRowChange,
            filters: this.props.filters
        })), R(ui.FormGroup, {
            labelMuted: true,
            label: "Value",
            help: "Field show in cells"
        }, R(AxisComponent_1.default, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.design.table,
            types: ["enum", "text", "boolean", "date", "number"],
            aggrNeed: "required",
            value: this.props.design.intersections[intersectionId].valueAxis,
            onChange: this.handleIntersectionValueAxisChange,
            showFormat: true,
            filters: this.props.filters
        })));
    }
    render() {
        return R("div", null, this.renderTable(), this.state.isNew && this.props.design.table ? this.renderSetup() : undefined, this.renderFilter(), this.renderStriping());
    }
}
exports.default = PivotChartDesignerComponent;
