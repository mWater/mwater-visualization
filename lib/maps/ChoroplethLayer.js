"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var react_1 = __importDefault(require("react"));
var Layer = require('./Layer');
var mwater_expressions_1 = require("mwater-expressions");
var AxisBuilder_1 = __importDefault(require("../axes/AxisBuilder"));
var LayerLegendComponent = require('./LayerLegendComponent');
var PopupFilterJoinsUtils = require('./PopupFilterJoinsUtils');
var ChoroplethLayer = /** @class */ (function (_super) {
    __extends(ChoroplethLayer, _super);
    function ChoroplethLayer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /** Gets the layer definition as JsonQL + CSS in format:
     *   {
     *     layers: array of { id: layer id, jsonql: jsonql that includes "the_webmercator_geom" as a column }
     *     css: carto css
     *     interactivity: (optional) { layer: id of layer, fields: array of field names }
     *   }
     * arguments:
     *   design: design of layer
     *   schema: schema to use
     *   filters: array of filters to apply
     */
    ChoroplethLayer.prototype.getJsonQLCss = function (design, schema, filters) {
        // Create design
        var layerDef = {
            layers: [{ id: "layer0", jsonql: this.createJsonQL(design, schema, filters) }],
            css: this.createCss(design, schema, filters),
            interactivity: {
                layer: "layer0",
                fields: ["id", "name"]
            }
        };
        return layerDef;
    };
    ChoroplethLayer.prototype.createJsonQL = function (design, schema, filters) {
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        var exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
        // Verify that scopeLevel is an integer to prevent injection
        if ((design.scopeLevel != null) && ![0, 1, 2, 3, 4, 5].includes(design.scopeLevel)) {
            throw new Error("Invalid scope level");
        }
        // Verify that detailLevel is an integer to prevent injection
        if (![0, 1, 2, 3, 4, 5].includes(design.detailLevel)) {
            throw new Error("Invalid detail level");
        }
        var regionsTable = design.regionsTable || "admin_regions";
        if (design.regionMode === "plain") {
            /*
            E.g:
            select name, shape_simplified from
              admin_regions as regions
              where regions.level0 = 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb'
              and regions.level = 2
            */
            var query = {
                type: "query",
                selects: [
                    { type: "select", expr: { type: "field", tableAlias: "regions", column: "_id" }, alias: "id" },
                    { type: "select", expr: { type: "field", tableAlias: "regions", column: "shape_simplified" }, alias: "the_geom_webmercator" },
                    { type: "select", expr: { type: "field", tableAlias: "regions", column: "name" }, alias: "name" }
                ],
                from: { type: "table", table: regionsTable, alias: "regions" },
                where: {
                    type: "op",
                    op: "and",
                    exprs: [
                        // Level to display
                        {
                            type: "op",
                            op: "=",
                            exprs: [
                                { type: "field", tableAlias: "regions", column: "level" },
                                design.detailLevel
                            ]
                        }
                    ]
                }
            };
            // Scope overall
            if (design.scope) {
                query.where.exprs.push({
                    type: "op",
                    op: "=",
                    exprs: [
                        { type: "field", tableAlias: "regions", column: "level" + (design.scopeLevel || 0) },
                        { type: "literal", value: design.scope }
                    ]
                });
            }
            return query;
        }
        if (design.regionMode === "indirect" || !design.regionMode) {
            /*
            E.g:
            select name, shape_simplified, regions.color from
            admin_regions as regions2
            left outer join
            (
              select admin_regions.level2 as id,
              count(innerquery.*) as color
              from
              admin_regions inner join
              entities.water_point as innerquery
              on innerquery.admin_region = admin_regions._id
              where admin_regions.level0 = 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb'
              group by 1
            ) as regions on regions.id = regions2._id
            where regions2.level = 2 and regions2.level0 = 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb'
            */
            var compiledAdminRegionExpr = exprCompiler.compileExpr({ expr: design.adminRegionExpr, tableAlias: "innerquery" });
            // Create inner query
            var innerQuery = {
                type: "query",
                selects: [
                    { type: "select", expr: { type: "field", tableAlias: "regions", column: "level" + design.detailLevel }, alias: "id" }
                ],
                from: {
                    type: "join",
                    kind: "inner",
                    left: { type: "table", table: regionsTable, alias: "regions" },
                    right: exprCompiler.compileTable(design.table, "innerquery"),
                    on: {
                        type: "op",
                        op: "=",
                        exprs: [
                            compiledAdminRegionExpr,
                            { type: "field", tableAlias: "regions", column: "_id" }
                        ]
                    }
                },
                groupBy: [1]
            };
            // Add color select if color axis
            if (design.axes.color) {
                var colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "innerquery" });
                innerQuery.selects.push({ type: "select", expr: colorExpr, alias: "color" });
            }
            // Add label select if color axis
            if (design.axes.label) {
                var labelExpr = axisBuilder.compileAxis({ axis: design.axes.label, tableAlias: "innerquery" });
                innerQuery.selects.push({ type: "select", expr: labelExpr, alias: "label" });
            }
            var whereClauses = [];
            if (design.scope) {
                whereClauses.push({
                    type: "op",
                    op: "=",
                    exprs: [
                        { type: "field", tableAlias: "regions", column: "level" + (design.scopeLevel || 0) },
                        design.scope
                    ]
                });
            }
            // Then add filters
            if (design.filter) {
                whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "innerquery" }));
            }
            // Then add extra filters passed in, if relevant
            var relevantFilters = lodash_1.default.where(filters, { table: design.table });
            for (var _i = 0, relevantFilters_1 = relevantFilters; _i < relevantFilters_1.length; _i++) {
                var filter = relevantFilters_1[_i];
                whereClauses.push(mwater_expressions_1.injectTableAlias(filter.jsonql, "innerquery"));
            }
            whereClauses = lodash_1.default.compact(whereClauses);
            if (whereClauses.length > 0) {
                innerQuery.where = { type: "op", op: "and", exprs: whereClauses };
            }
            // Now create outer query
            var query = {
                type: "query",
                selects: [
                    { type: "select", expr: { type: "field", tableAlias: "regions2", column: "_id" }, alias: "id" },
                    { type: "select", expr: { type: "field", tableAlias: "regions2", column: "shape_simplified" }, alias: "the_geom_webmercator" },
                    { type: "select", expr: { type: "field", tableAlias: "regions2", column: "name" }, alias: "name" }
                ],
                from: {
                    type: "join",
                    kind: "left",
                    left: { type: "table", table: regionsTable, alias: "regions2" },
                    right: { type: "subquery", query: innerQuery, alias: "regions" },
                    on: {
                        type: "op",
                        op: "=",
                        exprs: [
                            { type: "field", tableAlias: "regions", column: "id" },
                            { type: "field", tableAlias: "regions2", column: "_id" }
                        ]
                    }
                },
                where: {
                    type: "op",
                    op: "and",
                    exprs: [
                        // Level to display
                        {
                            type: "op",
                            op: "=",
                            exprs: [
                                { type: "field", tableAlias: "regions2", column: "level" },
                                design.detailLevel
                            ]
                        }
                    ]
                }
            };
            // Scope overall
            if (design.scope) {
                query.where.exprs.push({
                    type: "op",
                    op: "=",
                    exprs: [
                        { type: "field", tableAlias: "regions2", column: "level" + (design.scopeLevel || 0) },
                        { type: "literal", value: design.scope }
                    ]
                });
            }
            // Bubble up color and label
            if (design.axes.color) {
                query.selects.push({ type: "select", expr: { type: "field", tableAlias: "regions", column: "color" }, alias: "color" });
            }
            // Add label select if color axis
            if (design.axes.label) {
                query.selects.push({ type: "select", expr: { type: "field", tableAlias: "regions", column: "label" }, alias: "label" });
            }
            return query;
        }
        if (design.regionMode === "direct") {
            /*
            E.g:
            select name, shape_simplified from
              admin_regions as regions
              where regions.level0 = 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb'
              and regions.level = 2
            */
            var query = {
                type: "query",
                selects: [
                    { type: "select", expr: { type: "field", tableAlias: "regions", column: "_id" }, alias: "id" },
                    { type: "select", expr: { type: "field", tableAlias: "regions", column: "shape_simplified" }, alias: "the_geom_webmercator" },
                    { type: "select", expr: { type: "field", tableAlias: "regions", column: "name" }, alias: "name" }
                ],
                from: { type: "table", table: regionsTable, alias: "regions" },
                where: {
                    type: "op",
                    op: "and",
                    exprs: [
                        // Level to display
                        {
                            type: "op",
                            op: "=",
                            exprs: [
                                { type: "field", tableAlias: "regions", column: "level" },
                                design.detailLevel
                            ]
                        }
                    ]
                }
            };
            // Add color select 
            if (design.axes.color) {
                var colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "regions" });
                query.selects.push({ type: "select", expr: colorExpr, alias: "color" });
            }
            // Add label select if color axis
            if (design.axes.label) {
                var labelExpr = axisBuilder.compileAxis({ axis: design.axes.label, tableAlias: "regions" });
                query.selects.push({ type: "select", expr: labelExpr, alias: "label" });
            }
            // Scope overall
            if (design.scope) {
                query.where.exprs.push({
                    type: "op",
                    op: "=",
                    exprs: [
                        { type: "field", tableAlias: "regions", column: "level" + (design.scopeLevel || 0) },
                        { type: "literal", value: design.scope }
                    ]
                });
            }
            return query;
        }
        throw new Error("Unsupported regionMode " + design.regionMode);
    };
    ChoroplethLayer.prototype.createCss = function (design, schema, filters) {
        var css = "#layer0 {\n  line-color: #000;\n  line-width: 1.5;\n  line-opacity: 0.6;\n  polygon-opacity: " + design.fillOpacity + ";\npolygon-fill: " + (design.color || "transparent") + ";\nopacity: " + design.fillOpacity + "; \n}\n";
        if (design.displayNames) {
            css += "#layer0::labels {\n  text-name: [name];\n  text-face-name: 'Arial Regular';\n  text-halo-radius: 2;\n  text-halo-opacity: 0.5;\n  text-halo-fill: #FFF;\n}";
        }
        // If color axes, add color conditions
        if (design.axes.color && design.axes.color.colorMap) {
            for (var _i = 0, _a = design.axes.color.colorMap; _i < _a.length; _i++) {
                var item = _a[_i];
                // If invisible
                if (lodash_1.default.includes(design.axes.color.excludedValues, item.value)) {
                    css += "#layer0 [color=" + JSON.stringify(item.value) + "] { line-color: transparent; polygon-opacity: 0; polygon-fill: transparent; }\n";
                    if (design.displayNames) {
                        css += "#layer0::labels [color=" + JSON.stringify(item.value) + "] { text-opacity: 0; text-halo-opacity: 0; }\n";
                    }
                }
                else {
                    css += "#layer0 [color=" + JSON.stringify(item.value) + "] { polygon-fill: " + item.color + "; }\n";
                }
            }
        }
        return css;
    };
    /**
     * Called when the interactivity grid is clicked.
     * arguments:
     *   ev: { data: interactivty data e.g. `{ id: 123 }` }
     *   clickOptions:
     *     design: design of layer
     *     schema: schema to use
     *     dataSource: data source to use
     *     layerDataSource: layer data source
     *     scopeData: current scope data if layer is scoping
     *     filters: compiled filters to apply to the popup
     *
     * Returns:
     *   null/undefined
     *   or
     *   {
     *     scope: scope to apply ({ name, filter, data })
     *     row: { tableId:, primaryKey: }  # row that was selected
     *     popup: React element to put into a popup
     */
    ChoroplethLayer.prototype.onGridClick = function (ev, clickOptions) {
        // Ignore if not indirect with table
        if (clickOptions.design.regionMode !== "indirect" || !clickOptions.design.table) {
            return null;
        }
        var regionsTable = clickOptions.design.regionsTable || "admin_regions";
        // TODO abstract most to base class
        if (ev.data && ev.data.id) {
            var results = {};
            // Create filter for single row
            var table = clickOptions.design.table;
            // Compile adminRegionExpr
            var exprCompiler = new mwater_expressions_1.ExprCompiler(clickOptions.schema);
            var filterExpr = {
                type: "op",
                op: "within",
                table: table,
                exprs: [
                    clickOptions.design.adminRegionExpr,
                    { type: "literal", idTable: regionsTable, valueType: "id", value: ev.data.id }
                ]
            };
            var compiledFilterExpr = exprCompiler.compileExpr({ expr: filterExpr, tableAlias: "{alias}" });
            // Filter within
            var filter = {
                table: table,
                jsonql: compiledFilterExpr
            };
            if (ev.event.originalEvent.shiftKey) {
                // Scope to region, unless already scoped
                if (clickOptions.scopeData === ev.data.id) {
                    results.scope = null;
                }
                else {
                    results.scope = {
                        name: ev.data.name,
                        filter: filter,
                        data: ev.data.id
                    };
                }
            }
            else if (clickOptions.design.popup) {
                // Create default popup filter joins
                var defaultPopupFilterJoins = {};
                if (clickOptions.design.adminRegionExpr) {
                    defaultPopupFilterJoins[clickOptions.design.table] = clickOptions.design.adminRegionExpr;
                }
                // Create filter using popupFilterJoins
                var popupFilterJoins = clickOptions.design.popupFilterJoins || defaultPopupFilterJoins;
                var popupFilters_1 = PopupFilterJoinsUtils.createPopupFilters(popupFilterJoins, clickOptions.schema, table, ev.data.id, true);
                // Add filter for admin region
                popupFilters_1.push({
                    table: regionsTable,
                    jsonql: { type: "op", op: "=", exprs: [{ type: "field", tableAlias: "{alias}", column: "_id" }, { type: "literal", value: ev.data.id }] }
                });
                var BlocksLayoutManager = require('../layouts/blocks/BlocksLayoutManager');
                var WidgetFactory_1 = require('../widgets/WidgetFactory');
                results.popup = new BlocksLayoutManager().renderLayout({
                    items: clickOptions.design.popup.items,
                    style: "popup",
                    renderWidget: function (options) {
                        var widget = WidgetFactory_1.createWidget(options.type);
                        // Create filters for single row
                        var filters = clickOptions.filters.concat(popupFilters_1);
                        // Get data source for widget
                        var widgetDataSource = clickOptions.layerDataSource.getPopupWidgetDataSource(clickOptions.design, options.id);
                        return widget.createViewElement({
                            schema: clickOptions.schema,
                            dataSource: clickOptions.dataSource,
                            widgetDataSource: widgetDataSource,
                            design: options.design,
                            scope: null,
                            filters: filters,
                            onScopeChange: null,
                            onDesignChange: null,
                            width: options.width,
                            height: options.height,
                            standardWidth: options.standardWidth
                        });
                    }
                });
            }
            return results;
        }
        else {
            return null;
        }
    };
    // Gets the bounds of the layer as GeoJSON
    ChoroplethLayer.prototype.getBounds = function (design, schema, dataSource, filters, callback) {
        var regionsTable = design.regionsTable || "admin_regions";
        // Whole world
        if (!design.scope) {
            return callback(null);
        }
        // Get just scope. Ignore filters and get entire scope
        filters = [{
                table: regionsTable,
                jsonql: {
                    type: "op",
                    op: "=",
                    exprs: [
                        { type: "field", tableAlias: "{alias}", column: "_id" },
                        design.scope
                    ]
                }
            }];
        return this.getBoundsFromExpr(schema, dataSource, regionsTable, { type: "field", table: regionsTable, column: "shape" }, null, filters, callback);
    };
    // Get min and max zoom levels
    ChoroplethLayer.prototype.getMinZoom = function (design) { return design.minZoom; };
    ChoroplethLayer.prototype.getMaxZoom = function (design) { return design.maxZoom; };
    // Get the legend to be optionally displayed on the map. Returns
    // a React element
    ChoroplethLayer.prototype.getLegend = function (design, schema, name, dataSource, filters) {
        if (filters == null) {
            filters = [];
        }
        var _filters = filters.slice();
        if (design.filter != null) {
            var exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
            var jsonql = exprCompiler.compileExpr({ expr: design.filter, tableAlias: "{alias}" });
            if (jsonql) {
                _filters.push({ table: design.filter.table, jsonql: jsonql });
            }
        }
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        var regionsTable = design.regionsTable || "admin_regions";
        var axisTable = design.regionMode === "direct" ? regionsTable : design.table;
        return react_1.default.createElement(LayerLegendComponent, {
            schema: schema,
            name: name,
            dataSource: dataSource,
            filters: lodash_1.default.compact(_filters),
            axis: axisBuilder.cleanAxis({ axis: design.axes.color, table: axisTable, types: ['enum', 'text', 'boolean', 'date'], aggrNeed: "required" }),
            defaultColor: design.color
        });
    };
    // Get a list of table ids that can be filtered on
    ChoroplethLayer.prototype.getFilterableTables = function (design, schema) {
        if (design.table) {
            return [design.table];
        }
        else {
            return [];
        }
    };
    // True if layer can be edited
    ChoroplethLayer.prototype.isEditable = function () {
        return true;
    };
    // Returns a cleaned design
    ChoroplethLayer.prototype.cleanDesign = function (design, schema) {
        var regionsTable = design.regionsTable || "admin_regions";
        var exprCleaner = new mwater_expressions_1.ExprCleaner(schema);
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        // TODO clones entirely
        design = lodash_1.default.cloneDeep(design);
        design.axes = design.axes || {};
        // Default region mode
        if (!design.regionMode) {
            design.regionMode = design.axes.color ? "indirect" : "plain";
        }
        // Default color
        if (design.regionMode === "plain") {
            design.color = design.color || "#FFFFFF";
        }
        else {
            design.color = "#FFFFFF";
        }
        if (design.regionMode === "indirect" && design.table) {
            design.adminRegionExpr = exprCleaner.cleanExpr(design.adminRegionExpr, { table: design.table, types: ["id"], idTable: regionsTable });
        }
        else {
            delete design.adminRegionExpr;
            delete design.table;
        }
        design.fillOpacity = (design.fillOpacity != null) ? design.fillOpacity : 0.75;
        design.displayNames = (design.displayNames != null) ? design.displayNames : true;
        // Clean the axes
        if (design.regionMode === "indirect" && design.table) {
            design.axes.color = axisBuilder.cleanAxis({ axis: design.axes.color, table: design.table, types: ['enum', 'text', 'boolean', 'date'], aggrNeed: "required" });
            design.axes.label = axisBuilder.cleanAxis({ axis: design.axes.label, table: design.table, types: ['text', 'number'], aggrNeed: "required" });
        }
        else if (design.regionMode === "plain" || (design.regionMode === "indirect" && !design.table)) {
            delete design.axes.color;
            delete design.axes.label;
        }
        else if (design.regionMode === "direct") {
            design.axes.color = axisBuilder.cleanAxis({ axis: design.axes.color, table: regionsTable, types: ['enum', 'text', 'boolean', 'date'], aggrNeed: "none" });
            design.axes.label = axisBuilder.cleanAxis({ axis: design.axes.label, table: regionsTable, types: ['text', 'number'], aggrNeed: "none" });
        }
        // Filter is only for indirect
        if (design.regionMode === "indirect" && design.table) {
            design.filter = exprCleaner.cleanExpr(design.filter, { table: design.table });
        }
        else {
            delete design.filter;
        }
        if ((design.detailLevel == null)) {
            design.detailLevel = 0;
        }
        return design;
    };
    // Validates design. Null if ok, message otherwise
    ChoroplethLayer.prototype.validateDesign = function (design, schema) {
        var error;
        var exprUtils = new mwater_expressions_1.ExprUtils(schema);
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        if (design.regionMode === "indirect") {
            if (!design.table) {
                return "Missing table";
            }
            if (!design.adminRegionExpr || (exprUtils.getExprType(design.adminRegionExpr) !== "id")) {
                return "Missing admin region expr";
            }
            error = axisBuilder.validateAxis({ axis: design.axes.color });
            if (error) {
                return error;
            }
            error = axisBuilder.validateAxis({ axis: design.axes.label });
            if (error) {
                return error;
            }
        }
        else if (design.regionMode === "direct") {
            error = axisBuilder.validateAxis({ axis: design.axes.color });
            if (error) {
                return error;
            }
            error = axisBuilder.validateAxis({ axis: design.axes.label });
            if (error) {
                return error;
            }
        }
        if ((design.detailLevel == null)) {
            return "Missing detail level";
        }
        return null;
    };
    // Creates a design element with specified options
    // options:
    //   design: design of layer
    //   schema: schema to use
    //   dataSource: data source to use
    //   onDesignChange: function called when design changes
    //   filters: array of filters
    ChoroplethLayer.prototype.createDesignerElement = function (options) {
        var _this = this;
        // Require here to prevent server require problems
        var ChoroplethLayerDesigner = require('./ChoroplethLayerDesigner').default;
        // Clean on way in and out
        return react_1.default.createElement(ChoroplethLayerDesigner, {
            schema: options.schema,
            dataSource: options.dataSource,
            design: this.cleanDesign(options.design, options.schema),
            filters: options.filters,
            onDesignChange: function (design) {
                return options.onDesignChange(_this.cleanDesign(design, options.schema));
            }
        });
    };
    ChoroplethLayer.prototype.createKMLExportJsonQL = function (design, schema, filters) {
        var regionsTable = design.regionsTable || "admin_regions";
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        var exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
        // Verify that scopeLevel is an integer to prevent injection
        if ((design.scopeLevel != null) && ![0, 1, 2, 3, 4, 5].includes(design.scopeLevel)) {
            throw new Error("Invalid scope level");
        }
        // Verify that detailLevel is an integer to prevent injection
        if (![0, 1, 2, 3, 4, 5].includes(design.detailLevel)) {
            throw new Error("Invalid detail level");
        }
        // Compile adminRegionExpr
        var compiledAdminRegionExpr = exprCompiler.compileExpr({ expr: design.adminRegionExpr, tableAlias: "innerquery" });
        // Create inner query
        var innerQuery = {
            type: "query",
            selects: [
                { type: "select", expr: { type: "field", tableAlias: "regions", column: "level" + design.detailLevel }, alias: "id" }
            ],
            from: {
                type: "join",
                kind: "inner",
                left: { type: "table", table: regionsTable, alias: "regions" },
                right: exprCompiler.compileTable(design.table, "innerquery"),
                on: {
                    type: "op",
                    op: "=",
                    exprs: [
                        compiledAdminRegionExpr,
                        { type: "field", tableAlias: "regions", column: "_id" }
                    ]
                }
            },
            groupBy: [1]
        };
        // Add color select if color axis
        if (design.axes.color) {
            var valueExpr = exprCompiler.compileExpr({ expr: design.axes.color.expr, tableAlias: "innerquery" });
            var colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "innerquery" });
            innerQuery.selects.push({ type: "select", expr: colorExpr, alias: "color" });
            innerQuery.selects.push({ type: "select", expr: valueExpr, alias: "value" });
        }
        // Add label select if color axis
        if (design.axes.label) {
            var labelExpr = axisBuilder.compileAxis({ axis: design.axes.label, tableAlias: "innerquery" });
            innerQuery.selects.push({ type: "select", expr: labelExpr, alias: "label" });
        }
        var whereClauses = [];
        if (design.scope) {
            whereClauses.push({
                type: "op",
                op: "=",
                exprs: [
                    { type: "field", tableAlias: "regions", column: "level" + (design.scopeLevel || 0) },
                    design.scope
                ]
            });
        }
        // Then add filters
        if (design.filter) {
            whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "innerquery" }));
        }
        // Then add extra filters passed in, if relevant
        var relevantFilters = lodash_1.default.where(filters, { table: design.table });
        for (var _i = 0, relevantFilters_2 = relevantFilters; _i < relevantFilters_2.length; _i++) {
            var filter = relevantFilters_2[_i];
            whereClauses.push(mwater_expressions_1.injectTableAlias(filter.jsonql, "innerquery"));
        }
        whereClauses = lodash_1.default.compact(whereClauses);
        if (whereClauses.length > 0) {
            innerQuery.where = { type: "op", op: "and", exprs: whereClauses };
        }
        var adminGeometry = {
            type: "op", op: "ST_AsGeoJson", exprs: [
                {
                    type: "op", op: "ST_Transform", exprs: [
                        { type: "field", tableAlias: "regions2", column: "shape_simplified" },
                        4326
                    ]
                }
            ]
        };
        // Now create outer query
        var query = {
            type: "query",
            selects: [
                { type: "select", expr: { type: "field", tableAlias: "regions2", column: "_id" }, alias: "id" },
                { type: "select", expr: adminGeometry, alias: "the_geom_webmercator" },
                { type: "select", expr: { type: "field", tableAlias: "regions2", column: "name" }, alias: "name" }
            ],
            from: {
                type: "join",
                kind: "left",
                left: { type: "table", table: regionsTable, alias: "regions2" },
                right: { type: "subquery", query: innerQuery, alias: "regions" },
                on: {
                    type: "op",
                    op: "=",
                    exprs: [
                        { type: "field", tableAlias: "regions", column: "id" },
                        { type: "field", tableAlias: "regions2", column: "_id" }
                    ]
                }
            },
            where: {
                type: "op",
                op: "and",
                exprs: [
                    // Level to display
                    {
                        type: "op",
                        op: "=",
                        exprs: [
                            { type: "field", tableAlias: "regions2", column: "level" },
                            design.detailLevel
                        ]
                    }
                ]
            }
        };
        // Scope overall
        if (design.scope) {
            query.where.exprs.push({
                type: "op",
                op: "=",
                exprs: [
                    { type: "field", tableAlias: "regions2", column: "level" + (design.scopeLevel || 0) },
                    { type: "literal", value: design.scope }
                ]
            });
        }
        // Bubble up color and label
        if (design.axes.color) {
            query.selects.push({ type: "select", expr: { type: "field", tableAlias: "regions", column: "color" }, alias: "color" });
            query.selects.push({ type: "select", expr: { type: "field", tableAlias: "regions", column: "value" }, alias: "value" });
        }
        // Add label select if color axis
        if (design.axes.label) {
            query.selects.push({ type: "select", expr: { type: "field", tableAlias: "regions", column: "label" }, alias: "label" });
        }
        return query;
    };
    ChoroplethLayer.prototype.getKMLExportJsonQL = function (design, schema, filters) {
        var style = {
            color: design.color,
            opacity: design.fillOpacity,
            colorMap: null
        };
        if (design.axes.color && design.axes.color.colorMap) {
            style.colorMap = design.axes.color.colorMap;
        }
        var layerDef = {
            layers: [{ id: "layer0", jsonql: this.createKMLExportJsonQL(design, schema, filters), style: style }]
        };
        return layerDef;
    };
    ChoroplethLayer.prototype.acceptKmlVisitorForRow = function (visitor, row) {
        var outer;
        if (!row.the_geom_webmercator) {
            return;
        }
        if (row.the_geom_webmercator.length === 0) {
            return;
        }
        var data = JSON.parse(row.the_geom_webmercator);
        if (data.coordinates.length === 0) {
            return;
        }
        if (data.type === "MultiPolygon") {
            outer = data.coordinates[0][0];
        }
        else {
            outer = data.coordinates[0];
        }
        var list = lodash_1.default.map(outer, function (coordinates) { return coordinates.join(","); });
        return visitor.addPolygon(list.join(" "), row.color, data.type === "MultiPolygon", row.name, visitor.buildDescription(row));
    };
    return ChoroplethLayer;
}(Layer));
exports.default = ChoroplethLayer;
