"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findExprValues = void 0;
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_1 = require("mwater-expressions");
/** Perform query to find quickfilter values for text and text[] expressions
 * text[] expressions are tricky as they need a special query
 * In order to filter the text[] queries, filters must use table "value" and filter on no column
 */
function findExprValues(expr, schema, dataSource, filters, offset, limit, callback) {
    const exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
    const exprUtils = new mwater_expressions_1.ExprUtils(schema);
    // Get type of expression
    const exprType = exprUtils.getExprType(expr);
    // Table
    const table = expr.table;
    let query;
    if (exprType == "text") {
        // select distinct <compiled expr> as value from <table> where <filters> order by 1 offset limit
        query = {
            type: "query",
            distinct: true,
            selects: [{ type: "select", expr: exprCompiler.compileExpr({ expr, tableAlias: "main" }), alias: "value" }],
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
        for (const filter of filters || []) {
            if (filter.table == table) {
                // TODO Type this properly
                ;
                query.where.exprs.push((0, mwater_expressions_1.injectTableAlias)(filter.jsonql, "main"));
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
            selects: [{ type: "select", expr: { type: "field", tableAlias: "values" }, alias: "value" }],
            from: {
                type: "join",
                kind: "cross",
                left: exprCompiler.compileTable(table, "main"),
                right: {
                    type: "subexpr",
                    expr: {
                        type: "op",
                        op: "jsonb_array_elements_text",
                        exprs: [{ type: "op", op: "to_jsonb", exprs: [exprCompiler.compileExpr({ expr, tableAlias: "main" })] }]
                    },
                    alias: "values"
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
        // Add filters if present. Value filters must be for pseudo-table "values" on column "value"
        for (const filter of filters || []) {
            if (filter.table == table) {
                // TODO Type this properly
                ;
                query.where.exprs.push((0, mwater_expressions_1.injectTableAlias)(filter.jsonql, "main"));
            }
            if (filter.table == "values") {
                // TODO Type this properly
                ;
                query.where.exprs.push((0, mwater_expressions_1.injectTableAlias)(filter.jsonql, "values"));
            }
        }
    }
    else {
        return callback(new Error(`Filter type ${exprType} not supported`));
    }
    // Execute query
    dataSource.performQuery(query, (err, rows) => {
        if (err) {
            callback(err);
            return;
        }
        // Filter null and blank
        rows = lodash_1.default.filter(rows, (row) => row.value);
        callback(null, lodash_1.default.pluck(rows, "value"));
    });
}
exports.findExprValues = findExprValues;
