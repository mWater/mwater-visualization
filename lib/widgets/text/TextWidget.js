"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const lodash_1 = __importDefault(require("lodash"));
const async_1 = __importDefault(require("async"));
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_2 = require("mwater-expressions");
const mwater_expressions_3 = require("mwater-expressions");
const mwater_expressions_4 = require("mwater-expressions");
const Widget_1 = __importDefault(require("../Widget"));
class TextWidget extends Widget_1.default {
    // Creates a React element that is a view of the widget
    // options:
    //  schema: schema to use
    //  dataSource: data source to use
    //  widgetDataSource: Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource.
    //  design: widget design
    //  scope: scope of the widget (when the widget self-selects a particular scope)
    //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    //  onScopeChange: called with scope of widget
    //  onDesignChange: called with new design. null/undefined for readonly
    //  width: width in pixels on screen
    //  height: height in pixels on screen
    //  singleRowTable: optional table name of table that will be filtered to have a single row present. Widget designer should optionally account for this
    //  namedStrings: Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget
    createViewElement(options) {
        // Put here so TextWidget can be created on server
        const TextWidgetComponent = require("./TextWidgetComponent").default;
        return R(TextWidgetComponent, {
            schema: options.schema,
            dataSource: options.dataSource,
            widgetDataSource: options.widgetDataSource,
            filters: options.filters,
            design: options.design,
            onDesignChange: options.onDesignChange,
            width: options.width,
            height: options.height,
            singleRowTable: options.singleRowTable,
            namedStrings: options.namedStrings,
            ref: options.widgetRef
        });
    }
    // Get the data that the widget needs. This will be called on the server, typically.
    //   design: design of the chart
    //   schema: schema to use
    //   dataSource: data source to get data from
    //   filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
    //   callback: (error, data)
    getData(design, schema, dataSource, filters, callback) {
        // Evaluates a single exprItem
        const evalExprItem = (exprItem, cb) => {
            let query, whereClauses;
            if (!exprItem.expr) {
                return cb(null);
            }
            const { table } = exprItem.expr;
            // If table doesn't exist, return null
            if (table && !schema.getTable(table)) {
                return cb(null);
            }
            const exprCompiler = new mwater_expressions_2.ExprCompiler(schema);
            const exprUtils = new mwater_expressions_1.ExprUtils(schema);
            // Clean expression
            const exprCleaner = new mwater_expressions_3.ExprCleaner(schema);
            let expr = exprCleaner.cleanExpr(exprItem.expr, { aggrStatuses: ["individual", "literal", "aggregate"] });
            // Get relevant filters
            if (table) {
                const relevantFilters = lodash_1.default.where(filters || [], { table });
                whereClauses = lodash_1.default.map(relevantFilters, (f) => mwater_expressions_4.injectTableAlias(f.jsonql, "main"));
            }
            else {
                whereClauses = [];
            }
            // In case of "sum where"/"count where", extract where clause to make faster
            if (expr && expr.type == "op" && (expr === null || expr === void 0 ? void 0 : expr.op) === "sum where") {
                whereClauses.push(exprCompiler.compileExpr({ expr: expr.exprs[1], tableAlias: "main" }));
                expr = { type: "op", table: expr.table, op: "sum", exprs: [expr.exprs[0]] };
            }
            else if (expr && expr.type == "op" && (expr === null || expr === void 0 ? void 0 : expr.op) === "count where") {
                whereClauses.push(exprCompiler.compileExpr({ expr: expr.exprs[0], tableAlias: "main" }));
                expr = { type: "op", table: expr.table, op: "count", exprs: [] };
            }
            let compiledExpr = exprCompiler.compileExpr({ expr, tableAlias: "main" });
            const exprType = exprUtils.getExprType(expr);
            // Handle special case of geometry, converting to GeoJSON
            if (exprType === "geometry") {
                // Convert to 4326 (lat/long). Force ::geometry for null
                compiledExpr = {
                    type: "op",
                    op: "::jsonb",
                    exprs: [
                        {
                            type: "op",
                            op: "ST_AsGeoJSON",
                            exprs: [
                                {
                                    type: "op",
                                    op: "ST_Transform",
                                    exprs: [{ type: "op", op: "::geometry", exprs: [compiledExpr] }, 4326]
                                }
                            ]
                        }
                    ]
                };
            }
            const aggrStatus = exprUtils.getExprAggrStatus(expr);
            if (aggrStatus === "individual" || aggrStatus === "literal") {
                // Get two distinct examples to know if unique if not aggregate
                query = {
                    type: "query",
                    distinct: true,
                    selects: [{ type: "select", expr: compiledExpr, alias: "value" }],
                    from: table ? exprCompiler.compileTable(table, "main") : undefined,
                    limit: 2
                };
            }
            else {
                query = {
                    type: "query",
                    selects: [{ type: "select", expr: compiledExpr, alias: "value" }],
                    from: table ? exprCompiler.compileTable(table, "main") : undefined
                };
            }
            whereClauses = lodash_1.default.compact(whereClauses);
            // Wrap if multiple
            if (whereClauses.length > 1) {
                query.where = { type: "op", op: "and", exprs: whereClauses };
            }
            else {
                query.where = whereClauses[0];
            }
            // Execute query
            return dataSource.performQuery(query, (error, rows) => {
                if (error) {
                    return cb(error);
                }
                else {
                    // If multiple, use null
                    if (rows.length !== 1) {
                        return cb(null, null);
                    }
                    else {
                        return cb(null, rows[0].value);
                    }
                }
            });
        };
        // Map of value by id
        const exprValues = {};
        return async_1.default.each(this.getExprItems(design.items), (exprItem, cb) => {
            evalExprItem(exprItem, (error, value) => {
                if (error) {
                    cb(error);
                }
                else {
                    exprValues[exprItem.id] = value;
                    cb(null);
                }
            });
        }, (error) => {
            if (error) {
                callback(error);
            }
            else {
                callback(null, exprValues);
            }
        });
    }
    // Determine if widget is auto-height, which means that a vertical height is not required.
    isAutoHeight() {
        return true;
    }
    // Get expression items recursively
    getExprItems(items) {
        let exprItems = [];
        for (let item of items || []) {
            if (item.type === "expr") {
                exprItems.push(item);
            }
            if (item.items) {
                exprItems = exprItems.concat(this.getExprItems(item.items));
            }
        }
        return exprItems;
    }
    // Get a list of table ids that can be filtered on
    getFilterableTables(design, schema) {
        const exprItems = this.getExprItems(design.items);
        let filterableTables = lodash_1.default.map(exprItems, (exprItem) => { var _a; return (_a = exprItem.expr) === null || _a === void 0 ? void 0 : _a.table; });
        filterableTables = lodash_1.default.uniq(lodash_1.default.compact(filterableTables));
        return filterableTables;
    }
    // Get table of contents entries for the widget, entries that should be displayed in the TOC.
    // returns `[{ id: "id that is unique within widget", text: "text of TOC entry", level: 1, 2, etc. }]
    // For simplicity, the h1, h2, etc. have ids of 0, 1, 2 in the order they appear. h1, h2 will be given ids 0, 1 respectively.
    getTOCEntries(design, namedStrings) {
        // Find all items that are h1, h2, etc
        const entries = [];
        // Convert items into flat text
        function flattenText(items) {
            let text = lodash_1.default.map(items, function (item) {
                if (lodash_1.default.isString(item)) {
                    return item;
                }
                if (item === null || item === void 0 ? void 0 : item.items) {
                    return flattenText(item.items);
                }
            }).join("");
            // Handle named strings
            return (text = text.replace(/\{\{.+?\}\}/g, (match) => {
                const name = match.substr(2, match.length - 4);
                if (namedStrings && namedStrings[name] != null) {
                    return namedStrings[name];
                }
                else {
                    return match;
                }
            }));
        }
        var findRecursive = (items) => (() => {
            const result = [];
            for (let item of items || []) {
                if ((item === null || item === void 0 ? void 0 : item.type) === "element" && item.tag.match(/^h[1-9]$/)) {
                    entries.push({ id: entries.length, level: parseInt(item.tag.substr(1)), text: flattenText(item.items) });
                }
                if (item === null || item === void 0 ? void 0 : item.items) {
                    result.push(findRecursive(item.items));
                }
                else {
                    result.push(undefined);
                }
            }
            return result;
        })();
        findRecursive(design.items);
        return entries;
    }
}
exports.default = TextWidget;
