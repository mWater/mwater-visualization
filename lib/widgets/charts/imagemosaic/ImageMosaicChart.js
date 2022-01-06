"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
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
  imageAxis: image axis to use
  filter: optional logical expression to filter by

*/
class ImageMosaicChart extends Chart_1.default {
    cleanDesign(design, schema) {
        const exprCleaner = new mwater_expressions_2.ExprCleaner(schema);
        const axisBuilder = new AxisBuilder_1.default({ schema });
        design = immer_1.default(design, (draft) => {
            // Fill in defaults
            draft.version = design.version || 1;
            // Clean axis
            draft.imageAxis = axisBuilder.cleanAxis({
                axis: design.imageAxis,
                table: design.table,
                aggrNeed: "none",
                types: ["image", "imagelist"]
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
        if (!design.imageAxis) {
            error = error || "Missing image";
        }
        error = error || axisBuilder.validateAxis({ axis: design.imageAxis });
        return error;
    }
    isEmpty(design) {
        return !design.imageAxis;
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
        const ImageMosaicChartDesignerComponent = require("./ImageMosaicChartDesignerComponent").default;
        const props = {
            schema: options.schema,
            design: this.cleanDesign(options.design, options.schema),
            dataSource: options.dataSource,
            filters: options.filters,
            onDesignChange: (design) => {
                // Clean design
                design = this.cleanDesign(design, options.schema);
                return options.onDesignChange(design);
            }
        };
        return react_1.default.createElement(ImageMosaicChartDesignerComponent, props);
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
            limit: 500
        };
        // Add image axis
        const imageExpr = axisBuilder.compileAxis({ axis: design.imageAxis, tableAlias: "main" });
        query.selects.push({
            type: "select",
            expr: imageExpr,
            alias: "image"
        });
        // Add primary key
        query.selects.push({
            type: "select",
            expr: { type: "field", tableAlias: "main", column: schema.getTable(design.table).primaryKey },
            alias: "id"
        });
        // Get relevant filters
        filters = lodash_1.default.where(filters || [], { table: design.table });
        let whereClauses = lodash_1.default.map(filters, (f) => mwater_expressions_1.injectTableAlias(f.jsonql, "main"));
        // Compile filter
        if (design.filter) {
            whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "main" }));
        }
        // Add null filter for image
        whereClauses.push({ type: "op", op: "is not null", exprs: [imageExpr] });
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
    //   onRowClick: Called with (tableId, rowId) when item is clicked
    createViewElement(options) {
        // Require here to prevent server require problems
        const ImageMosaicChartViewComponent = require("./ImageMosaicChartViewComponent").default;
        // Create chart
        const props = {
            schema: options.schema,
            design: this.cleanDesign(options.design, options.schema),
            data: options.data,
            dataSource: options.dataSource,
            width: options.width,
            height: options.height,
            scope: options.scope,
            onScopeChange: options.onScopeChange,
            onRowClick: options.onRowClick
        };
        return react_1.default.createElement(ImageMosaicChartViewComponent, props);
    }
    createDataTable(design, schema, dataSource, data) {
        alert("Not available for Image Mosaics");
        return null;
    }
    // TODO
    // renderHeaderCell = (column) =>
    //   column.headerText or @axisBuilder.summarizeAxis(column.textAxis)
    // header = _.map(design.columns, renderHeaderCell)
    // table = [header]
    // renderRow = (record) =>
    //   renderCell = (column, columnIndex) =>
    //     value = record["c#{columnIndex}"]
    //     return @axisBuilder.formatValue(column.textAxis, value)
    //   return _.map(design.columns, renderCell)
    // table = table.concat(_.map(data.main, renderRow))
    // return table
    // Get a list of table ids that can be filtered on
    getFilterableTables(design, schema) {
        return lodash_1.default.compact([design.table]);
    }
    // Get the chart placeholder icon. fa-XYZ or glyphicon-XYZ
    getPlaceholderIcon() {
        return "fa-th";
    }
}
exports.default = ImageMosaicChart;
