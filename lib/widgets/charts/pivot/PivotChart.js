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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const uuid_1 = __importDefault(require("uuid"));
const immer_1 = __importDefault(require("immer"));
const immer_2 = require("immer");
const mwater_expressions_1 = require("mwater-expressions");
const Chart_1 = __importDefault(require("../Chart"));
const mwater_expressions_2 = require("mwater-expressions");
const AxisBuilder_1 = __importDefault(require("../../../axes/AxisBuilder"));
const TextWidget_1 = __importDefault(require("../../text/TextWidget"));
const PivotChartUtils = __importStar(require("./PivotChartUtils"));
const PivotChartQueryBuilder_1 = __importDefault(require("./PivotChartQueryBuilder"));
const PivotChartLayoutBuilder_1 = __importDefault(require("./PivotChartLayoutBuilder"));
// Store true as a weakly cached value if a design is already clean
const cleanDesignCache = new mwater_expressions_1.WeakCache();
class PivotChart extends Chart_1.default {
    cleanDesign(design, schema) {
        const exprCleaner = new mwater_expressions_2.ExprCleaner(schema);
        const axisBuilder = new AxisBuilder_1.default({ schema });
        // Use weak caching to improve performance of cleaning complex pivot charts
        if (cleanDesignCache.get([design, schema], []) === true) {
            return design;
        }
        const cleanedDesign = (0, immer_1.default)(design, (draft) => {
            var _a;
            // Fill in defaults
            draft.version = design.version || 1;
            draft.rows = design.rows || [];
            draft.columns = design.columns || [];
            draft.intersections = design.intersections || {};
            draft.header = design.header || { style: "footer", items: [] };
            draft.footer = design.footer || { style: "footer", items: [] };
            if (design.table) {
                // Add default row and column
                let intersectionId, segment;
                if (draft.rows.length === 0) {
                    draft.rows.push({ id: (0, uuid_1.default)() });
                }
                if (draft.columns.length === 0) {
                    draft.columns.push({ id: (0, uuid_1.default)() });
                }
                // Cleans a single segment
                const cleanSegment = (segment) => {
                    if (segment.valueAxis) {
                        segment.valueAxis = axisBuilder.cleanAxis({
                            axis: segment.valueAxis ? (0, immer_2.original)(segment.valueAxis) : null,
                            table: design.table,
                            aggrNeed: "none",
                            types: ["enum", "enumset", "text", "boolean", "date"]
                        });
                    }
                    // Remove valueLabelBold if no valueAxis
                    if (!segment.valueAxis) {
                        delete segment.valueLabelBold;
                    }
                    if (segment.filter) {
                        segment.filter = exprCleaner.cleanExpr(segment.filter ? (0, immer_2.original)(segment.filter) : null, {
                            table: design.table,
                            types: ["boolean"]
                        });
                    }
                    if (segment.orderExpr) {
                        segment.orderExpr = exprCleaner.cleanExpr(segment.orderExpr ? (0, immer_2.original)(segment.orderExpr) : null, {
                            table: design.table,
                            aggrStatuses: ["aggregate"],
                            types: ["enum", "text", "boolean", "date", "datetime", "number"]
                        });
                    }
                };
                // Clean all segments
                for (segment of PivotChartUtils.getAllSegments(draft.rows)) {
                    cleanSegment(segment);
                }
                for (segment of PivotChartUtils.getAllSegments(draft.columns)) {
                    cleanSegment(segment);
                }
                // Clean all intersections
                for (intersectionId in draft.intersections) {
                    const intersection = draft.intersections[intersectionId];
                    if (intersection.valueAxis) {
                        intersection.valueAxis = axisBuilder.cleanAxis({
                            axis: intersection.valueAxis ? (0, immer_2.original)(intersection.valueAxis) : null,
                            table: design.table,
                            aggrNeed: "required",
                            types: ["enum", "text", "boolean", "date", "number"]
                        });
                    }
                    if (intersection.backgroundColorAxis) {
                        intersection.backgroundColorAxis = axisBuilder.cleanAxis({
                            axis: intersection.backgroundColorAxis ? (0, immer_2.original)(intersection.backgroundColorAxis) : null,
                            table: design.table,
                            aggrNeed: "required",
                            types: ["enum", "text", "boolean", "date"]
                        });
                        if (intersection.backgroundColorOpacity == null) {
                            intersection.backgroundColorOpacity = 1;
                        }
                    }
                    for (const colorCondition of intersection.backgroundColorConditions || []) {
                        colorCondition.condition = exprCleaner.cleanExpr(colorCondition.condition ? (0, immer_2.original)(colorCondition.condition) : null, {
                            table: design.table,
                            types: ["boolean"],
                            aggrStatuses: ["aggregate", "literal"]
                        });
                    }
                    if (intersection.filter) {
                        intersection.filter = exprCleaner.cleanExpr(intersection.filter ? (0, immer_2.original)(intersection.filter) : null, {
                            table: design.table,
                            types: ["boolean"]
                        });
                    }
                }
                // Get all intersection ids
                const allIntersectionIds = [];
                for (let rowPath of PivotChartUtils.getSegmentPaths(design.rows || [])) {
                    for (let columnPath of PivotChartUtils.getSegmentPaths(design.columns || [])) {
                        allIntersectionIds.push(PivotChartUtils.getIntersectionId(rowPath, columnPath));
                    }
                }
                // Add missing intersections
                for (intersectionId of lodash_1.default.difference(allIntersectionIds, lodash_1.default.keys(design.intersections || {}))) {
                    draft.intersections[intersectionId] = {};
                }
                // Remove extra intersections
                for (intersectionId of lodash_1.default.difference(lodash_1.default.keys(design.intersections || {}), allIntersectionIds)) {
                    delete draft.intersections[intersectionId];
                }
                // Clean filter
                draft.filter = exprCleaner.cleanExpr((_a = design.filter) !== null && _a !== void 0 ? _a : null, { table: design.table, types: ["boolean"] });
            }
        });
        // Cache if unchanged (and therefore clean)
        if (design === cleanedDesign) {
            cleanDesignCache.set([design, schema], [], true);
        }
        return cleanedDesign;
    }
    validateDesign(design, schema) {
        let segment;
        const axisBuilder = new AxisBuilder_1.default({ schema });
        // Check that has table
        if (!design.table || !schema.getTable(design.table)) {
            return "Missing data source";
        }
        // Check that has rows
        if (design.rows.length === 0) {
            return "Missing rows";
        }
        // Check that has columns
        if (design.columns.length === 0) {
            return "Missing columns";
        }
        let error = null;
        // Validate axes
        for (segment of PivotChartUtils.getAllSegments(design.rows)) {
            if (segment.valueAxis) {
                error = error || axisBuilder.validateAxis({ axis: segment.valueAxis });
            }
        }
        for (segment of PivotChartUtils.getAllSegments(design.columns)) {
            if (segment.valueAxis) {
                error = error || axisBuilder.validateAxis({ axis: segment.valueAxis });
            }
        }
        for (let intersectionId in design.intersections) {
            const intersection = design.intersections[intersectionId];
            if (intersection.valueAxis) {
                error = error || axisBuilder.validateAxis({ axis: intersection.valueAxis });
            }
        }
        return error;
    }
    // Determine if widget is auto-height, which means that a vertical height is not required.
    isAutoHeight() {
        return false;
    }
    isEmpty(design) {
        return !design.table || design.rows.length === 0 || design.columns.length === 0;
    }
    // True if designer should have a preview pane to the left
    hasDesignerPreview() {
        return false;
    }
    // Label for the edit gear dropdown
    getEditLabel() {
        return "Configure Table";
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
        const PivotChartDesignerComponent = require("./PivotChartDesignerComponent").default;
        const props = {
            schema: options.schema,
            dataSource: options.dataSource,
            design: this.cleanDesign(options.design, options.schema),
            filters: options.filter,
            onDesignChange: (design) => {
                // Clean design
                design = this.cleanDesign(design, options.schema);
                return options.onDesignChange(design);
            }
        };
        return react_1.default.createElement(PivotChartDesignerComponent, props);
    }
    /**
     * Get data for the chart asynchronously.
     *
     * @param design - Design of the chart.
     * @param schema - Schema to use.
     * @param dataSource - Data source to get data from.
     * @param filters - Array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }.
     * @param callback - Callback function to handle the result or error.
     */
    getData(design, schema, dataSource, filters, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const queryBuilder = new PivotChartQueryBuilder_1.default({ schema });
                const queries = queryBuilder.createQueries(design, filters);
                // Get a list of intersection ids
                const intersectionIds = Object.keys(queries);
                // Get a list of all queries
                const queriesList = intersectionIds.map(intersectionId => queries[intersectionId]);
                // Run queries in parallel
                const results = yield Promise.all(queriesList.map((query) => {
                    return dataSource.performQuery(query);
                }));
                const data = {};
                // Add results to data
                for (let i = 0; i < queriesList.length; i++) {
                    data[intersectionIds[i]] = results[i];
                }
                // Add header and footer data
                const textWidget = new TextWidget_1.default();
                data.header = yield new Promise((resolve, reject) => {
                    textWidget.getData(design.header, schema, dataSource, filters, (error, headerData) => {
                        if (error) {
                            reject(error);
                        }
                        else {
                            resolve(headerData);
                        }
                    });
                });
                data.footer = yield new Promise((resolve, reject) => {
                    textWidget.getData(design.footer, schema, dataSource, filters, (error, footerData) => {
                        if (error) {
                            reject(error);
                        }
                        else {
                            resolve(footerData);
                        }
                    });
                });
                callback(null, data);
            }
            catch (error) {
                callback(error);
            }
        });
    }
    // Create a view element for the chart
    // Options include:
    //   schema: schema to use
    //   dataSource: dataSource to use
    //   design: design of the chart
    //   onDesignChange: when design changes
    //   data: results from queries
    //   width, height: size of the chart view
    //   scope: current scope of the view element
    //   onScopeChange: called when scope changes with new scope
    //   filters: array of filters
    createViewElement(options) {
        const PivotChartViewComponent = require("./PivotChartViewComponent").default;
        // Create chart
        const props = {
            schema: options.schema,
            dataSource: options.dataSource,
            design: this.cleanDesign(options.design, options.schema),
            onDesignChange: options.onDesignChange,
            data: options.data,
            width: options.width,
            height: options.height,
            scope: options.scope,
            onScopeChange: options.onScopeChange,
            filters: options.filters
        };
        return react_1.default.createElement(PivotChartViewComponent, props);
    }
    createDropdownItems(design, schema, widgetDataSource, filters) {
        return [];
    }
    createDataTable(design, schema, dataSource, data, locale) {
        // Create layout
        const layout = new PivotChartLayoutBuilder_1.default({ schema }).buildLayout(design, data, locale);
        return lodash_1.default.map(layout.rows, (row) => lodash_1.default.map(row.cells, (cell) => cell.text));
    }
    // Get a list of table ids that can be filtered on
    getFilterableTables(design, schema) {
        let filterableTables = design.table ? [design.table] : [];
        // Get filterable tables from header and footer
        const textWidget = new TextWidget_1.default();
        filterableTables = lodash_1.default.union(filterableTables, textWidget.getFilterableTables(design.header, schema));
        filterableTables = lodash_1.default.union(filterableTables, textWidget.getFilterableTables(design.footer, schema));
        return filterableTables;
    }
    // Get the chart placeholder icon. fa-XYZ or glyphicon-XYZ
    getPlaceholderIcon() {
        return "fa-magic";
    }
}
exports.default = PivotChart;
