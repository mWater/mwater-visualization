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
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_2 = require("mwater-expressions");
const AxisBuilder_1 = __importDefault(require("../../../axes/AxisBuilder"));
const mwater_expressions_3 = require("mwater-expressions");
const d3Format = __importStar(require("d3-format"));
const commaFormatter = d3Format.format(",");
const compactFormatter = d3Format.format(".4");
function pieLabelValueFormatter(format, hidePercent = false) {
    function percent(ratio) {
        if (hidePercent) {
            return "";
        }
        else {
            return `(${d3Format.format(".1%")(ratio)})`;
        }
    }
    return function (value, ratio, id) {
        if (format[id]) {
            return `${format[id](value)} ${percent(ratio)}`;
        }
        else {
            return `${d3Format.format(",")(value)} ${percent(ratio)}`;
        }
    };
}
function labelValueFormatter(format) {
    return function (value, ratio, id) {
        if (format[id]) {
            return format[id](value);
        }
        else {
            return value;
        }
    };
}
const defaultColors = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
    "#aec7e8",
    "#ffbb78",
    "#98df8a",
    "#ff9896",
    "#c5b0d5",
    "#c49c94",
    "#f7b6d2",
    "#c7c7c7",
    "#dbdb8d",
    "#9edae5"
];
// Compiles various parts of a layered chart (line, bar, scatter, spline, area) to C3.js format
class LayeredChartCompiler {
    // Pass in schema
    constructor(options) {
        this.schema = options.schema;
        this.exprUtils = new mwater_expressions_2.ExprUtils(this.schema);
        this.axisBuilder = new AxisBuilder_1.default({ schema: this.schema });
    }
    // Create the queries needed for the chart.
    // extraFilters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. }
    createQueries(design, extraFilters) {
        const exprCompiler = new mwater_expressions_1.ExprCompiler(this.schema);
        const queries = {};
        // For each layer
        for (let layerIndex = 0, end = design.layers.length, asc = 0 <= end; asc ? layerIndex < end : layerIndex > end; asc ? layerIndex++ : layerIndex--) {
            const layer = design.layers[layerIndex];
            // Limit depends on layer type
            let limit = 1000;
            if (layer.type === "scatter" || design.type === "scatter") {
                limit = 10000; // More possible for scatter chart
            }
            // Create shell of query
            const query = {
                type: "query",
                selects: [],
                from: exprCompiler.compileTable(layer.table, "main"),
                limit,
                groupBy: [],
                orderBy: []
            };
            if (layer.axes.x) {
                query.selects.push({
                    type: "select",
                    expr: this.axisBuilder.compileAxis({ axis: layer.axes.x, tableAlias: "main" }),
                    alias: "x"
                });
            }
            if (layer.axes.color) {
                query.selects.push({
                    type: "select",
                    expr: this.axisBuilder.compileAxis({ axis: layer.axes.color, tableAlias: "main" }),
                    alias: "color"
                });
            }
            if (layer.axes.y) {
                query.selects.push({
                    type: "select",
                    expr: this.axisBuilder.compileAxis({ axis: layer.axes.y, tableAlias: "main" }),
                    alias: "y"
                });
            }
            // Sort by x and color
            if (layer.axes.x || layer.axes.color) {
                query.orderBy.push({ ordinal: 1 });
            }
            if (layer.axes.x && layer.axes.color) {
                query.orderBy.push({ ordinal: 2 });
            }
            // If grouping type
            if (this.doesLayerNeedGrouping(design, layerIndex)) {
                if (layer.axes.x || layer.axes.color) {
                    query.groupBy.push(1);
                }
                if (layer.axes.x && layer.axes.color) {
                    query.groupBy.push(2);
                }
            }
            // Add where
            let whereClauses = [];
            if (layer.filter) {
                whereClauses.push(this.compileExpr(layer.filter));
            }
            // Add filters
            if (extraFilters && extraFilters.length > 0) {
                // Get relevant filters
                const relevantFilters = lodash_1.default.where(extraFilters, { table: layer.table });
                // If any, create and
                if (relevantFilters.length > 0) {
                    // Add others
                    for (let filter of relevantFilters) {
                        whereClauses.push(mwater_expressions_3.injectTableAlias(filter.jsonql, "main"));
                    }
                }
            }
            // Wrap if multiple
            whereClauses = lodash_1.default.compact(whereClauses);
            if (whereClauses.length > 1) {
                query.where = { type: "op", op: "and", exprs: whereClauses };
            }
            else {
                query.where = whereClauses[0];
            }
            queries[`layer${layerIndex}`] = query;
        }
        return queries;
    }
    // Create data map of "{layer name}" or "{layer name}:{index}" to { layerIndex, row }
    createDataMap(design, data) {
        return this.compileData(design, data).dataMap;
    }
    // Create the chartOptions to pass to c3.generate
    // options is
    //   design: chart design element
    //   data: chart data
    //   width: chart width
    //   height: chart height
    //   locale: locale to use
    createChartOptions(options) {
        const c3Data = this.compileData(options.design, options.data, options.locale);
        // Pick first format to use as the tick formatter
        let tickFormatter = lodash_1.default.keys(c3Data.format).length > 0 ? c3Data.format[lodash_1.default.keys(c3Data.format)[0]] : commaFormatter;
        if (options.design.transpose) {
            tickFormatter = compactFormatter;
        }
        // Create chart
        // NOTE: this structure must be comparable with _.isEqual, so don't add any inline functiona
        const chartDesign = {
            data: {
                types: c3Data.types,
                columns: c3Data.columns,
                names: c3Data.names,
                types: c3Data.types,
                groups: c3Data.groups,
                xs: c3Data.xs,
                colors: c3Data.colors,
                labels: options.design.labels,
                order: c3Data.order,
                color: c3Data.color,
                classes: c3Data.classes
            },
            // Hide if one layer with no color axis
            legend: {
                hide: options.design.layers.length === 1 && !options.design.layers[0].axes.color ? true : c3Data.legendHide
            },
            grid: { focus: { show: false } },
            axis: {
                x: {
                    type: c3Data.xAxisType,
                    label: {
                        text: cleanString(c3Data.xAxisLabelText),
                        position: options.design.transpose ? "outer-middle" : "outer-center"
                    },
                    tick: { fit: c3Data.xAxisTickFit }
                },
                y: {
                    label: {
                        text: cleanString(c3Data.yAxisLabelText),
                        position: options.design.transpose ? "outer-center" : "outer-middle"
                    },
                    // Set max to 100 if proportional (with no padding)
                    max: options.design.type === "bar" && options.design.proportional ? 100 : options.design.yMax,
                    min: options.design.type === "bar" && options.design.proportional ? 0 : options.design.yMin,
                    padding: options.design.type === "bar" && options.design.proportional
                        ? { top: 0, bottom: 0 }
                        : {
                            top: options.design.yMax != null ? 0 : undefined,
                            bottom: options.design.yMin != null ? 0 : undefined
                        },
                    tick: {
                        format: tickFormatter
                    }
                },
                rotated: options.design.transpose
            },
            size: { width: options.width, height: options.height },
            pie: {
                label: {
                    show: !options.design.hidePercentage || !!options.design.labels,
                    format: options.design.labels
                        ? pieLabelValueFormatter(c3Data.format, options.design.hidePercentage)
                        : undefined
                },
                expand: false // Don't expand/contract
            },
            donut: {
                label: {
                    show: !options.design.hidePercentage || !!options.design.labels,
                    format: options.design.labels
                        ? pieLabelValueFormatter(c3Data.format, options.design.hidePercentage)
                        : undefined
                },
                expand: false // Don't expand/contract
            },
            transition: { duration: 0 } // Transitions interfere with scoping
        };
        if (options.design.labels) {
            if (options.design.type === "pie" || options.design.type === "donut") {
                chartDesign.tooltip = {
                    format: {
                        value: pieLabelValueFormatter(c3Data.format)
                    }
                };
            }
            else {
                if (!lodash_1.default.isEmpty(c3Data.format)) {
                    chartDesign.tooltip = {
                        format: {
                            value: labelValueFormatter(c3Data.format)
                        }
                    };
                }
            }
        }
        if (options.design.labels && !lodash_1.default.isEmpty(c3Data.format)) {
            // format = _.map options.design.layers, (layer, layerIndex) =>
            //   return if c3Data.format[layerIndex] then c3Data.format[layerIndex] else true
            chartDesign.data.labels = { format: c3Data.format };
        }
        if (options.design.yThresholds) {
            chartDesign.grid.y = {
                lines: lodash_1.default.map(options.design.yThresholds, (t) => ({
                    value: t.value,
                    text: t.label
                }))
            };
        }
        // This doesn't work in new C3. Removing.
        // # If x axis is year only, display year in ticks
        // if options.design.layers[0]?.axes.x?.xform?.type == "year"
        //   chartDesign.axis.x.tick.format = (x) -> if _.isDate(x) then x.getFullYear() else x
        console.log(chartDesign);
        return chartDesign;
    }
    isCategoricalX(design) {
        // Check if categorical x axis (bar charts always are)
        let categoricalX = design.type === "bar" || lodash_1.default.any(design.layers, (l) => l.type === "bar");
        // Check if x axis is categorical type
        const xType = this.axisBuilder.getAxisType(design.layers[0].axes.x);
        if (["enum", "text", "boolean"].includes(xType)) {
            categoricalX = true;
        }
        // Dates that are stacked must be categorical to make stacking work in C3
        if (xType === "date" && design.stacked) {
            categoricalX = true;
        }
        return categoricalX;
    }
    // Compiles data part of C3 chart, including data map back to original data
    // Outputs: columns, types, names, colors. Also dataMap which is a map of "layername:index" to { layerIndex, row }
    compileData(design, data, locale) {
        // If polar chart (no x axis)
        if (["pie", "donut"].includes(design.type) || lodash_1.default.any(design.layers, (l) => ["pie", "donut"].includes(l.type))) {
            return this.compileDataPolar(design, data, locale);
        }
        if (this.isCategoricalX(design)) {
            return this.compileDataCategorical(design, data, locale);
        }
        else {
            return this.compileDataNonCategorical(design, data, locale);
        }
    }
    // Compiles data for a polar chart (pie/donut) with no x axis
    compileDataPolar(design, data, locale) {
        let order;
        const columns = [];
        const types = {};
        const names = {};
        const dataMap = {};
        const colors = {};
        const format = {};
        // For each layer
        lodash_1.default.each(design.layers, (layer, layerIndex) => {
            // If has color axis
            if (layer.axes.color) {
                let layerData = data[`layer${layerIndex}`];
                // Categories will be in form [{ value, label }]
                const categories = this.axisBuilder.getCategories(layer.axes.color, lodash_1.default.pluck(layerData, "color"), locale);
                // Get indexed ordering of categories (lookup from value to index) without removing excluded values
                const categoryOrder = lodash_1.default.zipObject(lodash_1.default.map(categories, (c, i) => [c.value, i]));
                // Sort by category order
                layerData = lodash_1.default.sortBy(layerData, (row) => categoryOrder[row.color]);
                // Create a series for each row
                return lodash_1.default.each(layerData, (row, rowIndex) => {
                    // Skip if value excluded
                    if (lodash_1.default.includes(layer.axes.color.excludedValues, row.color)) {
                        return;
                    }
                    const series = `${layerIndex}:${rowIndex}`;
                    // Pie series contain a single value
                    columns.push([series, row.y]);
                    types[series] = this.getLayerType(design, layerIndex);
                    names[series] = this.axisBuilder.formatValue(layer.axes.color, row.color, locale, true);
                    dataMap[series] = { layerIndex, row };
                    format[series] = (value) => value != null ? this.axisBuilder.formatValue(layer.axes.y, value, locale, true) : "";
                    // Get specific color if present
                    const color = this.axisBuilder.getValueColor(layer.axes.color, row.color);
                    //color = color or layer.color
                    if (color) {
                        return (colors[series] = color);
                    }
                });
            }
            else {
                // Create a single series
                const row = data[`layer${layerIndex}`][0];
                if (row) {
                    const series = `${layerIndex}`;
                    columns.push([series, row.y]);
                    types[series] = this.getLayerType(design, layerIndex);
                    // Name is name of entire layer
                    names[series] = layer.name || (design.layers.length === 1 ? "Value" : `Series ${layerIndex + 1}`);
                    dataMap[series] = { layerIndex, row };
                    format[series] = (value) => value != null ? this.axisBuilder.formatValue(layer.axes.y, value, locale, true) : "";
                    // Set color if present
                    if (layer.color) {
                        return (colors[series] = layer.color);
                    }
                }
            }
        });
        // Determine order (default is desc)
        if (design.polarOrder === "desc") {
            order = "desc";
        }
        else if (design.polarOrder === "asc") {
            order = "asc";
        }
        else if (design.polarOrder === "natural") {
            order = null;
        }
        else {
            order = "desc";
        }
        return {
            columns,
            types,
            names,
            dataMap,
            colors,
            xAxisType: "category",
            titleText: this.compileTitleText(design, locale),
            order,
            format
        };
    }
    // Compiles data for a chart like line or scatter that does not have a categorical x axis
    compileDataNonCategorical(design, data, locale) {
        const columns = [];
        const types = {};
        const names = {};
        const dataMap = {};
        const colors = {};
        const xs = {};
        let groups = [];
        const format = {};
        const legendHide = []; // Which series to hide
        const classes = {}; // Custom classes to add to series
        const xType = this.axisBuilder.getAxisType(design.layers[0].axes.x);
        // For each layer
        lodash_1.default.each(design.layers, (layer, layerIndex) => {
            // Get data of layer
            let layerData = data[`layer${layerIndex}`];
            this.fixStringYValues(layerData);
            if (layer.cumulative) {
                layerData = this.makeRowsCumulative(layerData);
            }
            // Remove excluded values
            layerData = lodash_1.default.filter(layerData, (row) => !lodash_1.default.includes(layer.axes.x.excludedValues, row.x));
            // If has color axis
            if (layer.axes.color) {
                // Create a series for each color value
                let colorValues = lodash_1.default.uniq(lodash_1.default.pluck(layerData, "color"));
                // Sort color values by category order:
                // Get categories
                const categories = this.axisBuilder.getCategories(layer.axes.color, colorValues, locale);
                // Get indexed ordering of categories (lookup from value to index) without removing excluded values
                const categoryOrder = lodash_1.default.zipObject(lodash_1.default.map(categories, (c, i) => [c.value, i]));
                // Sort
                colorValues = lodash_1.default.sortBy(colorValues, (v) => categoryOrder[v]);
                // Exclude excluded ones
                colorValues = lodash_1.default.difference(colorValues, layer.axes.color.excludedValues);
                // For each color value
                return lodash_1.default.each(colorValues, (colorValue) => {
                    // One series for x values, one for y
                    const seriesX = `${layerIndex}:${colorValue}:x`;
                    const seriesY = `${layerIndex}:${colorValue}:y`;
                    // Get specific color if present
                    let color = this.axisBuilder.getValueColor(layer.axes.color, colorValue);
                    color = color || layer.color;
                    if (color) {
                        colors[seriesY] = color;
                    }
                    // Get rows for this series
                    const rows = lodash_1.default.where(layerData, { color: colorValue });
                    const yValues = lodash_1.default.pluck(rows, "y");
                    columns.push([seriesY].concat(yValues));
                    columns.push([seriesX].concat(lodash_1.default.pluck(rows, "x")));
                    types[seriesY] = this.getLayerType(design, layerIndex);
                    names[seriesY] = this.axisBuilder.formatValue(layer.axes.color, colorValue, locale, true);
                    xs[seriesY] = seriesX;
                    format[seriesY] = (value) => value != null ? this.axisBuilder.formatValue(layer.axes.y, value, locale, true) : "";
                    return lodash_1.default.each(rows, (row, rowIndex) => {
                        return (dataMap[`${seriesY}:${rowIndex}`] = { layerIndex, row });
                    });
                });
            }
            else {
                // One series for x values, one for y
                const seriesX = `${layerIndex}:x`;
                const seriesY = `${layerIndex}:y`;
                const yValues = lodash_1.default.pluck(layerData, "y");
                const xValues = lodash_1.default.pluck(layerData, "x");
                columns.push([seriesY].concat(yValues));
                columns.push([seriesX].concat(xValues));
                types[seriesY] = this.getLayerType(design, layerIndex);
                names[seriesY] = layer.name || (design.layers.length === 1 ? "Value" : `Series ${layerIndex + 1}`);
                xs[seriesY] = seriesX;
                colors[seriesY] = layer.color || defaultColors[layerIndex];
                format[seriesY] = (value) => value != null ? this.axisBuilder.formatValue(layer.axes.y, value, locale, true) : "";
                // Add data map for each row
                lodash_1.default.each(layerData, (row, rowIndex) => {
                    return (dataMap[`${seriesY}:${rowIndex}`] = { layerIndex, row });
                });
                // Add trendline
                if (layer.trendline === "linear") {
                    const trendlineSeries = seriesY + ":trendline";
                    columns.push([trendlineSeries].concat(calculateLinearRegression(yValues, xValues)));
                    types[trendlineSeries] = "line";
                    names[trendlineSeries] = names[seriesY] + " Trendline";
                    xs[trendlineSeries] = seriesX;
                    colors[trendlineSeries] = layer.color || defaultColors[layerIndex];
                    legendHide.push(trendlineSeries); // Hide in legend
                    format[trendlineSeries] = (value) => value != null ? this.axisBuilder.formatValue(layer.axes.y, value, locale, true) : "";
                    // Set dots as invisible in CSS and line as dashed
                    return (classes[trendlineSeries] = "trendline");
                }
            }
        });
        // Stack by putting into groups
        if (design.stacked) {
            groups = [lodash_1.default.keys(names)];
        }
        return {
            columns,
            types,
            names,
            groups,
            dataMap,
            colors,
            xs,
            legendHide,
            classes,
            xAxisType: ["date"].includes(xType) ? "timeseries" : "indexed",
            xAxisTickFit: false,
            xAxisLabelText: this.compileXAxisLabelText(design, locale),
            yAxisLabelText: this.compileYAxisLabelText(design, locale),
            titleText: this.compileTitleText(design, locale),
            order: null,
            format
        };
    }
    // Numbers sometimes arrive as strings from database. Fix by parsing
    fixStringYValues(rows) {
        for (let row of rows) {
            if (lodash_1.default.isString(row.y)) {
                row.y = parseFloat(row.y);
            }
        }
        return rows;
    }
    // Flatten if x-type is enumset. e.g. if one row has x = ["a", "b"], make into two rows with x="a" and x="b", summing if already exists
    flattenRowData(rows) {
        const flatRows = [];
        for (var row of rows) {
            // Handle null
            var xs;
            if (!row.x) {
                flatRows.push(row);
                continue;
            }
            if (lodash_1.default.isString(row.x)) {
                // Handle failed parsings graciously in case question used to be a non-array
                try {
                    xs = JSON.parse(row.x);
                }
                catch (error) {
                    xs = row.x;
                }
            }
            else {
                xs = row.x;
            }
            for (var x of xs) {
                // Find existing row
                const existingRow = lodash_1.default.find(flatRows, (r) => r.x === x && r.color === row.color);
                if (existingRow) {
                    existingRow.y += row.y;
                }
                else {
                    flatRows.push(lodash_1.default.extend({}, row, { x }));
                }
            }
        }
        return flatRows;
    }
    compileDataCategorical(design, data, locale) {
        let categoryXs;
        const columns = [];
        const types = {};
        const names = {};
        const dataMap = {};
        const colors = {};
        const xs = {};
        let groups = [];
        const format = {};
        const colorOverrides = {}; // Mapping of "<layer>:<index>" to color if overridden
        const legendHide = []; // Which series to hide
        const classes = {}; // Custom classes to add to series
        // Get all values of the x-axis, taking into account values that might be missing
        const xAxis = lodash_1.default.extend({}, design.layers[0].axes.x);
        const nullLabel = lodash_1.default.first(lodash_1.default.compact(design.layers.map((l) => l.axes.x.nullLabel)));
        xAxis.nullLabel = nullLabel;
        const xType = this.axisBuilder.getAxisType(xAxis);
        // Get all known values from all layers
        let xValues = [];
        lodash_1.default.each(design.layers, (layer, layerIndex) => {
            // Get data of layer
            const layerData = data[`layer${layerIndex}`];
            return (xValues = lodash_1.default.union(xValues, lodash_1.default.uniq(lodash_1.default.pluck(layerData, "x"))));
        });
        // Categories will be in form [{ value, label }]
        let categories = this.axisBuilder.getCategories(xAxis, xValues, locale);
        // Get indexed ordering of categories (lookup from value to index) without removing excluded values
        const categoryOrder = lodash_1.default.zipObject(lodash_1.default.map(categories, (c, i) => [c.value, i]));
        // Exclude excluded values
        categories = lodash_1.default.filter(categories, (category) => !lodash_1.default.includes(xAxis.excludedValues, category.value));
        // Limit categories to prevent crashes in C3 (https://github.com/mWater/mwater-visualization/issues/272)
        if (xType !== "enumset") {
            // Take last ones to make dates prettier (enough to show all weeks)
            categories = lodash_1.default.takeRight(categories, 55);
            categoryXs = lodash_1.default.indexBy(categories, "value");
        }
        // Create map of category value to index
        const categoryMap = lodash_1.default.object(lodash_1.default.map(categories, (c, i) => [c.value, i]));
        // Create common x series
        columns.push(["x"].concat(lodash_1.default.map(categories, (category) => this.axisBuilder.formatCategory(xAxis, category))));
        // For each layer
        lodash_1.default.each(design.layers, (layer, layerIndex) => {
            // Get data of layer
            let column, series;
            let layerData = data[`layer${layerIndex}`];
            // Fix string y values
            layerData = this.fixStringYValues(layerData);
            // Flatten if x-type is enumset. e.g. if one row has x = ["a", "b"], make into two rows with x="a" and x="b", summing if already exists
            if (xType === "enumset") {
                layerData = this.flattenRowData(layerData);
            }
            // Reorder to category order for x-axis
            layerData = lodash_1.default.sortBy(layerData, (row) => categoryOrder[row.x]);
            // Make rows cumulative
            if (layer.cumulative) {
                layerData = this.makeRowsCumulative(layerData);
            }
            // Filter out categories that were removed
            if (xType !== "enumset") {
                layerData = lodash_1.default.filter(layerData, (row) => categoryXs[row.x] != null);
            }
            // If has color axis
            if (layer.axes.color) {
                // Create a series for each color value
                let colorValues = lodash_1.default.uniq(lodash_1.default.pluck(layerData, "color"));
                // Sort color values by category order:
                // Get categories
                const colorCategories = this.axisBuilder.getCategories(layer.axes.color, colorValues, locale);
                // Get indexed ordering of categories (lookup from value to index) without removing excluded values
                const colorCategoryOrder = lodash_1.default.zipObject(lodash_1.default.map(colorCategories, (c, i) => [c.value, i]));
                // Sort
                colorValues = lodash_1.default.sortBy(colorValues, (v) => colorCategoryOrder[v]);
                // Exclude excluded ones
                colorValues = lodash_1.default.difference(colorValues, layer.axes.color.excludedValues);
                if (colorValues.length > 0) {
                    return lodash_1.default.each(colorValues, (colorValue) => {
                        // One series for y values
                        const series = `${layerIndex}:${colorValue}`;
                        // Get specific color if present
                        let color = this.axisBuilder.getValueColor(layer.axes.color, colorValue);
                        color = color || layer.color;
                        if (color) {
                            colors[series] = color;
                        }
                        // Get rows for this series
                        const rows = lodash_1.default.where(layerData, { color: colorValue });
                        // Create empty series
                        const column = lodash_1.default.map(categories, (c) => null);
                        // Set rows
                        lodash_1.default.each(rows, (row) => {
                            // Get index
                            const index = categoryMap[row.x];
                            if (index != null) {
                                column[index] = row.y;
                                return (dataMap[`${series}:${index}`] = { layerIndex, row });
                            }
                        });
                        // Fill in nulls if cumulative
                        if (layer.cumulative) {
                            for (let i = 0; i < column.length; i++) {
                                const value = column[i];
                                if (value == null && i > 0) {
                                    column[i] = column[i - 1];
                                }
                            }
                        }
                        columns.push([series].concat(column));
                        types[series] = this.getLayerType(design, layerIndex);
                        names[series] = this.axisBuilder.formatValue(layer.axes.color, colorValue, locale, true);
                        xs[series] = "x";
                        return (format[series] = (value) => value != null ? this.axisBuilder.formatValue(layer.axes.y, value, locale, true) : "");
                    });
                }
                else {
                    //c3 acts funny when there is a split axis but no data
                    series = `${layerIndex}:dumm`;
                    column = lodash_1.default.map(categories, (c) => null);
                    columns.push([series].concat(column));
                    types[series] = this.getLayerType(design, layerIndex);
                    names[series] = this.axisBuilder.formatValue(layer.axes.color, null, locale, true);
                    xs[series] = "x";
                    return (format[series] = (value) => value != null ? this.axisBuilder.formatValue(layer.axes.y, value, locale, true) : "");
                }
            }
            else {
                // One series for y
                series = `${layerIndex}`;
                // Create empty series
                column = lodash_1.default.map(categories, (c) => null);
                // Set rows
                lodash_1.default.each(layerData, (row) => {
                    // Skip if value excluded
                    if (lodash_1.default.includes(layer.axes.x.excludedValues, row.x)) {
                        return;
                    }
                    // Get index
                    const index = categoryMap[row.x];
                    column[index] = row.y;
                    dataMap[`${series}:${index}`] = { layerIndex, row };
                    // Get color override
                    if (layer.xColorMap) {
                        const color = this.axisBuilder.getValueColor(layer.axes.x, row.x);
                        if (color) {
                            return (colorOverrides[`${series}:${index}`] = color);
                        }
                    }
                });
                columns.push([series].concat(column));
                types[series] = this.getLayerType(design, layerIndex);
                names[series] = layer.name || (design.layers.length === 1 ? "Value" : `Series ${layerIndex + 1}`);
                xs[series] = "x";
                colors[series] = layer.color || defaultColors[layerIndex];
                format[series] = (value) => value != null ? this.axisBuilder.formatValue(layer.axes.y, value, locale, true) : "";
                // Add trendline
                if (layer.trendline === "linear") {
                    const trendlineSeries = series + ":trendline";
                    let trendXs = lodash_1.default.range(column.length);
                    let trendYs = column;
                    // Skip null last value
                    if (categories.length > 0 && lodash_1.default.last(categories).value === null) {
                        trendXs = lodash_1.default.initial(trendXs);
                        trendYs = lodash_1.default.initial(trendYs);
                    }
                    columns.push([trendlineSeries].concat(calculateLinearRegression(trendYs, trendXs)));
                    types[trendlineSeries] = "line";
                    names[trendlineSeries] = names[series] + " Trendline";
                    xs[trendlineSeries] = "x";
                    colors[trendlineSeries] = layer.color || defaultColors[layerIndex];
                    legendHide.push(trendlineSeries); // Hide in legend
                    format[trendlineSeries] = (value) => value != null ? this.axisBuilder.formatValue(layer.axes.y, value, locale, true) : "";
                    // Set dots as invisible in CSS and line as dashed
                    return (classes[trendlineSeries] = "trendline");
                }
            }
        });
        // Stack by putting into groups
        if (design.stacked) {
            groups = [lodash_1.default.keys(names)];
        }
        else if (design.layers.length > 1) {
            groups = [];
            for (var layerIndex = 0; layerIndex < design.layers.length; layerIndex++) {
                // If has multiple layers and color axes within layers. Stack individual layers unless stacked is false
                const layer = design.layers[layerIndex];
                const defaultStacked = layer.axes.color != null;
                const stacked = layer.stacked != null ? layer.stacked : defaultStacked;
                if (stacked) {
                    groups.push(lodash_1.default.filter(lodash_1.default.keys(names), (series) => series.split(":")[0] === `${layerIndex}`));
                }
            }
            // Remove empty groups
            groups = lodash_1.default.filter(groups, (g) => g.length > 1);
        }
        // If proportional
        if (design.proportional) {
            // Calculate total for each x
            let column, i;
            const xtotals = [];
            for (column of columns) {
                // Skip x column
                var asc, end;
                if (column[0] === "x") {
                    continue;
                }
                for (i = 1, end = column.length, asc = 1 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
                    xtotals[i] = (xtotals[i] || 0) + (column[i] || 0);
                }
            }
            // Now make percentage with one decimal
            for (column of columns) {
                // Skip x column
                var asc1, end1;
                if (column[0] === "x") {
                    continue;
                }
                for (i = 1, end1 = column.length, asc1 = 1 <= end1; asc1 ? i < end1 : i > end1; asc1 ? i++ : i--) {
                    if (column[i] > 0) {
                        column[i] = Math.round(((100 * column[i]) / xtotals[i]) * 10) / 10;
                    }
                }
            }
        }
        // console.log(format)
        return {
            columns,
            types,
            names,
            dataMap,
            colors,
            xs,
            groups,
            legendHide,
            classes,
            xAxisType: "category",
            xAxisTickFit: xType !== "date",
            xAxisLabelText: this.compileXAxisLabelText(design, locale),
            yAxisLabelText: this.compileYAxisLabelText(design, locale),
            titleText: this.compileTitleText(design, locale),
            order: null,
            format,
            color: (color, d) => {
                // Handle overall series color which calls with a non-object for d
                if (typeof d !== "object") {
                    // Overall series is not changed in color
                    return color;
                }
                const key = `${d.id}:${d.index}`;
                if (colorOverrides[key]) {
                    color = colorOverrides[key];
                }
                // Apply thresholds (in order)
                const sortedYThresholds = lodash_1.default.sortBy(design.yThresholds || [], "value");
                for (let yThreshold of sortedYThresholds) {
                    if (d.value > yThreshold.value && yThreshold.highlightColor) {
                        color = yThreshold.highlightColor;
                    }
                }
                return color;
            }
        };
    }
    // Compile an expression
    compileExpr(expr) {
        const exprCompiler = new mwater_expressions_1.ExprCompiler(this.schema);
        return exprCompiler.compileExpr({ expr, tableAlias: "main" });
    }
    // Get layer type, defaulting to overall type
    getLayerType(design, layerIndex) {
        return design.layers[layerIndex].type || design.type;
    }
    // Determine if layer required grouping by x (and color)
    doesLayerNeedGrouping(design, layerIndex) {
        return this.getLayerType(design, layerIndex) !== "scatter";
    }
    // Determine if layer can use x axis
    canLayerUseXExpr(design, layerIndex) {
        let needle;
        return (needle = this.getLayerType(design, layerIndex)), !["pie", "donut"].includes(needle);
    }
    isXAxisRequired(design, layerIndex) {
        let needle;
        return lodash_1.default.any(design.layers, (layer, i) => ((needle = this.getLayerType(design, i)), !["pie", "donut"].includes(needle)));
    }
    isColorAxisRequired(design, layerIndex) {
        let needle;
        return (needle = this.getLayerType(design, layerIndex)), ["pie", "donut"].includes(needle);
    }
    compileDefaultTitleText(design, locale) {
        // Don't default this for now
        return "";
    }
    // if design.layers[0].axes.x
    //   return @compileYAxisLabelText(design) + " by " + @compileXAxisLabelText(design)
    // else
    //   return @compileYAxisLabelText(design) + " by " + @axisBuilder.summarizeAxis(design.layers[0].axes.color)
    compileDefaultYAxisLabelText(design, locale) {
        return this.axisBuilder.summarizeAxis(design.layers[0].axes.y, locale);
    }
    compileDefaultXAxisLabelText(design, locale) {
        return this.axisBuilder.summarizeAxis(design.layers[0].axes.x, locale);
    }
    compileTitleText(design, locale) {
        return design.titleText || this.compileDefaultTitleText(design, locale);
    }
    compileYAxisLabelText(design, locale) {
        if (design.yAxisLabelText === "") {
            return this.compileDefaultYAxisLabelText(design, locale);
        }
        return design.yAxisLabelText;
    }
    compileXAxisLabelText(design, locale) {
        if (design.xAxisLabelText === "") {
            return this.compileDefaultXAxisLabelText(design, locale);
        }
        return design.xAxisLabelText;
    }
    // Create a scope based on a row of a layer
    // Scope data is relevant data from row that uniquely identifies scope
    // plus a layer index
    createScope(design, layerIndex, row, locale) {
        let filter, filterExpr;
        const expressionBuilder = new mwater_expressions_2.ExprUtils(this.schema);
        // Get layer
        const layer = design.layers[layerIndex];
        const filters = [];
        const filterExprs = [];
        const names = [];
        const data = { layerIndex };
        // If x
        if (layer.axes.x) {
            // Handle special case of enumset which is flattened to enum type
            if (this.axisBuilder.getAxisType(layer.axes.x) === "enumset") {
                filters.push({
                    type: "op",
                    op: "@>",
                    exprs: [
                        {
                            type: "op",
                            op: "::jsonb",
                            exprs: [this.axisBuilder.compileAxis({ axis: layer.axes.x, tableAlias: "{alias}" })]
                        },
                        { type: "op", op: "::jsonb", exprs: [JSON.stringify(row.x)] }
                    ]
                });
                filterExprs.push({
                    table: layer.table,
                    type: "op",
                    op: "contains",
                    exprs: [
                        this.axisBuilder.convertAxisToExpr(layer.axes.x),
                        { type: "literal", valueType: "enumset", value: [row.x] }
                    ]
                });
                names.push(this.axisBuilder.summarizeAxis(layer.axes.x, locale) +
                    " includes " +
                    this.exprUtils.stringifyExprLiteral(layer.axes.x.expr, [row.x], locale));
                data.x = row.x;
            }
            else {
                filters.push(this.axisBuilder.createValueFilter(layer.axes.x, row.x));
                filterExprs.push(this.axisBuilder.createValueFilterExpr(layer.axes.x, row.x));
                names.push(this.axisBuilder.summarizeAxis(layer.axes.x, locale) +
                    " is " +
                    this.axisBuilder.formatValue(layer.axes.x, row.x, locale, true));
                data.x = row.x;
            }
        }
        if (layer.axes.color) {
            filters.push(this.axisBuilder.createValueFilter(layer.axes.color, row.color));
            filterExprs.push(this.axisBuilder.createValueFilterExpr(layer.axes.color, row.color));
            names.push(this.axisBuilder.summarizeAxis(layer.axes.color, locale) +
                " is " +
                this.axisBuilder.formatValue(layer.axes.color, row.color, locale, true));
            data.color = row.color;
        }
        if (filters.length > 1) {
            filter = {
                table: layer.table,
                jsonql: {
                    type: "op",
                    op: "and",
                    exprs: filters
                }
            };
            filterExpr = {
                table: layer.table,
                type: "op",
                op: "and",
                exprs: filterExprs
            };
        }
        else {
            filter = {
                table: layer.table,
                jsonql: filters[0]
            };
            filterExpr = filterExprs[0];
        }
        const scope = {
            name: mwater_expressions_2.ExprUtils.localizeString(this.schema.getTable(layer.table).name, locale) + " " + names.join(" and "),
            filter,
            filterExpr,
            data
        };
        return scope;
    }
    // Converts a series of rows to have cumulative y axis, separating out by color axis if present
    makeRowsCumulative(rows) {
        // Indexed by color
        const totals = {};
        const newRows = [];
        for (let row of rows) {
            // Add up total
            const total = totals[row.color] || 0;
            const y = total + row.y;
            totals[row.color] = y;
            // If x is null, don't make cumulative
            if (row.x === null) {
                newRows.push(row);
            }
            else {
                // Create new row
                newRows.push(lodash_1.default.extend({}, row, { y }));
            }
        }
        return newRows;
    }
}
exports.default = LayeredChartCompiler;
// Clean out nbsp (U+00A0) as it causes c3 errors
function cleanString(str) {
    if (!str) {
        return str;
    }
    return str.replace("\u00A0", " ");
}
// Calculate a linear regression, returning a series of y values that match the x values
function calculateLinearRegression(ys, xs) {
    // If xs are dates, convert to numbers
    if (lodash_1.default.isString(xs[0])) {
        xs = lodash_1.default.map(xs, (x) => Date.parse(x));
    }
    // Remove null ys
    const nonNullxs = lodash_1.default.filter(xs, (x, index) => ys[index] !== null);
    const nonNullys = lodash_1.default.filter(ys, (y, index) => ys[index] !== null);
    const n = nonNullys.length;
    const sumXY = lodash_1.default.sum(lodash_1.default.map(nonNullxs, (x, i) => x * nonNullys[i]));
    const sumXX = lodash_1.default.sum(lodash_1.default.map(nonNullxs, (x) => x * x));
    const sumX = lodash_1.default.sum(nonNullxs);
    const sumY = lodash_1.default.sum(nonNullys);
    // Calculate denominator
    const den = n * sumXX - sumX * sumX;
    // Calculate slope
    const slope = (n * sumXY - sumX * sumY) / den;
    // Calculate intercept
    const intercept = (sumY * sumXX - sumX * sumXY) / den;
    return lodash_1.default.map(xs, (x) => x * slope + intercept);
}
