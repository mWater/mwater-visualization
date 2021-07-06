"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_2 = require("mwater-expressions");
// Given a series of explicit filters on tables (array of { table: table id, jsonql: JsonQL with {alias} for the table name to filter by })
// extends the filters to all filterable tables with a single 1-n relationship.
// For example, a given community has N water points. If communities are filtered, we want to filter water points as well since there is a
// clear parent-child relationship (specifically, a single n-1 join between water points and communities)
class ImplicitFilterBuilder {
    constructor(schema) {
        this.schema = schema;
    }
    // Find joins between parent and child tables that can be used to extend explicit filters.
    // To be a useable join, must be only n-1 join between child and parent and child must be filterable table
    // filterableTables: array of table ids of filterable tables
    // Returns list of { table, column } of joins from child to parent
    findJoins(filterableTables) {
        let allJoins = [];
        // For each filterable table
        for (var filterableTable of filterableTables) {
            const table = this.schema.getTable(filterableTable);
            if (!table) {
                continue;
            }
            // Find n-1 joins to another filterable table that are not self-references
            let joins = lodash_1.default.filter(this.schema.getColumns(filterableTable), (column) => column.type === "join" && column.join.type === "n-1" && column.join.toTable !== filterableTable);
            // Only keep if singular
            joins = lodash_1.default.flatten(lodash_1.default.filter(lodash_1.default.values(lodash_1.default.groupBy(joins, (join) => join.join.toTable)), (list) => list.length === 1));
            allJoins = allJoins.concat(lodash_1.default.map(joins, (join) => ({
                table: filterableTable,
                column: join.id
            })));
        }
        return allJoins;
    }
    // Extends filters to include implicit filters
    // filterableTables: array of table ids of filterable tables
    // filters: array of { table: table id, jsonql: JsonQL with {alias} for the table name to filter by } of explicit filters
    // returns similar array, but including any extra implicit filters
    extendFilters(filterableTables, filters) {
        const implicitFilters = [];
        // Find joins
        const joins = this.findJoins(filterableTables);
        const exprCompiler = new mwater_expressions_2.ExprCompiler(this.schema);
        // For each join, find filters on parent table
        for (var join of joins) {
            const parentFilters = lodash_1.default.filter(filters, (f) => f.table === this.schema.getColumn(join.table, join.column).join.toTable && f.jsonql);
            if (parentFilters.length === 0) {
                continue;
            }
            const joinColumn = this.schema.getColumn(join.table, join.column);
            // Create where exists with join to parent table (filtered) OR no parent exists
            const implicitFilter = {
                table: join.table,
                jsonql: {
                    type: "op",
                    op: "or",
                    exprs: [
                        {
                            type: "op",
                            op: "exists",
                            exprs: [
                                {
                                    type: "query",
                                    // select null
                                    selects: [],
                                    from: { type: "table", table: joinColumn.join.toTable, alias: "explicit" },
                                    where: {
                                        type: "op",
                                        op: "and",
                                        exprs: [
                                            // Join two tables
                                            exprCompiler.compileJoin(join.table, joinColumn, "{alias}", "explicit")
                                        ]
                                    }
                                }
                            ]
                        },
                        {
                            type: "op",
                            op: "is null",
                            exprs: [
                                exprCompiler.compileExpr({
                                    expr: { type: "field", table: join.table, column: join.column },
                                    tableAlias: "{alias}"
                                })
                            ]
                        }
                    ]
                }
            };
            // Add filters
            for (let parentFilter of parentFilters) {
                implicitFilter.jsonql.exprs[0].exprs[0].where.exprs.push(mwater_expressions_1.injectTableAlias(parentFilter.jsonql, "explicit"));
            }
            implicitFilters.push(implicitFilter);
        }
        return filters.concat(implicitFilters);
        return filters;
    }
}
exports.default = ImplicitFilterBuilder;
