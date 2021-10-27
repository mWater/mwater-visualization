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
const immer_1 = require("immer");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const mwater_expressions_1 = require("mwater-expressions");
const AxisComponent_1 = __importDefault(require("./../axes/AxisComponent"));
const TableSelectComponent_1 = __importDefault(require("../TableSelectComponent"));
const ColorComponent_1 = __importDefault(require("../ColorComponent"));
const rc_slider_1 = __importDefault(require("rc-slider"));
const EditPopupComponent_1 = __importDefault(require("./EditPopupComponent"));
const ZoomLevelsComponent_1 = __importDefault(require("./ZoomLevelsComponent"));
const ui = __importStar(require("react-library/lib/bootstrap"));
const AdminScopeAndDetailLevelComponent_1 = __importDefault(require("./AdminScopeAndDetailLevelComponent"));
const ScopeAndDetailLevelComponent_1 = __importDefault(require("./ScopeAndDetailLevelComponent"));
// Designer for a choropleth layer
class ChoroplethLayerDesigner extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleScopeAndDetailLevelChange = (scope, scopeLevel, detailLevel) => {
            this.update((d) => {
                d.scope = scope;
                d.scopeLevel = scopeLevel;
                d.detailLevel = detailLevel;
            });
        };
        this.autoselectAdminRegionExpr = (table, regionsTable) => {
            // Autoselect region if present
            let adminRegionExpr = null;
            for (let column of this.props.schema.getColumns(table)) {
                if (column.type === "join" && column.join.type === "n-1" && column.join.toTable === regionsTable) {
                    return { type: "field", table, column: column.id };
                }
                if (column.type === "id" && column.idTable === regionsTable) {
                    return { type: "field", table, column: column.id };
                }
            }
            return null;
        };
        this.handleTableChange = (table) => {
            // Autoselect region if present
            let adminRegionExpr = null;
            const regionsTable = this.props.design.regionsTable || "admin_regions";
            if (table) {
                adminRegionExpr = this.autoselectAdminRegionExpr(table, regionsTable);
            }
            this.update((d) => {
                d.table = table;
                d.adminRegionExpr = adminRegionExpr;
            });
        };
        this.handleColorChange = (color) => {
            this.update((d) => {
                d.color = color;
            });
        };
        this.handleBorderColorChange = (color) => {
            this.update((d) => {
                d.borderColor = color;
            });
        };
        this.handleFilterChange = (filter) => {
            this.update((d) => {
                d.filter = filter;
            });
        };
        this.handleColorAxisChange = (axis) => {
            this.update((d) => {
                d.axes.color = axis;
            });
        };
        this.handleRegionsTableChange = (regionsTable) => {
            this.update((d) => {
                d.regionsTable = regionsTable == "admin_regions" ? null : regionsTable;
                d.scope = null;
                d.scopeLevel = null;
                (d.detailLevel = 0),
                    (d.adminRegionExpr = this.props.design.table
                        ? this.autoselectAdminRegionExpr(this.props.design.table, regionsTable)
                        : null);
            });
        };
        this.handleAdminRegionExprChange = (expr) => {
            this.update((d) => {
                d.adminRegionExpr = expr;
            });
        };
        this.handleRegionModeChange = (regionMode) => {
            this.update((d) => {
                d.regionMode = regionMode;
            });
        };
        this.handleFillOpacityChange = (fillOpacity) => {
            this.update((d) => {
                d.fillOpacity = fillOpacity;
            });
        };
        this.handleDisplayNamesChange = (displayNames) => {
            this.update((d) => {
                d.displayNames = displayNames;
            });
        };
    }
    update(mutation) {
        this.props.onDesignChange(immer_1.produce(this.props.design, mutation));
    }
    renderRegionMode() {
        return (react_1.default.createElement("div", { className: "mb-3" },
            react_1.default.createElement("label", { className: "text-muted" }, "Mode"),
            react_1.default.createElement("div", { style: { marginLeft: 10 } },
                react_1.default.createElement(ui.Radio, { inline: true, radioValue: "plain", value: this.props.design.regionMode, onChange: this.handleRegionModeChange }, "Single Color"),
                react_1.default.createElement(ui.Radio, { inline: true, radioValue: "indirect", value: this.props.design.regionMode, onChange: this.handleRegionModeChange }, "Color By Data"),
                react_1.default.createElement(ui.Radio, { inline: true, radioValue: "direct", value: this.props.design.regionMode, onChange: this.handleRegionModeChange }, "Advanced"))));
    }
    renderTable() {
        // Only for indirect
        if (this.props.design.regionMode !== "indirect") {
            return null;
        }
        return (react_1.default.createElement("div", { className: "mb-3" },
            react_1.default.createElement("label", { className: "text-muted" },
                react_1.default.createElement("i", { className: "fa fa-database" }),
                " Data Source"),
            react_1.default.createElement(TableSelectComponent_1.default, { schema: this.props.schema, value: this.props.design.table, onChange: this.handleTableChange, filter: this.props.design.filter, onFilterChange: this.handleFilterChange })));
    }
    renderRegionsTable() {
        let options = lodash_1.default.map(lodash_1.default.filter(this.props.schema.getTables(), (table) => table.id.startsWith("regions.")), (table) => ({ value: table.id, label: table.name.en }));
        const regionsTable = this.props.design.regionsTable || "admin_regions";
        return (react_1.default.createElement("div", { className: "mb-3" },
            react_1.default.createElement("label", { className: "text-muted" }, "Regions Type"),
            react_1.default.createElement("div", { style: { marginLeft: 8 } },
                react_1.default.createElement("select", { value: regionsTable, onChange: (ev) => this.handleRegionsTableChange(ev.target.value), className: "form-select" },
                    react_1.default.createElement("option", { value: "admin_regions" }, "Administrative Regions (from mWater global database)"),
                    react_1.default.createElement("option", { disabled: true }, "\u2500\u2500 Custom regions (special regions uploaded for specific purposes) \u2500\u2500"),
                    options.map((opt) => (react_1.default.createElement("option", { value: opt.value }, opt.label)))))));
    }
    renderAdminRegionExpr() {
        // Only for indirect
        if (this.props.design.regionMode !== "indirect") {
            return null;
        }
        // If no data, hide
        if (!this.props.design.table) {
            return null;
        }
        const regionsTable = this.props.design.regionsTable || "admin_regions";
        return (react_1.default.createElement("div", { className: "mb-3" },
            react_1.default.createElement("label", { className: "text-muted" },
                react_1.default.createElement("i", { className: "fas fa-map-marker-alt" }),
                " Location"),
            react_1.default.createElement("div", { style: { marginLeft: 8 } },
                react_1.default.createElement(mwater_expressions_ui_1.ExprComponent, { schema: this.props.schema, dataSource: this.props.dataSource, onChange: this.handleAdminRegionExprChange, table: this.props.design.table, types: ["id"], idTable: regionsTable, value: this.props.design.adminRegionExpr || null }))));
    }
    renderScopeAndDetailLevel() {
        const regionsTable = this.props.design.regionsTable || "admin_regions";
        if (regionsTable === "admin_regions") {
            return R(AdminScopeAndDetailLevelComponent_1.default, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                scope: this.props.design.scope,
                scopeLevel: this.props.design.scopeLevel || 0,
                detailLevel: this.props.design.detailLevel,
                onScopeAndDetailLevelChange: this.handleScopeAndDetailLevelChange
            });
        }
        else {
            return R(ScopeAndDetailLevelComponent_1.default, {
                schema: this.props.schema,
                dataSource: this.props.dataSource,
                scope: this.props.design.scope,
                scopeLevel: this.props.design.scopeLevel,
                detailLevel: this.props.design.detailLevel,
                onScopeAndDetailLevelChange: this.handleScopeAndDetailLevelChange,
                regionsTable
            });
        }
    }
    renderDisplayNames() {
        return R("div", { className: "mb-3" }, react_1.default.createElement(ui.Checkbox, { value: this.props.design.displayNames, onChange: (value) => this.handleDisplayNamesChange(value) }, "Display Region Names"));
    }
    renderColor() {
        // Only if plain
        if (this.props.design.regionMode !== "plain") {
            return null;
        }
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, R("span", { className: "fas fa-tint" }), "Fill Color"), R("div", null, R(ColorComponent_1.default, {
            color: this.props.design.color,
            onChange: this.handleColorChange
        })));
    }
    renderColorAxis() {
        // Not applicable if in plain mode, or if in indirect mode with no table
        if (this.props.design.regionMode === "plain") {
            return;
        }
        else if (this.props.design.regionMode === "indirect") {
            if (!this.props.design.table) {
                return null;
            }
            const filters = lodash_1.default.clone(this.props.filters) || [];
            if (this.props.design.filter) {
                const exprCompiler = new mwater_expressions_1.ExprCompiler(this.props.schema);
                const jsonql = exprCompiler.compileExpr({ expr: this.props.design.filter, tableAlias: "{alias}" });
                let filterTable = this.props.design.filter.table;
                if (jsonql && filterTable) {
                    filters.push({ table: filterTable, jsonql });
                }
            }
            const table = this.props.design.table;
            return R("div", null, R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, R("span", { className: "fas fa-tint" }), "Color By Data"), R(AxisComponent_1.default, {
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
        else {
            // direct mode
            const filters = lodash_1.default.clone(this.props.filters) || [];
            const regionsTable = this.props.design.regionsTable || "admin_regions";
            // Filter to level and scope
            filters.push({
                table: regionsTable,
                jsonql: {
                    type: "op",
                    op: "=",
                    exprs: [{ type: "field", tableAlias: "{alias}", column: "level" }, this.props.design.detailLevel]
                }
            });
            if (this.props.design.scope) {
                filters.push({
                    table: regionsTable,
                    jsonql: {
                        type: "op",
                        op: "=",
                        exprs: [
                            { type: "field", tableAlias: "{alias}", column: `level${this.props.design.scopeLevel || 0}` },
                            { type: "literal", value: this.props.design.scope }
                        ]
                    }
                });
            }
            return R("div", null, R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, R("span", { className: "fas fa-tint" }), "Color By Data"), R(AxisComponent_1.default, {
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
    }
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
    renderFillOpacity() {
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, `Fill Opacity: ${(this.props.design.fillOpacity * this.props.design.fillOpacity * 100).toFixed(0)}%`), ": ", R(rc_slider_1.default, {
            min: 0,
            max: 100,
            step: 1,
            tipTransitionName: "rc-slider-tooltip-zoom-down",
            value: Math.round(this.props.design.fillOpacity * this.props.design.fillOpacity * 100),
            onChange: (val) => this.handleFillOpacityChange(Math.sqrt(val / 100))
        }));
    }
    renderBorderColor() {
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, R("span", { className: "fas fa-tint" }), "Border Color"), R("div", null, R(ColorComponent_1.default, {
            color: this.props.design.borderColor || "#000",
            onChange: this.handleBorderColorChange
        })));
    }
    renderFilter() {
        // If not in indirect mode with table, hide
        if (this.props.design.regionMode !== "indirect" || !this.props.design.table) {
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
        // If not in indirect mode with table, hide
        if (this.props.design.regionMode !== "indirect" || !this.props.design.table) {
            return null;
        }
        const regionsTable = this.props.design.regionsTable || "admin_regions";
        const defaultPopupFilterJoins = {};
        if (this.props.design.adminRegionExpr) {
            defaultPopupFilterJoins[this.props.design.table] = this.props.design.adminRegionExpr;
        }
        return R(EditPopupComponent_1.default, {
            design: this.props.design,
            onDesignChange: this.props.onDesignChange,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            table: this.props.design.table,
            idTable: regionsTable,
            defaultPopupFilterJoins
        });
    }
    render() {
        return R("div", null, this.renderRegionMode(), this.renderRegionsTable(), this.renderTable(), this.renderAdminRegionExpr(), this.renderScopeAndDetailLevel(), this.renderDisplayNames(), this.renderColor(), this.renderColorAxis(), this.renderFillOpacity(), this.renderBorderColor(), this.renderFilter(), this.renderPopup(), R(ZoomLevelsComponent_1.default, { design: this.props.design, onDesignChange: this.props.onDesignChange }));
    }
}
exports.default = ChoroplethLayerDesigner;
