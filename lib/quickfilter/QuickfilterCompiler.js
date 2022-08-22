"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_2 = require("mwater-expressions");
const mwater_expressions_3 = require("mwater-expressions");
/** Compiles quickfilter values into filters */
class QuickfilterCompiler {
    constructor(schema) {
        this.schema = schema;
    }
    /** design is array of quickfilters (see README.md)
     * values is array of values
     * locks is array of locked quickfilters. Overrides values
     * Returns array of filters { table: table id, jsonql: JsonQL with {alias} for the table name to filter by }
     * See README for values
     */
    compile(design, values, locks) {
        if (!design) {
            return [];
        }
        const filters = [];
        for (let index = 0; index < design.length; index++) {
            // Determine if locked
            var value;
            var item = design[index];
            const lock = lodash_1.default.find(locks || [], (lock) => lodash_1.default.isEqual(lock.expr, item.expr));
            // Determine value
            if (lock) {
                ;
                ({ value } = lock);
            }
            else {
                value = values === null || values === void 0 ? void 0 : values[index];
            }
            // Null means no filter
            if (!value) {
                continue;
            }
            // Clean expression first
            const expr = new mwater_expressions_2.ExprCleaner(this.schema).cleanExpr(item.expr);
            // Do not render if nothing
            if (!expr) {
                continue;
            }
            // Due to bug, some quickfilters were merged even though multi was different. Get multi
            // from original if merged
            let { multi } = item;
            if (item.merged) {
                for (let i = 0, end = index, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
                    if (!design[i].merged) {
                        ;
                        ({ multi } = design[i]);
                    }
                }
            }
            // Compile to boolean expression
            const filterExpr = this.compileToFilterExpr(expr, value, multi);
            const jsonql = new mwater_expressions_1.ExprCompiler(this.schema).compileExpr({ expr: filterExpr, tableAlias: "{alias}" });
            // Only keep if compiles to something
            if (jsonql == null) {
                continue;
            }
            filters.push({
                table: expr.table,
                jsonql
            });
        }
        return filters;
    }
    compileToFilterExpr(expr, value, multi) {
        // Get type of expr
        const type = new mwater_expressions_3.ExprUtils(this.schema).getExprType(expr);
        const idTable = new mwater_expressions_3.ExprUtils(this.schema).getExprIdTable(expr);
        if (type === "text") {
            // Create simple = expression
            if (multi) {
                return {
                    type: "op",
                    op: "= any",
                    table: expr.table,
                    exprs: [expr, { type: "literal", valueType: "text[]", value }]
                };
            }
            else {
                return {
                    type: "op",
                    op: "=",
                    table: expr.table,
                    exprs: [expr, { type: "literal", valueType: "text", value }]
                };
            }
        }
        else if (type === "enum") {
            // Create simple = expression
            if (multi) {
                return {
                    type: "op",
                    op: "= any",
                    table: expr.table,
                    exprs: [expr, { type: "literal", valueType: "enumset", value }]
                };
            }
            else {
                return {
                    type: "op",
                    op: "=",
                    table: expr.table,
                    exprs: [expr, { type: "literal", valueType: "enum", value }]
                };
            }
        }
        else if (type && ["enumset", "text[]"].includes(type)) {
            // Create contains expression
            if (multi) {
                return {
                    type: "op",
                    op: "intersects",
                    table: expr.table,
                    exprs: [expr, { type: "literal", valueType: type, value }]
                };
            }
            else {
                return {
                    type: "op",
                    op: "contains",
                    table: expr.table,
                    exprs: [expr, { type: "literal", valueType: type, value: [value] }]
                };
            }
        }
        else if (type && ["id[]"].includes(type)) {
            if (multi) {
                return {
                    type: "op",
                    op: "intersects",
                    table: expr.table,
                    exprs: [expr, { type: "literal", valueType: "id[]", idTable, value }]
                };
            }
            else {
                return {
                    type: "op",
                    op: "contains",
                    table: expr.table,
                    exprs: [expr, { type: "literal", valueType: "id[]", idTable, value: [value] }]
                };
            }
        }
        else if (type && ["date", "datetime"].includes(type) && value.op) {
            return {
                type: "op",
                op: value.op,
                table: expr.table,
                exprs: [expr].concat(value.exprs)
            };
        }
        else {
            return null;
        }
    }
}
exports.default = QuickfilterCompiler;
