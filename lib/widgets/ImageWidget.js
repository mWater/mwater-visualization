"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_2 = require("mwater-expressions");
const Widget_1 = __importDefault(require("./Widget"));
class ImageWidget extends Widget_1.default {
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
    createViewElement(options) {
        // Put here so ImageWidget can be created on server
        const ImageWidgetComponent = require("./ImageWidgetComponent").default;
        return R(ImageWidgetComponent, {
            schema: options.schema,
            dataSource: options.dataSource,
            widgetDataSource: options.widgetDataSource,
            filters: options.filters,
            design: options.design,
            onDesignChange: options.onDesignChange,
            width: options.width,
            height: options.height,
            singleRowTable: options.singleRowTable
        });
    }
    // Get the data that the widget needs. This will be called on the server, typically.
    //   design: design of the chart
    //   schema: schema to use
    //   dataSource: data source to get data from
    //   filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
    //   callback: (error, data)
    getData(design, schema, dataSource, filters, callback) {
        if (!design.expr) {
            return callback(null);
        }
        const exprCleaner = new mwater_expressions_1.ExprCleaner(schema);
        const expr = exprCleaner.cleanExpr(design.expr);
        if (!expr) {
            return callback(null);
        }
        const { table } = design.expr;
        const exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
        const imageExpr = exprCompiler.compileExpr({ expr, tableAlias: "main" });
        // Get distinct to only show if single row match
        const query = {
            type: "query",
            distinct: true,
            selects: [{ type: "select", expr: imageExpr, alias: "value" }],
            from: { type: "table", table, alias: "main" },
            limit: 2
        };
        // Get relevant filters
        filters = lodash_1.default.where(filters || [], { table });
        let whereClauses = lodash_1.default.map(filters, (f) => (0, mwater_expressions_2.injectTableAlias)(f.jsonql, "main"));
        whereClauses.push({ type: "op", op: "is not null", exprs: [imageExpr] });
        whereClauses = lodash_1.default.compact(whereClauses);
        // Wrap if multiple
        if (whereClauses.length > 1) {
            query.where = { type: "op", op: "and", exprs: whereClauses };
        }
        else {
            query.where = whereClauses[0];
        }
        // Execute query
        dataSource.performQuery(query, (error, rows) => {
            if (error) {
                callback(error);
            }
            else {
                // If multiple, use null
                if (rows.length !== 1) {
                    return callback(null, null);
                }
                else {
                    // Make sure is not string
                    let { value } = rows[0];
                    if (lodash_1.default.isString(rows[0].value)) {
                        value = JSON.parse(rows[0].value);
                    }
                    callback(null, value);
                }
            }
        });
    }
    // Determine if widget is auto-height, which means that a vertical height is not required.
    isAutoHeight() {
        return false;
    }
    // Get a list of table ids that can be filtered on
    getFilterableTables(design, schema) {
        var _a;
        if ((_a = design.expr) === null || _a === void 0 ? void 0 : _a.table) {
            return [design.expr.table];
        }
        return [];
    }
}
exports.default = ImageWidget;
