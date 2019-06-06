"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var react_1 = __importDefault(require("react"));
var R = react_1.default.createElement;
var immer_1 = require("immer");
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var mwater_expressions_1 = require("mwater-expressions");
var AxisComponent_1 = __importDefault(require("../axes/AxisComponent"));
var TableSelectComponent_1 = __importDefault(require("../TableSelectComponent"));
var rc_slider_1 = __importDefault(require("rc-slider"));
var EditPopupComponent = require('./EditPopupComponent');
var ZoomLevelsComponent = require('./ZoomLevelsComponent');
var bootstrap_1 = __importDefault(require("react-library/lib/bootstrap"));
/** Designer for a grid layer */
var GridLayerDesigner = /** @class */ (function (_super) {
    __extends(GridLayerDesigner, _super);
    function GridLayerDesigner() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleShapeChange = function (shape) {
            _this.update(function (d) { d.shape = shape; });
        };
        _this.handleTableChange = function (table) {
            _this.update(function (d) { d.table = table; });
        };
        _this.handleFilterChange = function (filter) {
            _this.update(function (d) { d.filter = filter; });
        };
        _this.handleColorAxisChange = function (axis) {
            _this.update(function (d) { d.colorAxis = axis; });
        };
        _this.handleGeometryExprChange = function (expr) {
            _this.update(function (d) { d.geometryExpr = expr; });
        };
        _this.handleSizeUnitsChange = function (sizeUnits) {
            if (sizeUnits === "pixels") {
                _this.update(function (d) { d.sizeUnits = sizeUnits; d.size = 20; });
            }
            else {
                _this.update(function (d) { d.sizeUnits = sizeUnits; d.size = 1000; });
            }
        };
        _this.handleSizeChange = function (size) {
            _this.update(function (d) { d.size = size; });
        };
        _this.handleFillOpacityChange = function (fillOpacity) {
            _this.update(function (d) { d.fillOpacity = fillOpacity; });
        };
        _this.handleBorderStyleChange = function (borderStyle) {
            _this.update(function (d) { d.borderStyle = borderStyle; });
        };
        return _this;
    }
    GridLayerDesigner.prototype.update = function (mutation) {
        this.props.onDesignChange(immer_1.produce(this.props.design, mutation));
    };
    GridLayerDesigner.prototype.renderShape = function () {
        return (react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", { className: "text-muted" }, "Grid Type"),
            react_1.default.createElement("div", { style: { marginLeft: 10 } },
                react_1.default.createElement(bootstrap_1.default.Toggle, { allowReset: false, value: this.props.design.shape, onChange: this.handleShapeChange, size: "sm", options: [{ value: "hex", label: "Hexagonal" }, { value: "square", label: "Square" }] }))));
    };
    GridLayerDesigner.prototype.renderSize = function () {
        return (react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", { className: "text-muted" }, "Size"),
            react_1.default.createElement("div", { style: { marginLeft: 10 } },
                react_1.default.createElement("div", { style: { display: "inline-block" } },
                    react_1.default.createElement(bootstrap_1.default.NumberInput, { decimal: true, value: this.props.design.size, onChange: this.handleSizeChange })),
                "\u00A0",
                react_1.default.createElement("div", { style: { display: "inline-block" } },
                    react_1.default.createElement(bootstrap_1.default.Toggle, { allowReset: false, value: this.props.design.sizeUnits, onChange: this.handleSizeUnitsChange, size: "sm", options: [{ value: "pixels", label: "Pixels" }, { value: "meters", label: "Meters (approximate)" }] })))));
    };
    GridLayerDesigner.prototype.renderTable = function () {
        return (react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", { className: "text-muted" },
                react_1.default.createElement("i", { className: "fa fa-database" }),
                " Data Source"),
            react_1.default.createElement(TableSelectComponent_1.default, { schema: this.props.schema, value: this.props.design.table, onChange: this.handleTableChange, filter: this.props.design.filter, onFilterChange: this.handleFilterChange })));
    };
    GridLayerDesigner.prototype.renderGeometryExpr = function () {
        // If no data, hide
        if (!this.props.design.table) {
            return null;
        }
        return (react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", { className: "text-muted" },
                react_1.default.createElement("i", { className: "glyphicon glyphicon-map-marker" }),
                " Location"),
            react_1.default.createElement("div", { style: { marginLeft: 8 } },
                react_1.default.createElement(mwater_expressions_ui_1.ExprComponent, { schema: this.props.schema, dataSource: this.props.dataSource, onChange: this.handleGeometryExprChange, table: this.props.design.table, types: ["geometry"], value: this.props.design.geometryExpr }))));
    };
    GridLayerDesigner.prototype.renderColorAxis = function () {
        if (!this.props.design.table) {
            return null;
        }
        var filters = lodash_1.default.clone(this.props.filters) || [];
        if (this.props.design.filter) {
            var exprCompiler = new mwater_expressions_1.ExprCompiler(this.props.schema);
            var jsonql = exprCompiler.compileExpr({ expr: this.props.design.filter, tableAlias: "{alias}" });
            var filterTable = this.props.design.filter.table;
            if (jsonql && filterTable) {
                filters.push({ table: filterTable, jsonql: jsonql });
            }
        }
        var table = this.props.design.table;
        return R('div', null, R('div', { className: "form-group" }, R('label', { className: "text-muted" }, R('span', { className: "glyphicon glyphicon glyphicon-tint" }), "Color By Data"), R(AxisComponent_1.default, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.design.table,
            types: ["text", "enum", "boolean", "date"],
            aggrNeed: "required",
            value: this.props.design.colorAxis,
            showColorMap: true,
            onChange: this.handleColorAxisChange,
            allowExcludedValues: true,
            filters: filters
        })));
    };
    GridLayerDesigner.prototype.renderFillOpacity = function () {
        var _this = this;
        return R('div', { className: "form-group" }, R('label', { className: "text-muted" }, "Fill Opacity (%)"), ": ", R(rc_slider_1.default, {
            min: 0,
            max: 100,
            step: 1,
            tipTransitionName: "rc-slider-tooltip-zoom-down",
            value: this.props.design.fillOpacity * 100,
            onChange: function (val) { return _this.handleFillOpacityChange(val / 100); }
        }));
    };
    GridLayerDesigner.prototype.renderBorderStyle = function () {
        return (react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", { className: "text-muted" }, "Border Style"),
            react_1.default.createElement("div", { style: { marginLeft: 10 } },
                react_1.default.createElement(bootstrap_1.default.Toggle, { allowReset: false, value: this.props.design.borderStyle, onChange: this.handleBorderStyleChange, size: "sm", options: [{ value: "none", label: "None" }, { value: "color", label: "Line" }] }))));
    };
    GridLayerDesigner.prototype.renderFilter = function () {
        // If not with table, hide
        if (!this.props.design.table) {
            return null;
        }
        return R('div', { className: "form-group" }, R('label', { className: "text-muted" }, R('span', { className: "glyphicon glyphicon-filter" }), " Filters"), R('div', { style: { marginLeft: 8 } }, R(mwater_expressions_ui_1.FilterExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: this.handleFilterChange,
            table: this.props.design.table,
            value: this.props.design.filter
        })));
    };
    // renderPopup() {
    //   // If not in indirect mode with table, hide
    //   if (this.props.design.regionMode !== "indirect" || !this.props.design.table) {
    //     return null
    //   }
    //   const regionsTable = this.props.design.regionsTable || "admin_regions";
    //   const defaultPopupFilterJoins = {};
    //   if (this.props.design.adminRegionExpr) {
    //     defaultPopupFilterJoins[this.props.design.table] = this.props.design.adminRegionExpr;
    //   }
    //   return R(EditPopupComponent, { 
    //     design: this.props.design,
    //     onDesignChange: this.props.onDesignChange,
    //     schema: this.props.schema,
    //     dataSource: this.props.dataSource,
    //     table: this.props.design.table,
    //     idTable: regionsTable,
    //     defaultPopupFilterJoins
    //   })
    // }
    GridLayerDesigner.prototype.render = function () {
        return R('div', null, this.renderShape(), this.renderSize(), this.renderTable(), this.renderGeometryExpr(), this.renderColorAxis(), this.renderFillOpacity(), this.renderBorderStyle(), this.renderFilter(), 
        // this.renderPopup(),
        R(ZoomLevelsComponent, { design: this.props.design, onDesignChange: this.props.onDesignChange }));
    };
    return GridLayerDesigner;
}(react_1.default.Component));
exports.default = GridLayerDesigner;
