"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findExprValues = void 0;
var lodash_1 = __importDefault(require("lodash"));
var mwater_expressions_1 = require("mwater-expressions");
/** Perform query to find quickfilter values for text and text[] expressions
 * text[] expressions are tricky as they need a special query
 * In order to filter the text[] queries, filters must use table "value" and filter on no column
 */
function findExprValues(expr, schema, dataSource, filters, offset, limit, callback) {
    var exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
    var exprUtils = new mwater_expressions_1.ExprUtils(schema);
    // Get type of expression
    var exprType = exprUtils.getExprType(expr);
    // Table
    var table = expr.table;
    var query;
    if (exprType == "text") {
        // select distinct <compiled expr> as value from <table> where <filters> order by 1 offset limit 
        query = {
            type: "query",
            distinct: true,
            selects: [
                { type: "select", expr: exprCompiler.compileExpr({ expr: expr, tableAlias: "main" }), alias: "value" }
            ],
            from: exprCompiler.compileTable(table, "main"),
            where: {
                type: "op",
                op: "and",
                exprs: []
            },
            orderBy: [{ ordinal: 1, direction: "asc" }],
            limit: limit,
            offset: offset
        };
        // Add filters if present
        for (var _i = 0, _a = (filters || []); _i < _a.length; _i++) {
            var filter = _a[_i];
            if (filter.table == table) {
                // TODO Type this properly
                query.where.exprs.push(mwater_expressions_1.injectTableAlias(filter.jsonql, "main"));
            }
        }
    }
    else if (exprType == "text[]") {
        // select distinct value from 
        // <table> as main cross join jsonb_array_elements_text(<compiled expr>) as value
        // where value like 'abc%' 
        // order by 1
        query = {
            type: "query",
            distinct: true,
            selects: [
                { type: "select", expr: { type: "field", tableAlias: "value" }, alias: "value" }
            ],
            from: {
                type: "join",
                kind: "cross",
                left: exprCompiler.compileTable(table, "main"),
                right: {
                    type: "subexpr",
                    expr: { type: "op", op: "jsonb_array_elements_text", exprs: [
                            exprCompiler.compileExpr({ expr: expr, tableAlias: "main" })
                        ] },
                    alias: "value"
                }
            },
            where: {
                type: "op",
                op: "and",
                exprs: []
            },
            orderBy: [{ ordinal: 1, direction: "asc" }],
            limit: limit,
            offset: offset
        };
        // Add filters if present. Value filters must be for pseudo-table "_values_" on column "value"
        for (var _b = 0, _c = (filters || []); _b < _c.length; _b++) {
            var filter = _c[_b];
            if (filter.table == table) {
                // TODO Type this properly
                query.where.exprs.push(mwater_expressions_1.injectTableAlias(filter.jsonql, "main"));
            }
            if (filter.table == "value") {
                // TODO Type this properly
                query.where.exprs.push(mwater_expressions_1.injectTableAlias(filter.jsonql, "value"));
            }
        }
    }
    else {
        return callback(new Error("Filter type " + exprType + " not supported"));
    }
    // Execute query
    dataSource.performQuery(query, function (err, rows) {
        if (err) {
            callback(err);
            return;
        }
        // Filter null and blank
        rows = lodash_1.default.filter(rows, function (row) { return row.value; });
        callback(null, lodash_1.default.pluck(rows, "value"));
    });
}
exports.findExprValues = findExprValues;
