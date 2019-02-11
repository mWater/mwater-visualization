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
var _ = require("lodash");
var React = require("react");
var R = React.createElement;
var immer_1 = require("immer");
var mwater_expressions_ui_1 = require("mwater-expressions-ui");
var mwater_expressions_1 = require("mwater-expressions");
var AxisComponent = require("./../axes/AxisComponent");
var TableSelectComponent = require("../TableSelectComponent");
var ColorComponent = require("../ColorComponent");
var rc_slider_1 = __importDefault(require("rc-slider"));
var EditPopupComponent = require('./EditPopupComponent');
var ZoomLevelsComponent = require('./ZoomLevelsComponent');
var ui = require("react-library/lib/bootstrap");
var AdminScopeAndDetailLevelComponent = require('./AdminScopeAndDetailLevelComponent');
var ScopeAndDetailLevelComponent = require('./ScopeAndDetailLevelComponent');
// Designer for a choropleth layer
var ChoroplethLayerDesigner = /** @class */ (function (_super) {
    __extends(ChoroplethLayerDesigner, _super);
    function ChoroplethLayerDesigner() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleScopeAndDetailLevelChange = function (scope, scopeLevel, detailLevel) {
            _this.update(function (d) {
                d.scope = scope;
                d.scopeLevel = scopeLevel;
                d.detailLevel = detailLevel;
            });
        };
        _this.handleTableChange = function (table) {
            // Autoselect region if present
            var adminRegionExpr = null;
            var regionsTable = _this.props.design.regionsTable || "admin_regions";
            if (table) {
                for (var _i = 0, _a = _this.props.schema.getColumns(table); _i < _a.length; _i++) {
                    var column = _a[_i];
                    if ((column.type === "join") && (column.join.type === "n-1") && (column.join.toTable === regionsTable)) {
                        adminRegionExpr = { type: "field", table: table, column: column.id };
                        break;
                    }
                }
            }
            _this.update(function (d) {
                d.table = table;
                d.adminRegionExpr = adminRegionExpr;
            });
        };
        _this.handleColorChange = function (color) {
            _this.update(function (d) { d.color = color; });
        };
        _this.handleFilterChange = function (filter) {
            _this.update(function (d) { d.filter = filter; });
        };
        _this.handleColorAxisChange = function (axis) {
            _this.update(function (d) { d.axes.color = axis; });
        };
        _this.handleRegionsTableChange = function (regionsTable) {
            _this.update(function (d) {
                d.regionsTable = regionsTable;
                d.scope = null;
                d.scopeLevel = null;
                d.detailLevel = 0,
                    d.adminRegionExpr = null;
            });
        };
        _this.handleAdminRegionExprChange = function (expr) {
            _this.update(function (d) { d.adminRegionExpr = expr; });
        };
        _this.handleRegionModeChange = function (regionMode) {
            _this.update(function (d) { d.regionMode = regionMode; });
        };
        _this.handleFillOpacityChange = function (fillOpacity) {
            _this.update(function (d) { d.fillOpacity = fillOpacity; });
        };
        _this.handleDisplayNamesChange = function (displayNames) {
            _this.update(function (d) { d.displayNames = displayNames; });
        };
        return _this;
    }
    ChoroplethLayerDesigner.prototype.update = function (mutation) {
        this.props.onDesignChange(immer_1.produce(this.props.design, mutation));
    };
    ChoroplethLayerDesigner.prototype.renderRegionMode = function () {
        return (React.createElement("div", { className: "form-group" },
            React.createElement("label", { className: "text-muted" }, "Mode"),
            React.createElement("div", { style: { marginLeft: 10 } },
                React.createElement(ui.Radio, { inline: true, radioValue: "plain", value: this.props.design.regionMode, onChange: this.handleRegionModeChange }, "Single Color"),
                React.createElement(ui.Radio, { inline: true, radioValue: "indirect", value: this.props.design.regionMode, onChange: this.handleRegionModeChange }, "Color By Data"),
                React.createElement(ui.Radio, { inline: true, radioValue: "direct", value: this.props.design.regionMode, onChange: this.handleRegionModeChange }, "Advanced"))));
    };
    ChoroplethLayerDesigner.prototype.renderTable = function () {
        // Only for indirect
        if (this.props.design.regionMode !== "indirect") {
            return null;
        }
        return (React.createElement("div", { className: "form-group" },
            React.createElement("label", { className: "text-muted" },
                React.createElement("i", { className: "fa fa-database" }),
                " Data Source"),
            React.createElement(TableSelectComponent, { schema: this.props.schema, value: this.props.design.table, onChange: this.handleTableChange, filter: this.props.design.filter, onFilterChange: this.handleFilterChange })));
    };
    ChoroplethLayerDesigner.prototype.renderRegionsTable = function () {
        var options = _.map(_.filter(this.props.schema.getTables(), function (table) { return table.id.startsWith("regions."); }), function (table) { return ({ value: table.id, label: table.name.en }); });
        return (React.createElement("div", { className: "form-group" },
            React.createElement("label", { className: "text-muted" }, "Regions Type"),
            React.createElement("div", { style: { marginLeft: 8 } },
                React.createElement(ui.Select, { value: this.props.design.regionsTable, onChange: this.handleRegionsTableChange, options: options, nullLabel: "Administrative Regions" }))));
    };
    ChoroplethLayerDesigner.prototype.renderAdminRegionExpr = function () {
        // Only for indirect
        if (this.props.design.regionMode !== "indirect") {
            return null;
        }
        // If no data, hide
        if (!this.props.design.table) {
            return null;
        }
        var regionsTable = this.props.design.regionsTable || "admin_regions";
        return (React.createElement("div", { className: "form-group" },
            React.createElement("label", { className: "text-muted" },
                React.createElement("i", { className: "glyphicon glyphicon-map-marker" }),
                " Location"),
            React.createElement("div", { style: { marginLeft: 8 } },
                React.createElement(mwater_expressions_ui_1.ExprComponent, { schema: this.props.schema, dataSource: this.props.dataSource, onChange: this.handleAdminRegionExprChange, table: this.props.design.table, types: ["id"], idTable: regionsTable, value: this.props.design.adminRegionExpr }))));
    };
    ChoroplethLayerDesigner.prototype.renderScopeAndDetailLevel = function () {
        var regionsTable = this.props.design.regionsTable || "admin_regions";
        if (regionsTable === "admin_regions") {
            return R(AdminScopeAndDetailLevelComponent, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                scope: this.props.design.scope,
                scopeLevel: this.props.design.scopeLevel || 0,
                detailLevel: this.props.design.detailLevel,
                onScopeAndDetailLevelChange: this.handleScopeAndDetailLevelChange
            });
        }
        else {
            return R(ScopeAndDetailLevelComponent, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                scope: this.props.design.scope,
                scopeLevel: this.props.design.scopeLevel,
                detailLevel: this.props.design.detailLevel,
                onScopeAndDetailLevelChange: this.handleScopeAndDetailLevelChange,
                regionsTable: regionsTable
            });
        }
    };
    ChoroplethLayerDesigner.prototype.renderDisplayNames = function () {
        var _this = this;
        return R('div', { className: "form-group" }, R('div', { className: "checkbox" }, R('label', null, R('input', { type: "checkbox", checked: this.props.design.displayNames, onChange: function (ev) { return _this.handleDisplayNamesChange(ev.target.checked); } }), "Display Region Names")));
    };
    ChoroplethLayerDesigner.prototype.renderColor = function () {
        // Only if plain
        if (this.props.design.regionMode !== "plain") {
            return null;
        }
        return R('div', { className: "form-group" }, R('label', { className: "text-muted" }, R('span', { className: "glyphicon glyphicon glyphicon-tint" }), "Fill Color"), R('div', null, R(ColorComponent, {
            color: this.props.design.color,
            onChange: this.handleColorChange
        })));
    };
    ChoroplethLayerDesigner.prototype.renderColorAxis = function () {
        // Not applicable if in plain mode, or if in indirect mode with no table
        if (this.props.design.regionMode === "plain") {
            return;
        }
        else if (this.props.design.regionMode === "indirect") {
            if (!this.props.design.table) {
                return null;
            }
            var filters = _.clone(this.props.filters) || [];
            if (this.props.design.filter) {
                var exprCompiler = new mwater_expressions_1.ExprCompiler(this.props.schema);
                var jsonql = exprCompiler.compileExpr({ expr: this.props.design.filter, tableAlias: "{alias}" });
                var filterTable = this.props.design.filter.table;
                if (jsonql && filterTable) {
                    filters.push({ table: filterTable, jsonql: jsonql });
                }
            }
            var table = this.props.design.table;
            return R('div', null, R('div', { className: "form-group" }, R('label', { className: "text-muted" }, R('span', { className: "glyphicon glyphicon glyphicon-tint" }), "Color By Data"), R(AxisComponent, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: this.props.design.table,
                types: ["text", "enum", "boolean", "date"],
                aggrNeed: "required",
                value: this.props.design.axes.color,
                defaultColor: this.props.design.color,
                showColorMap: true,
                onChange: this.handleColorAxisChange,
                allowExcludedValues: true,
                filters: filters
            })));
        }
        else { // direct mode
            var filters = _.clone(this.props.filters) || [];
            var regionsTable = this.props.design.regionsTable || "admin_regions";
            // Filter to level and scope
            filters.push({ table: regionsTable, jsonql: {
                    type: "op",
                    op: "=",
                    exprs: [
                        { type: "field", tableAlias: "{alias}", column: "level" },
                        this.props.design.detailLevel
                    ]
                } });
            if (this.props.design.scope) {
                filters.push({ table: regionsTable, jsonql: {
                        type: "op",
                        op: "=",
                        exprs: [
                            { type: "field", tableAlias: "{alias}", column: "level" + (this.props.design.scopeLevel || 0) },
                            { type: "literal", value: this.props.design.scope }
                        ]
                    } });
            }
            return R('div', null, R('div', { className: "form-group" }, R('label', { className: "text-muted" }, R('span', { className: "glyphicon glyphicon glyphicon-tint" }), "Color By Data"), R(AxisComponent, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                table: regionsTable,
                types: ["text", "enum", "boolean", "date"],
                aggrNeed: "none",
                value: this.props.design.axes.color,
                defaultColor: this.props.design.color,
                showColorMap: true,
                onChange: this.handleColorAxisChange,
                allowExcludedValues: true,
                filters: filters
            })));
        }
    };
    // renderLabelAxis: ->
    //   if not @props.design.table
    //     return
    //   title = R 'span', null,
    //     R 'span', className: "glyphicon glyphicon glyphicon-tint"
    //     " Color By"
    //   R 'div', className: "form-group",
    //     R 'label', className: "text-muted", title
    //     R 'div', style: { marginLeft: 10 }, 
    //       R(AxisComponent, 
    //         schema: @props.schema
    //         dataSource: @props.dataSource
    //         table: @props.design.table
    //         types: ["text", "enum", "boolean"]
    //         aggrNeed: "none"
    //         value: @props.design.axes.color
    //         showColorMap: true
    //         onChange: @handleColorAxisChange)
    ChoroplethLayerDesigner.prototype.renderFillOpacity = function () {
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
    ChoroplethLayerDesigner.prototype.renderFilter = function () {
        // If not in indirect mode with table, hide
        if (this.props.design.regionMode !== "indirect" || !this.props.design.table) {
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
    ChoroplethLayerDesigner.prototype.renderPopup = function () {
        // If not in indirect mode with table, hide
        if (this.props.design.regionMode !== "indirect" || !this.props.design.table) {
            return null;
        }
        var regionsTable = this.props.design.regionsTable || "admin_regions";
        var defaultPopupFilterJoins = {};
        if (this.props.design.adminRegionExpr) {
            defaultPopupFilterJoins[this.props.design.table] = this.props.design.adminRegionExpr;
        }
        return R(EditPopupComponent, {
            design: this.props.design,
            onDesignChange: this.props.onDesignChange,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.design.table,
            idTable: regionsTable,
            defaultPopupFilterJoins: defaultPopupFilterJoins
        });
    };
    ChoroplethLayerDesigner.prototype.render = function () {
        return R('div', null, this.renderRegionMode(), this.renderRegionsTable(), this.renderTable(), this.renderAdminRegionExpr(), this.renderScopeAndDetailLevel(), this.renderDisplayNames(), this.renderColor(), this.renderColorAxis(), this.renderFillOpacity(), this.renderFilter(), this.renderPopup(), R(ZoomLevelsComponent, { design: this.props.design, onDesignChange: this.props.onDesignChange }));
    };
    return ChoroplethLayerDesigner;
}(React.Component));
exports.default = ChoroplethLayerDesigner;
