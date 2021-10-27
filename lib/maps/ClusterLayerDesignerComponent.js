"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const mwater_expressions_1 = require("mwater-expressions");
const AxisComponent_1 = __importDefault(require("./../axes/AxisComponent"));
const ColorComponent_1 = __importDefault(require("../ColorComponent"));
const TableSelectComponent_1 = __importDefault(require("../TableSelectComponent"));
const ZoomLevelsComponent_1 = __importDefault(require("./ZoomLevelsComponent"));
class ClusterLayerDesignerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleTableChange = (table) => {
            return this.update({ table });
        };
        this.handleGeometryAxisChange = (axis) => {
            return this.updateAxes({ geometry: axis });
        };
        this.handleFilterChange = (expr) => {
            return this.update({ filter: expr });
        };
        this.handleTextColorChange = (color) => {
            return this.update({ textColor: color });
        };
        this.handleFillColorChange = (color) => {
            return this.update({ fillColor: color });
        };
    }
    // Apply updates to design
    update(updates) {
        return this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, updates));
    }
    // Update axes with specified changes
    updateAxes(changes) {
        const axes = lodash_1.default.extend({}, this.props.design.axes, changes);
        return this.update({ axes });
    }
    renderTable() {
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, R("i", { className: "fa fa-database" }), " ", "Data Source"), R("div", { style: { marginLeft: 10 } }, R(TableSelectComponent_1.default, {
            schema: this.props.schema,
            value: this.props.design.table,
            onChange: this.handleTableChange,
            filter: this.props.design.filter,
            onFilterChange: this.handleFilterChange
        })));
    }
    renderGeometryAxis() {
        if (!this.props.design.table) {
            return;
        }
        const title = R("span", null, R("span", { className: "fas fa-map-marker-alt" }), " Locations to Cluster");
        const filters = lodash_1.default.clone(this.props.filters) || [];
        if (this.props.design.filter != null) {
            const exprCompiler = new mwater_expressions_1.ExprCompiler(this.props.schema);
            const jsonql = exprCompiler.compileExpr({ expr: this.props.design.filter, tableAlias: "{alias}" });
            if (jsonql) {
                filters.push({ table: this.props.design.filter.table, jsonql });
            }
        }
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, title), R("div", { style: { marginLeft: 10 } }, react_1.default.createElement(AxisComponent_1.default, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.design.table,
            types: ["geometry"],
            aggrNeed: "none",
            value: this.props.design.axes.geometry,
            onChange: this.handleGeometryAxisChange,
            filters
        })));
    }
    renderTextColor() {
        if (!this.props.design.axes.geometry) {
            return;
        }
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, R("span", { className: "fas fa-tint" }), "Text Color"), R("div", null, R(ColorComponent_1.default, {
            color: this.props.design.textColor,
            onChange: this.handleTextColorChange
        })));
    }
    renderFillColor() {
        if (!this.props.design.axes.geometry) {
            return;
        }
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, R("span", { className: "fas fa-tint" }), "Marker Color"), R("div", null, R(ColorComponent_1.default, {
            color: this.props.design.fillColor,
            onChange: this.handleFillColorChange
        })));
    }
    renderFilter() {
        // If no data, hide
        if (!this.props.design.axes.geometry) {
            return null;
        }
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, R("span", { className: "fas fa-filter" }), " Filters"), R("div", { style: { marginLeft: 8 } }, react_1.default.createElement(mwater_expressions_ui_1.FilterExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: this.handleFilterChange,
            table: this.props.design.table,
            value: this.props.design.filter
        })));
    }
    render() {
        return R("div", null, this.renderTable(), this.renderGeometryAxis(), this.renderTextColor(), this.renderFillColor(), this.renderFilter(), this.props.design.table
            ? R(ZoomLevelsComponent_1.default, { design: this.props.design, onDesignChange: this.props.onDesignChange })
            : undefined);
    }
}
exports.default = ClusterLayerDesignerComponent;
