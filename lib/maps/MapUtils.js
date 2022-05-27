"use strict";
// General utilities for a map
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompiledFilters = exports.getFilterableTables = exports.convertToMarkersMap = exports.convertToClusterMap = exports.canConvertToMarkersMap = exports.canConvertToClusterMap = void 0;
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_1 = require("mwater-expressions");
const LayerFactory_1 = __importDefault(require("./LayerFactory"));
// Check if can convert to a cluster map. Only maps containing marker views can be
function canConvertToClusterMap(design) {
    return lodash_1.default.any(design.layerViews, (lv) => lv.type === "Markers");
}
exports.canConvertToClusterMap = canConvertToClusterMap;
// Check if can convert to a markers map. Only maps containing cluster views can be
function canConvertToMarkersMap(design) {
    return lodash_1.default.any(design.layerViews, (lv) => lv.type === "Cluster");
}
exports.canConvertToMarkersMap = canConvertToMarkersMap;
// Convert to a cluster map
function convertToClusterMap(design) {
    const layerViews = lodash_1.default.map(design.layerViews, (lv) => {
        if (lv.type !== "Markers") {
            return lv;
        }
        lv = lodash_1.default.cloneDeep(lv);
        // Set type and design
        lv.type = "Cluster";
        lv.design = {
            table: lv.design.table,
            axes: { geometry: lv.design.axes != null ? lv.design.axes.geometry : undefined },
            filter: lv.design.filter,
            fillColor: lv.design.color,
            minZoom: lv.design.minZoom,
            maxZoom: lv.design.maxZoom
        };
        return lv;
    });
    return lodash_1.default.extend({}, design, { layerViews });
}
exports.convertToClusterMap = convertToClusterMap;
// Convert to a markers map
function convertToMarkersMap(design) {
    const layerViews = lodash_1.default.map(design.layerViews, (lv) => {
        if (lv.type !== "Cluster") {
            return lv;
        }
        lv = lodash_1.default.cloneDeep(lv);
        // Set type and design
        lv.type = "Markers";
        lv.design = {
            table: lv.design.table,
            axes: { geometry: lv.design.axes != null ? lv.design.axes.geometry : undefined },
            filter: lv.design.filter,
            color: lv.design.fillColor,
            minZoom: lv.design.minZoom,
            maxZoom: lv.design.maxZoom
        };
        return lv;
    });
    return lodash_1.default.extend({}, design, { layerViews });
}
exports.convertToMarkersMap = convertToMarkersMap;
// Get ids of filterable tables
function getFilterableTables(design, schema) {
    let filterableTables = [];
    for (let layerView of design.layerViews) {
        // Create layer
        const layer = LayerFactory_1.default.createLayer(layerView.type);
        // Get filterable tables
        filterableTables = lodash_1.default.uniq(filterableTables.concat(layer.getFilterableTables(layerView.design, schema)));
    }
    // Remove non-existant tables
    filterableTables = lodash_1.default.filter(filterableTables, (table) => schema.getTable(table));
    return filterableTables;
}
exports.getFilterableTables = getFilterableTables;
// Compile map filters with global filters
function getCompiledFilters(design, schema, filterableTables) {
    const exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
    const exprCleaner = new mwater_expressions_1.ExprCleaner(schema);
    const exprUtils = new mwater_expressions_1.ExprUtils(schema);
    const compiledFilters = [];
    // Compile filters to JsonQL expected by layers
    for (const table in design.filters || {}) {
        const expr = design.filters[table];
        const jsonql = exprCompiler.compileExpr({ expr, tableAlias: "{alias}" });
        if (jsonql) {
            compiledFilters.push({ table, jsonql });
        }
    }
    // Add global filters
    for (let filter of design.globalFilters || []) {
        for (const table of filterableTables) {
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
            let expr = { type: "op", op: filter.op, table, exprs: [columnExpr].concat(filter.exprs) };
            // Clean expr
            expr = exprCleaner.cleanExpr(expr, { table });
            const jsonql = exprCompiler.compileExpr({ expr, tableAlias: "{alias}" });
            if (jsonql) {
                compiledFilters.push({ table, jsonql });
            }
        }
    }
    return compiledFilters;
}
exports.getCompiledFilters = getCompiledFilters;
