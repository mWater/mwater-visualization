"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
const AxisComponent_1 = __importDefault(require("./../axes/AxisComponent"));
const ColorComponent_1 = __importDefault(require("../ColorComponent"));
const TableSelectComponent_1 = __importDefault(require("../TableSelectComponent"));
const EditPopupComponent_1 = __importDefault(require("./EditPopupComponent"));
const ZoomLevelsComponent_1 = __importDefault(require("./ZoomLevelsComponent"));
const MarkerSymbolSelectComponent_1 = __importDefault(require("./MarkerSymbolSelectComponent"));
const PopupFilterJoinsUtils = __importStar(require("./PopupFilterJoinsUtils"));
const ui = __importStar(require("react-library/lib/bootstrap"));
// Designer for a markers layer
class MarkersLayerDesignerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleTableChange = (table) => {
            return this.update({ table });
        };
        this.handleGeometryAxisChange = (axis) => {
            return this.updateAxes({ geometry: axis });
        };
        this.handleColorAxisChange = (axis) => {
            return this.updateAxes({ color: axis });
        };
        this.handleFilterChange = (expr) => {
            return this.update({ filter: expr });
        };
        this.handleColorChange = (color) => {
            return this.update({ color });
        };
        this.handleSymbolChange = (symbol) => {
            return this.update({ symbol });
        };
        this.handleNameChange = (e) => {
            return this.update({ name: e.target.value });
        };
        this.handleMarkerSizeChange = (markerSize) => {
            return this.update({ markerSize });
        };
        this.handleLineWidthChange = (lineWidth) => {
            return this.update({ lineWidth });
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
        const title = R("span", null, R("span", { className: "fas fa-map-marker-alt" }), " Location");
        const filters = lodash_1.default.clone(this.props.filters) || [];
        if (this.props.design.filter != null) {
            const exprCompiler = new mwater_expressions_1.ExprCompiler(this.props.schema);
            const jsonql = exprCompiler.compileExpr({ expr: this.props.design.filter, tableAlias: "{alias}" });
            if (jsonql) {
                filters.push({ table: this.props.design.filter.table, jsonql });
            }
        }
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, title), R("div", { style: { marginLeft: 10 } }, R(AxisComponent_1.default, {
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
    renderColor() {
        if (!this.props.design.axes.geometry) {
            return;
        }
        const filters = lodash_1.default.clone(this.props.filters) || [];
        if (this.props.design.filter != null) {
            const exprCompiler = new mwater_expressions_1.ExprCompiler(this.props.schema);
            const jsonql = exprCompiler.compileExpr({ expr: this.props.design.filter, tableAlias: "{alias}" });
            if (jsonql) {
                filters.push({ table: this.props.design.filter.table, jsonql });
            }
        }
        return R("div", null, !this.props.design.axes.color
            ? R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, R("span", { className: "fas fa-tint" }), "Color"), R("div", null, R(ColorComponent_1.default, {
                color: this.props.design.color,
                onChange: this.handleColorChange
            })))
            : undefined, R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, R("span", { className: "fas fa-tint" }), "Color By Data"), R(AxisComponent_1.default, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.design.table,
            types: ["text", "enum", "boolean", "date"],
            aggrNeed: "none",
            value: this.props.design.axes.color,
            defaultColor: this.props.design.color,
            showColorMap: true,
            onChange: this.handleColorAxisChange,
            allowExcludedValues: true,
            filters
        })));
    }
    renderSymbol() {
        if (!this.props.design.axes.geometry) {
            return;
        }
        return R(MarkerSymbolSelectComponent_1.default, { symbol: this.props.design.symbol, onChange: this.handleSymbolChange });
    }
    renderMarkerSize() {
        if (!this.props.design.axes.geometry) {
            return;
        }
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, "Marker Size"), R(ui.Select, {
            value: this.props.design.markerSize || 10,
            options: [
                { value: 5, label: "Extra small" },
                { value: 8, label: "Small" },
                { value: 10, label: "Normal" },
                { value: 13, label: "Large" },
                { value: 16, label: "Extra large" }
            ],
            onChange: this.handleMarkerSizeChange
        }));
    }
    renderLineWidth() {
        if (!this.props.design.axes.geometry) {
            return;
        }
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, "Line Width (for shapes)"), R(ui.Select, {
            value: this.props.design.lineWidth != null ? this.props.design.lineWidth : 3,
            options: [
                { value: 0, label: "None" },
                { value: 1, label: "1 pixel" },
                { value: 2, label: "2 pixels" },
                { value: 3, label: "3 pixels" },
                { value: 4, label: "4 pixels" },
                { value: 5, label: "5 pixels" },
                { value: 6, label: "6 pixels" }
            ],
            onChange: this.handleLineWidthChange
        }));
    }
    renderFilter() {
        // If no data, hide
        if (!this.props.design.axes.geometry) {
            return null;
        }
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, R("span", { className: "fas fa-filter" }), " Filters"), R("div", { style: { marginLeft: 8 } }, R(mwater_expressions_ui_1.FilterExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: this.handleFilterChange,
            table: this.props.design.table,
            value: this.props.design.filter
        })));
    }
    renderPopup() {
        if (!this.props.design.table) {
            return null;
        }
        return R(EditPopupComponent_1.default, {
            design: this.props.design,
            onDesignChange: this.props.onDesignChange,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.design.table,
            idTable: this.props.design.table,
            defaultPopupFilterJoins: PopupFilterJoinsUtils.createDefaultPopupFilterJoins(this.props.design.table)
        });
    }
    render() {
        return R("div", null, this.renderTable(), this.renderGeometryAxis(), this.renderColor(), this.renderSymbol(), this.renderMarkerSize(), this.renderLineWidth(), this.renderFilter(), this.renderPopup(), this.props.design.table
            ? R(ZoomLevelsComponent_1.default, { design: this.props.design, onDesignChange: this.props.onDesignChange })
            : undefined);
    }
}
exports.default = MarkersLayerDesignerComponent;
