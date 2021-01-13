"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompiledFilters = exports.getFilterableTables = void 0;
var lodash_1 = __importDefault(require("lodash"));
var mwater_expressions_1 = require("mwater-expressions");
var LayoutManager_1 = __importDefault(require("../layouts/LayoutManager"));
var WidgetFactory_1 = __importDefault(require("../widgets/WidgetFactory"));
/** Gets filterable tables for a dashboard */
function getFilterableTables(design, schema) {
    var layoutManager = LayoutManager_1.default.createLayoutManager(design.layout);
    // Get filterable tables
    var filterableTables = [];
    for (var _i = 0, _a = layoutManager.getAllWidgets(design.items); _i < _a.length; _i++) {
        var widgetItem = _a[_i];
        // Create widget
        var widget = WidgetFactory_1.default.createWidget(widgetItem.type);
        // Get filterable tables
        filterableTables = filterableTables.concat(widget.getFilterableTables(widgetItem.design, schema));
    }
    // Remove non-existant tables
    filterableTables = lodash_1.default.filter(lodash_1.default.uniq(filterableTables), function (table) { return schema.getTable(table); });
    return filterableTables;
}
exports.getFilterableTables = getFilterableTables;
/** Get filters from props filters combined with dashboard filters */
function getCompiledFilters(design, schema, filterableTables) {
    var expr, jsonql, table;
    var exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
    var exprCleaner = new mwater_expressions_1.ExprCleaner(schema);
    var exprUtils = new mwater_expressions_1.ExprUtils(schema);
    var compiledFilters = [];
    // Compile filters to JsonQL expected by widgets
    var object = design.filters || {};
    for (table in object) {
        // Clean expression first TODO remove this when dashboards are properly cleaned before being rendered
        expr = object[table];
        expr = exprCleaner.cleanExpr(expr, { table: table });
        jsonql = exprCompiler.compileExpr({ expr: expr, tableAlias: "{alias}" });
        if (jsonql) {
            compiledFilters.push({ table: table, jsonql: jsonql });
        }
    }
    // Add global filters
    for (var _i = 0, _a = (design.globalFilters || []); _i < _a.length; _i++) {
        var filter = _a[_i];
        for (var _b = 0, filterableTables_1 = filterableTables; _b < filterableTables_1.length; _b++) {
            table = filterableTables_1[_b];
            // Check if exists and is correct type
            var column = schema.getColumn(table, filter.columnId);
            if (!column) {
                continue;
            }
            var columnExpr = { type: "field", table: table, column: column.id };
            if (exprUtils.getExprType(columnExpr) !== filter.columnType) {
                continue;
            }
            // Create expr
            expr = { type: "op", op: filter.op, table: table, exprs: [columnExpr].concat(filter.exprs) };
            // Clean expr
            expr = exprCleaner.cleanExpr(expr, { table: table });
            jsonql = exprCompiler.compileExpr({ expr: expr, tableAlias: "{alias}" });
            if (jsonql) {
                compiledFilters.push({ table: table, jsonql: jsonql });
            }
        }
    }
    return compiledFilters;
}
exports.getCompiledFilters = getCompiledFilters;
