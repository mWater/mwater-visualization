"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultPopupFilterJoins = exports.createPopupFilters = void 0;
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_2 = require("mwater-expressions");
// Utilities for popup filter joins. See PopupFilterJoins.md for further explanation.
function createPopupFilters(popupFilterJoins, schema, layerTable, rowId, useWithin = false) {
    const exprUtils = new mwater_expressions_2.ExprUtils(schema);
    const exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
    const filters = [];
    // For each filter join
    for (let table in popupFilterJoins) {
        // Determine type of expression (id or id[])
        const expr = popupFilterJoins[table];
        const exprType = exprUtils.getExprType(expr);
        // Handle useWithin
        if (useWithin) {
            // For simple id type
            if (exprType === "id") {
                // Compile filter
                const filterExpr = {
                    type: "op",
                    op: "within",
                    table,
                    exprs: [expr, { type: "literal", idTable: exprUtils.getExprIdTable(expr), valueType: "id", value: rowId }]
                };
                filters.push({ table, jsonql: exprCompiler.compileExpr({ expr: filterExpr, tableAlias: "{alias}" }) });
            }
            // id[] not supported
            // else if exprType == "id[]"
            //   # Compile filter
            //   filterExpr = {
            //     type: "op"
            //     op: "within any"
            //     table: table
            //     exprs: [
            //       expr
            //       { type: "literal", idTable: exprUtils.getExprIdTable(expr), valueType: "id", value: ev.data.id }
            //     ]
            //   }
            //   filters.push(exprCompiler.compileExpr(expr: filterExpr, tableAlias: "{alias}"))
        }
        else {
            // For simple id type
            var filter;
            if (exprType === "id") {
                filter = {
                    table,
                    jsonql: {
                        type: "op",
                        op: "=",
                        exprs: [exprCompiler.compileExpr({ expr, tableAlias: "{alias}" }), { type: "literal", value: rowId }]
                    }
                };
                filters.push(filter);
            }
            else if (exprType === "id[]") {
                filter = {
                    table,
                    jsonql: {
                        type: "op",
                        op: "@>",
                        exprs: [
                            exprCompiler.compileExpr({ expr, tableAlias: "{alias}" }),
                            { type: "op", op: "::jsonb", exprs: [{ type: "literal", value: JSON.stringify([rowId]) }] }
                        ]
                    }
                };
                filters.push(filter);
            }
        }
    }
    return filters;
}
exports.createPopupFilters = createPopupFilters;
// Create default popup filter joins where the join is just the id (not used for choropleth since that needs to join to admin_regions)
function createDefaultPopupFilterJoins(table) {
    const popupFilterJoins = {};
    // Return id of row for a simple match
    popupFilterJoins[table] = { table, type: "id" };
    return popupFilterJoins;
}
exports.createDefaultPopupFilterJoins = createDefaultPopupFilterJoins;
