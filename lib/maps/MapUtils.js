"use strict";
// General utilities for a map
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompiledFilters = exports.getFilterableTables = exports.convertToClusterMap = exports.canConvertToClusterMap = void 0;
var lodash_1 = __importDefault(require("lodash"));
var mwater_expressions_1 = require("mwater-expressions");
var LayerFactory_1 = __importDefault(require("./LayerFactory"));
// Check if can convert to a cluster map. Only maps containing marker views can be
function canConvertToClusterMap(design) {
    return lodash_1.default.any(design.layerViews, function (lv) { return lv.type === "Markers"; });
}
exports.canConvertToClusterMap = canConvertToClusterMap;
// Convert to a cluster map
function convertToClusterMap(design) {
    var layerViews = lodash_1.default.map(design.layerViews, function (lv) {
        if (lv.type !== "Markers") {
            return lv;
        }
        lv = lodash_1.default.cloneDeep(lv);
        // Set type and design
        lv.type = "Cluster";
        lv.design = {
            table: lv.design.table,
            axes: { geometry: (lv.design.axes != null ? lv.design.axes.geometry : undefined) },
            filter: lv.design.filter,
            fillColor: lv.design.color,
            minZoom: lv.design.minZoom,
            maxZoom: lv.design.maxZoom
        };
        return lv;
    });
    return lodash_1.default.extend({}, design, { layerViews: layerViews });
}
exports.convertToClusterMap = convertToClusterMap;
// Get ids of filterable tables
function getFilterableTables(design, schema) {
    var filterableTables = [];
    for (var _i = 0, _a = design.layerViews; _i < _a.length; _i++) {
        var layerView = _a[_i];
        // Create layer
        var layer = LayerFactory_1.default.createLayer(layerView.type);
        // Get filterable tables
        filterableTables = lodash_1.default.uniq(filterableTables.concat(layer.getFilterableTables(layerView.design, schema)));
    }
    // Remove non-existant tables
    filterableTables = lodash_1.default.filter(filterableTables, function (table) { return schema.getTable(table); });
    return filterableTables;
}
exports.getFilterableTables = getFilterableTables;
// Compile map filters with global filters
function getCompiledFilters(design, schema, filterableTables) {
    var exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
    var exprCleaner = new mwater_expressions_1.ExprCleaner(schema);
    var exprUtils = new mwater_expressions_1.ExprUtils(schema);
    var compiledFilters = [];
    // Compile filters to JsonQL expected by layers
    for (var table in design.filters || {}) {
        var expr = design.filters[table];
        var jsonql = exprCompiler.compileExpr({ expr: expr, tableAlias: "{alias}" });
        if (jsonql) {
            compiledFilters.push({ table: table, jsonql: jsonql });
        }
    }
    // Add global filters
    for (var _i = 0, _a = (design.globalFilters || []); _i < _a.length; _i++) {
        var filter = _a[_i];
        for (var _b = 0, filterableTables_1 = filterableTables; _b < filterableTables_1.length; _b++) {
            var table = filterableTables_1[_b];
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
            var expr = { type: "op", op: filter.op, table: table, exprs: [columnExpr].concat(filter.exprs) };
            // Clean expr
            expr = exprCleaner.cleanExpr(expr, { table: table });
            var jsonql = exprCompiler.compileExpr({ expr: expr, tableAlias: "{alias}" });
            if (jsonql) {
                compiledFilters.push({ table: table, jsonql: jsonql });
            }
        }
    }
    return compiledFilters;
}
exports.getCompiledFilters = getCompiledFilters;
