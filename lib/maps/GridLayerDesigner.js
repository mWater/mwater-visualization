"use strict";
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
const AxisComponent_1 = __importDefault(require("../axes/AxisComponent"));
const TableSelectComponent_1 = __importDefault(require("../TableSelectComponent"));
const rc_slider_1 = __importDefault(require("rc-slider"));
const ZoomLevelsComponent_1 = __importDefault(require("./ZoomLevelsComponent"));
const bootstrap_1 = __importDefault(require("react-library/lib/bootstrap"));
const PopoverHelpComponent_1 = __importDefault(require("react-library/lib/PopoverHelpComponent"));
/** Designer for a grid layer */
class GridLayerDesigner extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleShapeChange = (shape) => {
            this.update((d) => {
                d.shape = shape;
            });
        };
        this.handleTableChange = (table) => {
            this.update((d) => {
                d.table = table;
            });
        };
        this.handleFilterChange = (filter) => {
            this.update((d) => {
                d.filter = filter;
            });
        };
        this.handleColorAxisChange = (axis) => {
            this.update((d) => {
                d.colorAxis = axis;
            });
        };
        this.handleGeometryExprChange = (expr) => {
            this.update((d) => {
                d.geometryExpr = expr;
            });
        };
        this.handleSizeUnitsChange = (sizeUnits) => {
            if (sizeUnits === "pixels") {
                this.update((d) => {
                    d.sizeUnits = sizeUnits;
                    d.size = 30;
                });
            }
            else {
                this.update((d) => {
                    d.sizeUnits = sizeUnits;
                    d.size = 1000;
                });
            }
        };
        this.handleSizeChange = (size) => {
            this.update((d) => {
                d.size = size;
            });
        };
        this.handleFillOpacityChange = (fillOpacity) => {
            this.update((d) => {
                d.fillOpacity = fillOpacity;
            });
        };
        this.handleBorderStyleChange = (borderStyle) => {
            this.update((d) => {
                d.borderStyle = borderStyle;
            });
        };
    }
    update(mutation) {
        this.props.onDesignChange(immer_1.produce(this.props.design, mutation));
    }
    renderShape() {
        return (react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", { className: "text-muted" }, "Grid Type"),
            react_1.default.createElement("div", { style: { marginLeft: 10 } },
                react_1.default.createElement(bootstrap_1.default.Toggle, { allowReset: false, value: this.props.design.shape, onChange: this.handleShapeChange, size: "sm", options: [
                        { value: "hex", label: "Hexagonal" },
                        { value: "square", label: "Square" }
                    ] }))));
    }
    renderSize() {
        return (react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", { className: "text-muted" }, "Size"),
            react_1.default.createElement("div", { style: { marginLeft: 10 } },
                react_1.default.createElement("div", { style: { display: "inline-block" } },
                    react_1.default.createElement(bootstrap_1.default.NumberInput, { decimal: true, value: this.props.design.size, onChange: this.handleSizeChange })),
                "\u00A0",
                react_1.default.createElement("div", { style: { display: "inline-block" } },
                    react_1.default.createElement(bootstrap_1.default.Toggle, { allowReset: false, value: this.props.design.sizeUnits, onChange: this.handleSizeUnitsChange, size: "sm", options: [
                            { value: "pixels", label: "Pixels" },
                            { value: "meters", label: "Meters (approximate)" }
                        ] })),
                "\u00A0",
                react_1.default.createElement(PopoverHelpComponent_1.default, { placement: "bottom" }, "Pixel grids always appear to be the same size when zoomed. Meters are for a fixed-size grid and have limits on how far the user can zoom out."))));
    }
    renderTable() {
        return (react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", { className: "text-muted" },
                react_1.default.createElement("i", { className: "fa fa-database" }),
                " Data Source"),
            react_1.default.createElement(TableSelectComponent_1.default, { schema: this.props.schema, value: this.props.design.table, onChange: this.handleTableChange, filter: this.props.design.filter, onFilterChange: this.handleFilterChange })));
    }
    renderGeometryExpr() {
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
    }
    renderColorAxis() {
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
        return R("div", null, R("div", { className: "form-group" }, R("label", { className: "text-muted" }, R("span", { className: "glyphicon glyphicon glyphicon-tint" }), "Color By Data"), R(AxisComponent_1.default, {
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
    }
    renderFillOpacity() {
        return R("div", { className: "form-group" }, R("label", { className: "text-muted" }, "Fill Opacity (%)"), ": ", R(rc_slider_1.default, {
            min: 0,
            max: 100,
            step: 1,
            tipTransitionName: "rc-slider-tooltip-zoom-down",
            value: this.props.design.fillOpacity * 100,
            onChange: (val) => this.handleFillOpacityChange(val / 100)
        }));
    }
    renderBorderStyle() {
        return (react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", { className: "text-muted" }, "Border Style"),
            react_1.default.createElement("div", { style: { marginLeft: 10 } },
                react_1.default.createElement(bootstrap_1.default.Toggle, { allowReset: false, value: this.props.design.borderStyle, onChange: this.handleBorderStyleChange, size: "sm", options: [
                        { value: "none", label: "None" },
                        { value: "color", label: "Line" }
                    ] }))));
    }
    renderFilter() {
        // If not with table, hide
        if (!this.props.design.table) {
            return null;
        }
        return R("div", { className: "form-group" }, R("label", { className: "text-muted" }, R("span", { className: "glyphicon glyphicon-filter" }), " Filters"), R("div", { style: { marginLeft: 8 } }, R(mwater_expressions_ui_1.FilterExprComponent, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            onChange: this.handleFilterChange,
            table: this.props.design.table,
            value: this.props.design.filter
        })));
    }
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
    render() {
        return R("div", null, this.renderShape(), this.renderSize(), this.renderTable(), this.renderGeometryExpr(), this.renderColorAxis(), this.renderFillOpacity(), this.renderBorderStyle(), this.renderFilter(), 
        // this.renderPopup(),
        R(ZoomLevelsComponent_1.default, { design: this.props.design, onDesignChange: this.props.onDesignChange }));
    }
}
exports.default = GridLayerDesigner;
