"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompiledFilters = exports.getFilterableTables = void 0;
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_1 = require("mwater-expressions");
const LayoutManager_1 = __importDefault(require("../layouts/LayoutManager"));
const WidgetFactory_1 = __importDefault(require("../widgets/WidgetFactory"));
/** Gets filterable tables for a dashboard */
function getFilterableTables(design, schema) {
    const layoutManager = LayoutManager_1.default.createLayoutManager(design.layout);
    // Get filterable tables
    let filterableTables = [];
    for (let widgetItem of layoutManager.getAllWidgets(design.items)) {
        // Create widget
        const widget = WidgetFactory_1.default.createWidget(widgetItem.type);
        // Get filterable tables
        filterableTables = filterableTables.concat(widget.getFilterableTables(widgetItem.design, schema));
    }
    // Remove non-existant tables
    filterableTables = lodash_1.default.filter(lodash_1.default.uniq(filterableTables), (table) => schema.getTable(table));
    return filterableTables;
}
exports.getFilterableTables = getFilterableTables;
/** Get filters from props filters combined with dashboard filters */
function getCompiledFilters(design, schema, filterableTables) {
    let expr, jsonql, table;
    const exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
    const exprCleaner = new mwater_expressions_1.ExprCleaner(schema);
    const exprUtils = new mwater_expressions_1.ExprUtils(schema);
    const compiledFilters = [];
    // Compile filters to JsonQL expected by widgets
    const object = design.filters || {};
    for (table in object) {
        // Clean expression first TODO remove this when dashboards are properly cleaned before being rendered
        expr = object[table];
        expr = exprCleaner.cleanExpr(expr, { table });
        jsonql = exprCompiler.compileExpr({ expr, tableAlias: "{alias}" });
        if (jsonql) {
            compiledFilters.push({ table, jsonql });
        }
    }
    // Add global filters
    for (let filter of design.globalFilters || []) {
        for (table of filterableTables) {
            // Check if exists and is correct type
            const column = schema.getColumn(table, filter.columnId);
            if (!column) {
                continue;
            }
            const columnExpr = { type: "field", table, column: column.id };
            if (exprUtils.getExprType(columnExpr) !== filter.columnType) {
                continue;
            }
            // Create expr
            expr = { type: "op", op: filter.op, table, exprs: [columnExpr].concat(filter.exprs) };
            // Clean expr
            expr = exprCleaner.cleanExpr(expr, { table });
            jsonql = exprCompiler.compileExpr({ expr, tableAlias: "{alias}" });
            if (jsonql) {
                compiledFilters.push({ table, jsonql });
            }
        }
    }
    return compiledFilters;
}
exports.getCompiledFilters = getCompiledFilters;
