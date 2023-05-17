"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_2 = require("mwater-expressions");
const AxisBuilder_1 = __importDefault(require("../../../axes/AxisBuilder"));
const mwater_expressions_3 = require("mwater-expressions");
const PivotChartUtils = __importStar(require("./PivotChartUtils"));
/** Builds pivot table queries.
 * Result is flat list for each intersection with each row being data for a single cell
 * columns of result are:
 *  value: value of the cell (aggregate)
 *  r0: row segment value (if present)
 *  r1: inner row segment value (if present)
 *  ...
 *  c0: column segment value (if present)
 *  c1: inner column segment value (if present)
 *  ...
 * Also produces queries needed to order row/column segments when ordered
 * These are indexed by the segment id and contain the values in order (already asc/desc corrected)
 * each row containing only { value: }
 */
class PivotChartQueryBuilder {
    constructor(options) {
        this.schema = options.schema;
        this.exprUtils = new mwater_expressions_2.ExprUtils(this.schema);
        this.axisBuilder = new AxisBuilder_1.default({ schema: this.schema });
    }
    // Create the queries needed for the chart.
    // extraFilters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. }
    // Queries are indexed by intersection id, as one query is made for each intersection
    createQueries(design, extraFilters) {
        var _a;
        let filter, intersectionId, relevantFilters, whereClauses;
        const exprCompiler = new mwater_expressions_1.ExprCompiler(this.schema);
        const queries = {};
        // For each intersection
        for (let rowPath of PivotChartUtils.getSegmentPaths(design.rows)) {
            for (let columnPath of PivotChartUtils.getSegmentPaths(design.columns)) {
                // Get id of intersection
                var i;
                intersectionId = PivotChartUtils.getIntersectionId(rowPath, columnPath);
                // Get intersection
                const intersection = design.intersections[intersectionId];
                // Create shell of query
                const query = {
                    type: "query",
                    selects: [],
                    from: exprCompiler.compileTable(design.table, "main"),
                    limit: 10000,
                    groupBy: []
                };
                // Filters to add (not yet compiled)
                const filters = [];
                const compileSegmentAxis = (axis) => {
                    // Get axis type
                    const axisType = this.axisBuilder.getAxisType(axis);
                    // Enumset needs to be unwrapped
                    if (axisType === "enumset") {
                        // Use to_jsonb(x) to convert to jsonb then jsonb_array_elements_text to convert to unnested array
                        return {
                            type: "op",
                            op: "jsonb_array_elements_text",
                            exprs: [
                                {
                                    type: "op",
                                    op: "to_jsonb",
                                    exprs: [this.axisBuilder.compileAxis({ axis, tableAlias: "main" })]
                                }
                            ]
                        };
                    }
                    else {
                        return this.axisBuilder.compileAxis({ axis, tableAlias: "main" });
                    }
                };
                // Add segments
                for (i = 0; i < rowPath.length; i++) {
                    const rowSegment = rowPath[i];
                    query.selects.push({
                        type: "select",
                        expr: compileSegmentAxis(rowSegment.valueAxis),
                        alias: `r${i}`
                    });
                    query.groupBy.push(i + 1);
                    if (rowSegment.filter) {
                        filters.push(rowSegment.filter);
                    }
                }
                for (i = 0; i < columnPath.length; i++) {
                    const columnSegment = columnPath[i];
                    query.selects.push({
                        type: "select",
                        expr: this.axisBuilder.compileAxis({ axis: columnSegment.valueAxis, tableAlias: "main" }),
                        alias: `c${i}`
                    });
                    query.groupBy.push(i + 1 + rowPath.length);
                    if (columnSegment.filter) {
                        filters.push(columnSegment.filter);
                    }
                }
                // Add value
                query.selects.push({
                    type: "select",
                    expr: this.axisBuilder.compileAxis({ axis: intersection === null || intersection === void 0 ? void 0 : intersection.valueAxis, tableAlias: "main" }),
                    alias: "value"
                });
                if (intersection === null || intersection === void 0 ? void 0 : intersection.filter) {
                    filters.push(intersection.filter);
                }
                // Add background color
                if (intersection === null || intersection === void 0 ? void 0 : intersection.backgroundColorAxis) {
                    query.selects.push({
                        type: "select",
                        expr: this.axisBuilder.compileAxis({ axis: intersection === null || intersection === void 0 ? void 0 : intersection.backgroundColorAxis, tableAlias: "main" }),
                        alias: "bc"
                    });
                }
                // Add background color conditions
                const iterable = intersection.backgroundColorConditions || [];
                for (i = 0; i < iterable.length; i++) {
                    const backgroundColorCondition = iterable[i];
                    query.selects.push({
                        type: "select",
                        expr: exprCompiler.compileExpr({ expr: (_a = backgroundColorCondition.condition) !== null && _a !== void 0 ? _a : null, tableAlias: "main" }),
                        alias: `bcc${i}`
                    });
                }
                // If all selects are null, don't create query
                if (lodash_1.default.all(query.selects, (select) => select.expr == null)) {
                    continue;
                }
                // Add where
                whereClauses = [];
                if (design.filter) {
                    whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "main" }));
                }
                // Add other filters
                whereClauses = whereClauses.concat(lodash_1.default.map(filters, (filter) => exprCompiler.compileExpr({ expr: filter, tableAlias: "main" })));
                // Add filters
                if (extraFilters && extraFilters.length > 0) {
                    // Get relevant filters
                    relevantFilters = lodash_1.default.where(extraFilters, { table: design.table });
                    // Add filters
                    for (filter of relevantFilters) {
                        whereClauses.push((0, mwater_expressions_3.injectTableAlias)(filter.jsonql, "main"));
                    }
                }
                whereClauses = lodash_1.default.compact(whereClauses);
                if (whereClauses.length === 1) {
                    query.where = whereClauses[0];
                }
                else if (whereClauses.length > 1) {
                    query.where = { type: "op", op: "and", exprs: whereClauses };
                }
                queries[intersectionId] = query;
            }
        }
        // For each segment
        const segments = PivotChartUtils.getAllSegments(design.rows).concat(PivotChartUtils.getAllSegments(design.columns));
        for (let segment of segments) {
            if (segment.orderExpr) {
                // Create where which includes the segments filter (if present) and the "or" of all intersections that are present
                whereClauses = [];
                if (segment.filter) {
                    whereClauses.push(exprCompiler.compileExpr({ expr: segment.filter, tableAlias: "main" }));
                }
                // Get all intersection filters
                const intersectionFilters = [];
                for (intersectionId of lodash_1.default.keys(design.intersections)) {
                    if (intersectionId.includes(segment.id)) {
                        ;
                        ({ filter } = design.intersections[intersectionId]);
                        if (filter) {
                            intersectionFilters.push(filter);
                        }
                        else {
                            // If intersection has no filter, still needs to "or" with true
                            intersectionFilters.push({ type: "literal", valueType: "boolean", value: true });
                        }
                    }
                }
                if (intersectionFilters.length > 0) {
                    whereClauses.push({
                        type: "op",
                        op: "or",
                        exprs: lodash_1.default.map(intersectionFilters, (filter) => exprCompiler.compileExpr({ expr: filter, tableAlias: "main" }))
                    });
                }
                if (design.filter) {
                    whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "main" }));
                }
                // Add extra filters
                if (extraFilters && extraFilters.length > 0) {
                    // Get relevant filters
                    relevantFilters = lodash_1.default.where(extraFilters, { table: design.table });
                    // Add filters
                    for (filter of relevantFilters) {
                        whereClauses.push((0, mwater_expressions_3.injectTableAlias)(filter.jsonql, "main"));
                    }
                }
                whereClauses = lodash_1.default.compact(whereClauses);
                let where = null;
                if (whereClauses.length === 1) {
                    where = whereClauses[0];
                }
                else if (whereClauses.length > 1) {
                    where = { type: "op", op: "and", exprs: whereClauses };
                }
                // Create query to get ordering
                queries[segment.id] = {
                    type: "query",
                    selects: [
                        {
                            type: "select",
                            expr: this.axisBuilder.compileAxis({ axis: segment.valueAxis, tableAlias: "main" }),
                            alias: "value"
                        }
                    ],
                    from: exprCompiler.compileTable(design.table, "main"),
                    where,
                    groupBy: [1],
                    orderBy: [
                        {
                            expr: exprCompiler.compileExpr({ expr: segment.orderExpr, tableAlias: "main" }),
                            direction: segment.orderDir || "asc"
                        }
                    ]
                };
            }
        }
        return queries;
    }
}
exports.default = PivotChartQueryBuilder;
