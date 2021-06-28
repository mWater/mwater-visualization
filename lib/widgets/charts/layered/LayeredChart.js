"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let LayeredChart;
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const async_1 = __importDefault(require("async"));
const immer_1 = __importDefault(require("immer"));
const immer_2 = require("immer");
const Chart_1 = __importDefault(require("../Chart"));
const LayeredChartCompiler_1 = __importDefault(require("./LayeredChartCompiler"));
const mwater_expressions_1 = require("mwater-expressions");
const AxisBuilder_1 = __importDefault(require("../../../axes/AxisBuilder"));
const LayeredChartSvgFileSaver_1 = __importDefault(require("./LayeredChartSvgFileSaver"));
const LayeredChartUtils = __importStar(require("./LayeredChartUtils"));
const TextWidget_1 = __importDefault(require("../../text/TextWidget"));
// See LayeredChart Design.md for the design
exports.default = LayeredChart = class LayeredChart extends Chart_1.default {
    cleanDesign(design, schema) {
        const exprCleaner = new mwater_expressions_1.ExprCleaner(schema);
        const axisBuilder = new AxisBuilder_1.default({ schema });
        const compiler = new LayeredChartCompiler_1.default({ schema });
        const layers = design.layers || [{}];
        return immer_1.default(design, (draft) => {
            // Fill in defaults
            draft.version = design.version || 2;
            draft.layers = layers;
            // Default to titleText (legacy)
            draft.header = design.header || { style: "header", items: lodash_1.default.compact([design.titleText || null]) };
            draft.footer = design.footer || { style: "footer", items: [] };
            // Default value is now ""
            if (draft.version < 2) {
                if (design.xAxisLabelText == null) {
                    draft.xAxisLabelText = "";
                }
                if (design.yAxisLabelText == null) {
                    draft.yAxisLabelText = "";
                }
                draft.version = 2;
            }
            // Clean each layer
            for (let layerId = 0, end = layers.length, asc = 0 <= end; asc ? layerId < end : layerId > end; asc ? layerId++ : layerId--) {
                const layer = draft.layers[layerId];
                layer.axes = layer.axes || {};
                for (let axisKey in layer.axes) {
                    // Determine what aggregation axis requires
                    var aggrNeed;
                    const axis = layer.axes[axisKey];
                    if (axisKey === "y" && compiler.doesLayerNeedGrouping(draft, layerId)) {
                        aggrNeed = "required";
                    }
                    else {
                        aggrNeed = "none";
                    }
                    layer.axes[axisKey] = axisBuilder.cleanAxis({
                        axis: axis ? immer_2.original(axis) : null,
                        table: layer.table,
                        aggrNeed,
                        types: LayeredChartUtils.getAxisTypes(draft, layer, axisKey)
                    });
                }
                // Remove x axis if not required
                if (!compiler.canLayerUseXExpr(draft, layerId) && layer.axes.x) {
                    delete layer.axes.x;
                }
                // Remove cumulative if x is not date or number
                if (!layer.axes.x || !axisBuilder.doesAxisSupportCumulative(layer.axes.x)) {
                    delete layer.cumulative;
                }
                layer.filter = exprCleaner.cleanExpr(layer.filter ? immer_2.original(layer.filter) : null, {
                    table: layer.table,
                    types: ["boolean"]
                });
                // No trendline if cumulative, or if has color axis
                if (layer.trendline && (layer.cumulative || layer.axes.color)) {
                    delete layer.trendline;
                }
            }
        });
    }
    validateDesign(design, schema) {
        let error;
        let axisBuilder = new AxisBuilder_1.default({ schema });
        const compiler = new LayeredChartCompiler_1.default({ schema });
        // Check that layers have same x axis type
        const xAxisTypes = lodash_1.default.uniq(lodash_1.default.map(design.layers, (l) => {
            axisBuilder = new AxisBuilder_1.default({ schema });
            return axisBuilder.getAxisType(l.axes.x);
        }));
        if (xAxisTypes.length > 1) {
            return "All x axes must be of same type";
        }
        for (let layerId = 0, end = design.layers.length, asc = 0 <= end; asc ? layerId < end : layerId > end; asc ? layerId++ : layerId--) {
            const layer = design.layers[layerId];
            // Check that has table
            if (!layer.table) {
                return "Missing data source";
            }
            // Check that has y axis
            if (!layer.axes.y) {
                return "Missing Y Axis";
            }
            if (!layer.axes.x && compiler.isXAxisRequired(design, layerId)) {
                return "Missing X Axis";
            }
            if (!layer.axes.color && compiler.isColorAxisRequired(design, layerId)) {
                return "Missing Color Axis";
            }
            error = null;
            // Validate axes
            error = error || axisBuilder.validateAxis({ axis: layer.axes.x });
            error = error || axisBuilder.validateAxis({ axis: layer.axes.y });
            error = error || axisBuilder.validateAxis({ axis: layer.axes.color });
        }
        return error;
    }
    isEmpty(design) {
        return !design.layers || !design.layers[0] || !design.layers[0].table;
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
        const LayeredChartDesignerComponent = require("./LayeredChartDesignerComponent").default;
        const props = {
            schema: options.schema,
            dataSource: options.dataSource,
            design: this.cleanDesign(options.design, options.schema),
            filters: options.filters,
            onDesignChange: (design) => {
                // Clean design
                design = this.cleanDesign(design, options.schema);
                return options.onDesignChange(design);
            }
        };
        return react_1.default.createElement(LayeredChartDesignerComponent, props);
    }
    // Get data for the chart asynchronously
    // design: design of the chart
    // schema: schema to use
    // dataSource: data source to get data from
    // filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
    // callback: (error, data)
    getData(design, schema, dataSource, filters, callback) {
        const compiler = new LayeredChartCompiler_1.default({ schema });
        const queries = compiler.createQueries(design, filters);
        // Run queries in parallel
        return async_1.default.map(lodash_1.default.pairs(queries), (item, cb) => {
            return dataSource.performQuery(item[1], (err, rows) => {
                return cb(err, [item[0], rows]);
            });
        }, (err, items) => {
            if (err) {
                return callback(err);
            }
            const data = lodash_1.default.object(items);
            // Add header and footer data
            const textWidget = new TextWidget_1.default();
            return textWidget.getData(design.header, schema, dataSource, filters, (error, headerData) => {
                if (error) {
                    return callback(error);
                }
                data.header = headerData;
                return textWidget.getData(design.footer, schema, dataSource, filters, (error, footerData) => {
                    if (error) {
                        return callback(error);
                    }
                    data.footer = footerData;
                    return callback(null, data);
                });
            });
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
    createViewElement(options) {
        const LayeredChartViewComponent = require("./LayeredChartViewComponent").default;
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
            onScopeChange: options.onScopeChange
        };
        return react_1.default.createElement(LayeredChartViewComponent, props);
    }
    createDropdownItems(design, schema, widgetDataSource, filters) {
        // TODO validate design before allowing save
        const save = (format) => {
            design = this.cleanDesign(design, schema);
            return widgetDataSource.getData(design, filters, (err, data) => {
                if (err) {
                    return alert("Unable to load data");
                }
                else {
                    return LayeredChartSvgFileSaver_1.default.save(design, data, schema, format);
                }
            });
        };
        // Don't save image of invalid design
        if (this.validateDesign(this.cleanDesign(design, schema), schema)) {
            return [];
        }
        return [
            { label: "Save as SVG", icon: "picture", onClick: save.bind(null, "svg") },
            { label: "Save as PNG", icon: "camera", onClick: save.bind(null, "png") }
        ];
    }
    createDataTable(design, schema, dataSource, data, locale) {
        let table;
        const axisBuilder = new AxisBuilder_1.default({ schema });
        // Export only first layer
        const headers = [];
        // for layer, data of
        let xAdded = false;
        for (let layer of design.layers) {
            if (layer.axes.x && !xAdded) {
                headers.push(axisBuilder.summarizeAxis(layer.axes.x, locale));
                xAdded = true;
            }
            if (layer.axes.color) {
                headers.push(axisBuilder.summarizeAxis(layer.axes.color, locale));
            }
            if (layer.axes.y) {
                headers.push(axisBuilder.summarizeAxis(layer.axes.y, locale));
            }
            table = [headers];
        }
        let k = 0;
        for (let row of data.layer0) {
            const r = [];
            xAdded = false;
            for (let j = 0, end = design.layers.length - 1, asc = 0 <= end; asc ? j <= end : j >= end; asc ? j++ : j--) {
                const _row = data[`layer${j}`][k];
                if (design.layers[j].axes.x && !xAdded) {
                    r.push(axisBuilder.formatValue(design.layers[j].axes.x, _row.x, locale));
                    xAdded = true;
                }
                if (design.layers[j].axes.color) {
                    r.push(axisBuilder.formatValue(design.layers[j].axes.color, _row.color, locale));
                }
                if (design.layers[j].axes.y) {
                    r.push(axisBuilder.formatValue(design.layers[j].axes.y, _row.y, locale));
                }
            }
            k++;
            table.push(r);
        }
        // k = 0
        // for layer, layerData of data
        //   xAdded = false
        //   r = []
        //   for row in layerData
        //     if design.layers[k].axes.x and not xAdded
        //       r.push(axisBuilder.formatValue(design.layers[k].axes.x, row.x, locale))
        //       xAdded = true
        //     if design.layers[k].axes.color
        //       r.push(axisBuilder.formatValue(design.layers[k].axes.color, row.color, locale))
        //     if design.layers[k].axes.y
        //       r.push(axisBuilder.formatValue(design.layers[k].axes.y, row.y, locale))
        //   table.push(r)
        //   k++
        return table;
    }
    //   if data.length > 0
    //   fields = Object.getOwnPropertyNames(data[0])
    //   table = [fields] # header
    //   renderRow = (record) ->
    //      _.map(fields, (field) -> record[field])
    //   table.concat(_.map(data, renderRow))
    // else []
    // Get a list of table ids that can be filtered on
    getFilterableTables(design, schema) {
        let filterableTables = lodash_1.default.uniq(lodash_1.default.compact(lodash_1.default.map(design.layers, (layer) => layer.table)));
        // Get filterable tables from header and footer
        const textWidget = new TextWidget_1.default();
        filterableTables = lodash_1.default.union(filterableTables, textWidget.getFilterableTables(design.header, schema));
        filterableTables = lodash_1.default.union(filterableTables, textWidget.getFilterableTables(design.footer, schema));
        return filterableTables;
    }
    // Get the chart placeholder icon. fa-XYZ or glyphicon-XYZ
    getPlaceholderIcon() {
        return "fa-bar-chart";
    }
};
