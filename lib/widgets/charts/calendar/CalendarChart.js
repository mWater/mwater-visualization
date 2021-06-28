"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let CalendarChart;
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const moment_1 = __importDefault(require("moment"));
const immer_1 = __importDefault(require("immer"));
const mwater_expressions_1 = require("mwater-expressions");
const Chart_1 = __importDefault(require("../Chart"));
const mwater_expressions_2 = require("mwater-expressions");
const mwater_expressions_3 = require("mwater-expressions");
const AxisBuilder_1 = __importDefault(require("../../../axes/AxisBuilder"));
/*
Design is:
  
  table: table to use for data source
  titleText: title text
  dateAxis: date axis to use
  valueAxis: axis for value
  filter: optional logical expression to filter by

*/
exports.default = CalendarChart = class CalendarChart extends Chart_1.default {
    cleanDesign(design, schema) {
        const exprCleaner = new mwater_expressions_2.ExprCleaner(schema);
        const axisBuilder = new AxisBuilder_1.default({ schema });
        design = immer_1.default(design, (draft) => {
            // Fill in defaults
            draft.version = design.version || 1;
            // Clean axes
            draft.dateAxis = axisBuilder.cleanAxis({
                axis: design.dateAxis,
                table: design.table,
                aggrNeed: "none",
                types: ["date"]
            });
            draft.valueAxis = axisBuilder.cleanAxis({
                axis: design.valueAxis,
                table: design.table,
                aggrNeed: "required",
                types: ["number"]
            });
            // Clean filter
            draft.filter = exprCleaner.cleanExpr(design.filter, { table: design.table, types: ["boolean"] });
        });
        return design;
    }
    validateDesign(design, schema) {
        const axisBuilder = new AxisBuilder_1.default({ schema });
        // Check that has table
        if (!design.table) {
            return "Missing data source";
        }
        // Check that has axes
        let error = null;
        if (!design.dateAxis) {
            error = error || "Missing date";
        }
        if (!design.valueAxis) {
            error = error || "Missing value";
        }
        error = error || axisBuilder.validateAxis({ axis: design.dateAxis });
        error = error || axisBuilder.validateAxis({ axis: design.valueAxis });
        return error;
    }
    isEmpty(design) {
        return !design.dateAxis || !design.valueAxis;
    }
    // Creates a design element with specified options
    // options include:
    //   schema: schema to use
    //   dataSource: dataSource to use
    //   design: design
    //   onDesignChange: function
    //   filters: array of filters
    createDesignerElement(options) {
        // Require here to prevent server require problems
        const CalendarChartDesignerComponent = require("./CalendarChartDesignerComponent").default;
        const props = {
            schema: options.schema,
            design: this.cleanDesign(options.design, options.schema),
            dataSource: options.dataSource,
            filters: options.filter,
            onDesignChange: (design) => {
                // Clean design
                design = this.cleanDesign(design, options.schema);
                return options.onDesignChange(design);
            }
        };
        return react_1.default.createElement(CalendarChartDesignerComponent, props);
    }
    // Get data for the chart asynchronously
    // design: design of the chart
    // schema: schema to use
    // dataSource: data source to get data from
    // filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
    // callback: (error, data)
    getData(design, schema, dataSource, filters, callback) {
        const exprCompiler = new mwater_expressions_3.ExprCompiler(schema);
        const axisBuilder = new AxisBuilder_1.default({ schema });
        // Create shell of query
        const query = {
            type: "query",
            selects: [],
            from: exprCompiler.compileTable(design.table, "main"),
            groupBy: [1],
            orderBy: [{ ordinal: 1 }],
            limit: 5000
        };
        // Add date axis
        const dateExpr = axisBuilder.compileAxis({ axis: design.dateAxis, tableAlias: "main" });
        query.selects.push({
            type: "select",
            expr: dateExpr,
            alias: "date"
        });
        // Add value axis
        query.selects.push({
            type: "select",
            expr: axisBuilder.compileAxis({ axis: design.valueAxis, tableAlias: "main" }),
            alias: "value"
        });
        // Get relevant filters
        filters = lodash_1.default.where(filters || [], { table: design.table });
        let whereClauses = lodash_1.default.map(filters, (f) => mwater_expressions_1.injectTableAlias(f.jsonql, "main"));
        // Compile filter
        if (design.filter) {
            whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "main" }));
        }
        // Add null filter for date
        whereClauses.push({ type: "op", op: "is not null", exprs: [dateExpr] });
        whereClauses = lodash_1.default.compact(whereClauses);
        // Wrap if multiple
        if (whereClauses.length > 1) {
            query.where = { type: "op", op: "and", exprs: whereClauses };
        }
        else {
            query.where = whereClauses[0];
        }
        return dataSource.performQuery(query, callback);
    }
    // Create a view element for the chart
    // Options include:
    //   schema: schema to use
    //   dataSource: dataSource to use
    //   design: design of the chart
    //   data: results from queries
    //   width, height: size of the chart view
    //   scope: current scope of the view element
    //   onScopeChange: called when scope changes with new scope
    createViewElement(options) {
        // Require here to prevent server require problems
        const CalendarChartViewComponent = require("./CalendarChartViewComponent").default;
        // Create chart
        const props = {
            schema: options.schema,
            design: this.cleanDesign(options.design, options.schema),
            data: options.data,
            width: options.width,
            height: options.height,
            scope: options.scope,
            onScopeChange: options.onScopeChange,
            cellStrokeColor: "#DDD"
        };
        return react_1.default.createElement(CalendarChartViewComponent, props);
    }
    createDataTable(design, schema, dataSource, data) {
        const header = ["Date", "Value"];
        const rows = lodash_1.default.map(data, (row) => [moment_1.default(row.date).format("YYYY-MM-DD"), row.value]);
        return [header].concat(rows);
    }
    // Get a list of table ids that can be filtered on
    getFilterableTables(design, schema) {
        return lodash_1.default.compact([design.table]);
    }
    // Get the chart placeholder icon. fa-XYZ or glyphicon-XYZ
    getPlaceholderIcon() {
        return "fa-calendar";
    }
};
