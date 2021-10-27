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
const ui = __importStar(require("../../../UIComponents"));
const AxisComponent_1 = __importDefault(require("../../../axes/AxisComponent"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const TableSelectComponent_1 = __importDefault(require("../../../TableSelectComponent"));
const ColorComponent_1 = __importDefault(require("../../../ColorComponent"));
class CalendarChartDesignerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleTitleTextChange = (ev) => {
            this.updateDesign({ titleText: ev.target.value });
        };
        this.handleTableChange = (table) => {
            this.updateDesign({ table });
        };
        this.handleFilterChange = (filter) => {
            this.updateDesign({ filter });
        };
        this.handleDateAxisChange = (dateAxis) => {
            // Default value axis to count if date axis present
            if (!this.props.design.valueAxis && dateAxis) {
                // Create count expr
                const valueAxis = { expr: { type: "op", op: "count", table: this.props.design.table, exprs: [] }, xform: null };
                this.updateDesign({ dateAxis, valueAxis });
            }
            else {
                this.updateDesign({ dateAxis });
            }
        };
        this.handleValueAxisChange = (valueAxis) => {
            this.updateDesign({ valueAxis });
        };
        this.handleCellColorChange = (cellColor) => {
            this.updateDesign({ cellColor });
        };
    }
    // Updates design with the specified changes
    updateDesign(changes) {
        const design = lodash_1.default.extend({}, this.props.design, changes);
        this.props.onDesignChange(design);
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
    renderTitle() {
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, "Title"), R("input", {
            type: "text",
            className: "form-control form-control-sm",
            value: this.props.design.titleText,
            onChange: this.handleTitleTextChange,
            placeholder: "Untitled"
        }));
    }
    renderFilter() {
        // If no table, hide
        if (!this.props.design.table) {
            return null;
        }
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, R("span", { className: "fas fa-filter" }), " ", "Filters"), R("div", { style: { marginLeft: 8 } }, react_1.default.createElement(mwater_expressions_ui_1.FilterExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: this.handleFilterChange,
            table: this.props.design.table,
            value: this.props.design.filter
        })));
    }
    renderDateAxis() {
        if (!this.props.design.table) {
            return;
        }
        return R(ui.SectionComponent, { label: "Date Axis" }, R(AxisComponent_1.default, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.design.table,
            types: ["date"],
            aggrNeed: "none",
            required: true,
            value: this.props.design.dateAxis,
            onChange: this.handleDateAxisChange,
            filters: this.props.filter
        }));
    }
    renderValueAxis() {
        if (!this.props.design.table || !this.props.design.dateAxis) {
            return;
        }
        return R(ui.SectionComponent, { label: "Value Axis" }, R(AxisComponent_1.default, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.design.table,
            types: ["number"],
            aggrNeed: "required",
            required: true,
            value: this.props.design.valueAxis,
            onChange: this.handleValueAxisChange,
            filters: this.props.filter
        }));
    }
    renderCellColor() {
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, R("span", { className: "fas fa-tint" }), "Cell Color"), R("div", null, R(ColorComponent_1.default, {
            color: this.props.design.cellColor || "#FDAE61",
            onChange: this.handleCellColorChange
        })));
    }
    render() {
        return R("div", null, this.renderTable(), this.renderDateAxis(), this.renderValueAxis(), this.renderFilter(), this.renderCellColor(), R("hr"), this.renderTitle());
    }
}
exports.default = CalendarChartDesignerComponent;
