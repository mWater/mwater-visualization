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
const NumberInputComponent_1 = __importDefault(require("react-library/lib/NumberInputComponent"));
const AxisComponent_1 = __importDefault(require("./../axes/AxisComponent"));
const ColorComponent_1 = __importDefault(require("../ColorComponent"));
const TableSelectComponent_1 = __importDefault(require("../TableSelectComponent"));
const rc_slider_1 = __importDefault(require("rc-slider"));
const EditPopupComponent_1 = __importDefault(require("./EditPopupComponent"));
const ZoomLevelsComponent_1 = __importDefault(require("./ZoomLevelsComponent"));
const PopupFilterJoinsUtils = __importStar(require("./PopupFilterJoinsUtils"));
class BufferLayerDesignerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleTableChange = (table) => {
            return this.update({ table });
        };
        this.handleRadiusChange = (radius) => {
            return this.update({ radius });
        };
        this.handleGeometryAxisChange = (axis) => {
            return this.updateAxes({ geometry: axis });
        };
        this.handleFilterChange = (expr) => {
            return this.update({ filter: expr });
        };
        this.handleColorChange = (color) => {
            return this.update({ color });
        };
        this.handleColorAxisChange = (axis) => {
            return this.updateAxes({ color: axis });
        };
        this.handleFillOpacityChange = (fillOpacity) => {
            return this.update({ fillOpacity: fillOpacity / 100 });
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
        return R("div", { className: "form-group" }, R("label", { className: "text-muted" }, R("i", { className: "fa fa-database" }), " ", "Data Source"), R("div", { style: { marginLeft: 10 } }, R(TableSelectComponent_1.default, {
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
        const title = R("span", null, R("span", { className: "glyphicon glyphicon-map-marker" }), " Circle Centers");
        const filters = lodash_1.default.clone(this.props.filters) || [];
        if (this.props.design.filter != null) {
            const exprCompiler = new mwater_expressions_1.ExprCompiler(this.props.schema);
            const jsonql = exprCompiler.compileExpr({ expr: this.props.design.filter, tableAlias: "{alias}" });
            if (jsonql) {
                filters.push({ table: this.props.design.filter.table, jsonql });
            }
        }
        return R("div", { className: "form-group" }, R("label", { className: "text-muted" }, title), R("div", { style: { marginLeft: 10 } }, react_1.default.createElement(AxisComponent_1.default, {
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
    renderRadius() {
        return R("div", { className: "form-group" }, R("label", { className: "text-muted" }, "Radius (meters)"), ": ", react_1.default.createElement(NumberInputComponent_1.default, {
            value: this.props.design.radius,
            onChange: this.handleRadiusChange
        }));
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
            ? R("div", { className: "form-group" }, R("label", { className: "text-muted" }, R("span", { className: "glyphicon glyphicon glyphicon-tint" }), "Circle Color"), R("div", null, R(ColorComponent_1.default, {
                color: this.props.design.color,
                onChange: this.handleColorChange
            })))
            : undefined, R("div", { className: "form-group" }, R("label", { className: "text-muted" }, R("span", { className: "glyphicon glyphicon glyphicon-tint" }), "Color By Data"), R(AxisComponent_1.default, {
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
    renderFillOpacity() {
        return R("div", { className: "form-group" }, R("label", { className: "text-muted" }, "Circle Opacity (%)"), ": ", react_1.default.createElement(rc_slider_1.default, {
            min: 0,
            max: 100,
            step: 1,
            tipTransitionName: "rc-slider-tooltip-zoom-down",
            value: this.props.design.fillOpacity * 100,
            onChange: this.handleFillOpacityChange
        }));
    }
    renderFilter() {
        // If no data, hide
        if (!this.props.design.axes.geometry) {
            return null;
        }
        return R("div", { className: "form-group" }, R("label", { className: "text-muted" }, R("span", { className: "glyphicon glyphicon-filter" }), " Filters"), R("div", { style: { marginLeft: 8 } }, react_1.default.createElement(mwater_expressions_ui_1.FilterExprComponent, {
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
        return R("div", null, this.renderTable(), this.renderGeometryAxis(), this.renderRadius(), this.renderColor(), this.renderFillOpacity(), this.renderFilter(), this.renderPopup(), this.props.design.table
            ? R(ZoomLevelsComponent_1.default, { design: this.props.design, onDesignChange: this.props.onDesignChange })
            : undefined);
    }
}
exports.default = BufferLayerDesignerComponent;
