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
var immer_1 = require("immer");
var Layer_1 = __importDefault(require("./Layer"));
var mwater_expressions_1 = require("mwater-expressions");
var AxisBuilder_1 = __importDefault(require("../axes/AxisBuilder"));
var LayerLegendComponent = require('./LayerLegendComponent');
var PopupFilterJoinsUtils = require('./PopupFilterJoinsUtils');
var MarkersLayer = /** @class */ (function (_super) {
    __extends(MarkersLayer, _super);
    function MarkersLayer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /** Gets the type of layer definition */
    MarkersLayer.prototype.getLayerDefinitionType = function () { return "VectorTile"; };
    MarkersLayer.prototype.getVectorTile = function (design, sourceId, schema, filters, opacity) {
        var jsonql = this.createJsonQL(design, schema, filters);
        var mapLayers = [];
        // If color axes, add color conditions
        var color;
        if (design.axes.color && design.axes.color.colorMap) {
            var excludedValues = design.axes.color.excludedValues || [];
            // Create match operator
            color = ["case"];
            for (var _i = 0, _a = design.axes.color.colorMap; _i < _a.length; _i++) {
                var item = _a[_i];
                color.push(["==", ["get", "color"], item.value]);
                color.push(excludedValues.includes(item.value) ? "transparent" : item.color);
            }
            // Else
            color.push(design.color || "#666666");
        }
        else {
            color = design.color || "#666666";
        }
        // Add polygons
        mapLayers.push({
            'id': sourceId + ":polygons",
            'type': 'fill',
            'source': sourceId,
            'source-layer': 'main',
            paint: {
                "fill-color": color,
                "fill-opacity": 0.25 * opacity,
            },
            filter: ['any',
                ['==', ["get", "geometry_type"], 'ST_Polygon'],
                ['==', ["get", "geometry_type"], 'ST_MultiPolygon']]
        });
        // Add polygon outlines and lines
        mapLayers.push({
            'id': sourceId + ":polygon-outlines",
            'type': 'line',
            'source': sourceId,
            'source-layer': 'main',
            paint: {
                "line-color": color,
                "line-width": (design.lineWidth != null) ? design.lineWidth : 3,
                "line-opacity": opacity
            },
            filter: ['any',
                ['==', ["get", "geometry_type"], 'ST_Polygon'],
                ['==', ["get", "geometry_type"], 'ST_MultiPolygon']]
        });
        // Add lines
        mapLayers.push({
            'id': sourceId + ":lines",
            'type': 'line',
            'source': sourceId,
            'source-layer': 'main',
            paint: {
                "line-color": color,
                "line-width": (design.lineWidth != null) ? design.lineWidth : 3,
                "line-opacity": opacity
            },
            filter: ['any',
                ['==', ["get", "geometry_type"], 'ST_Linestring']
            ]
        });
        // Add markers
        if (!design.symbol) {
            mapLayers.push({
                'id': sourceId + ":points",
                'type': 'circle',
                'source': sourceId,
                'source-layer': 'main',
                paint: {
                    "circle-color": color,
                    "circle-opacity": 0.8 * opacity,
                    "circle-stroke-color": "white",
                    "circle-stroke-width": 1,
                    "circle-stroke-opacity": 0.5 * opacity,
                    "circle-radius": (design.markerSize || 10) / 2
                },
                filter: ['==', ["get", "geometry_type"], 'ST_Point']
            });
        }
        else {
            mapLayers.push({
                'id': sourceId + ":points",
                'type': 'symbol',
                'source': sourceId,
                'source-layer': 'main',
                layout: {
                    "icon-image": design.symbol,
                    "icon-allow-overlap": true,
                    "icon-size": (design.markerSize || 10) / 14 // For some reason, scales down from 20 to 14. No idea why
                },
                paint: {
                    "icon-color": color,
                    "icon-opacity": opacity
                },
                filter: ['==', ["get", "geometry_type"], 'ST_Point']
            });
        }
        return {
            sourceLayers: [
                { id: "main", jsonql: jsonql }
            ],
            ctes: [],
            minZoom: design.minZoom,
            maxZoom: design.maxZoom,
            mapLayers: mapLayers,
            mapLayersHandleClicks: [sourceId + ":polygons", sourceId + ":polygon-outlines", sourceId + ":lines", sourceId + ":points"]
        };
    };
    MarkersLayer.prototype.createJsonQL = function (design, schema, filters) {
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        var exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
        // Expression of scale and envelope from tile table
        var scaleExpr = { type: "scalar", expr: { type: "field", tableAlias: "tile", column: "scale" }, from: { type: "table", table: "tile", alias: "tile" } };
        var envelopeExpr = { type: "scalar", expr: { type: "field", tableAlias: "tile", column: "envelope" }, from: { type: "table", table: "tile", alias: "tile" } };
        // Compile geometry axis
        var geometryExpr = axisBuilder.compileAxis({ axis: design.axes.geometry, tableAlias: "innerquery" });
        // Convert to Web mercator (3857)
        geometryExpr = { type: "op", op: "ST_Transform", exprs: [geometryExpr, 3857] };
        // row_number() over (partition by st_snaptogrid(location, tile.scale / 50, tile.scale / 50)) AS r
        var cluster = {
            type: "select",
            expr: {
                type: "op",
                op: "row_number",
                exprs: [],
                over: { partitionBy: [
                        { type: "op", op: "round", exprs: [
                                { type: "op", op: "/", exprs: [
                                        { type: "op", op: "ST_XMin", exprs: [geometryExpr] },
                                        { type: "op", op: "/", exprs: [scaleExpr, 40] }
                                    ] }
                            ] },
                        { type: "op", op: "round", exprs: [
                                { type: "op", op: "/", exprs: [
                                        { type: "op", op: "ST_YMin", exprs: [geometryExpr] },
                                        { type: "op", op: "/", exprs: [scaleExpr, 40] }
                                    ] }
                            ] }
                    ] }
            },
            alias: "r"
        };
        // Select _id, location and clustered row number
        var innerquery = {
            type: "query",
            selects: [
                { type: "select", expr: { type: "field", tableAlias: "innerquery", column: schema.getTable(design.table).primaryKey }, alias: "id" },
                { type: "select", expr: geometryExpr, alias: "the_geom_webmercator" },
                cluster
            ],
            from: exprCompiler.compileTable(design.table, "innerquery")
        };
        // Add color select if color axis
        if (design.axes.color) {
            var colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "innerquery" });
            innerquery.selects.push({ type: "select", expr: colorExpr, alias: "color" });
        }
        // Create filters. First limit to envelope
        var whereClauses = [
            {
                type: "op",
                op: "&&",
                exprs: [
                    geometryExpr,
                    envelopeExpr
                ]
            }
        ];
        // Then add filters baked into layer
        if (design.filter) {
            whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "innerquery" }));
        }
        // Then add extra filters passed in, if relevant
        // Get relevant filters
        var relevantFilters = lodash_1.default.where(filters, { table: design.table });
        for (var _i = 0, relevantFilters_1 = relevantFilters; _i < relevantFilters_1.length; _i++) {
            var filter = relevantFilters_1[_i];
            whereClauses.push(mwater_expressions_1.injectTableAlias(filter.jsonql, "innerquery"));
        }
        whereClauses = lodash_1.default.compact(whereClauses);
        // Wrap if multiple
        if (whereClauses.length > 1) {
            innerquery.where = { type: "op", op: "and", exprs: whereClauses };
        }
        else {
            innerquery.where = whereClauses[0];
        }
        // Create outer query which takes where r <= 3 to limit # of points in a cluster
        var outerquery = {
            type: "query",
            selects: [
                { type: "select", expr: { type: "op", op: "::text", exprs: [{ type: "field", tableAlias: "innerquery", column: "id" }] }, alias: "id" },
                { type: "select", expr: { type: "op", op: "ST_AsMVTGeom", exprs: [
                            { type: "field", tableAlias: "innerquery", column: "the_geom_webmercator" },
                            envelopeExpr
                        ] }, alias: "the_geom_webmercator" },
                { type: "select", expr: { type: "op", op: "ST_GeometryType", exprs: [{ type: "field", tableAlias: "innerquery", column: "the_geom_webmercator" }] }, alias: "geometry_type" } // ST_GeometryType(innerquery.the_geom_webmercator) as geometry_type
            ],
            from: { type: "subquery", query: innerquery, alias: "innerquery" },
            where: { type: "op", op: "<=", exprs: [{ type: "field", tableAlias: "innerquery", column: "r" }, 3] }
        };
        // Add color select if color axis
        if (design.axes.color) {
            outerquery.selects.push({ type: "select", expr: { type: "field", tableAlias: "innerquery", column: "color" }, alias: "color" }); // innerquery.color as color
        }
        return outerquery;
    };
    // Gets the layer definition as JsonQL + CSS in format:
    //   {
    //     layers: array of { id: layer id, jsonql: jsonql that includes "the_webmercator_geom" as a column }
    //     css: carto css
    //     interactivity: (optional) { layer: id of layer, fields: array of field names }
    //   }
    // arguments:
    //   design: design of layer
    //   schema: schema to use
    //   filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to put in table alias
    MarkersLayer.prototype.getJsonQLCss = function (design, schema, filters) {
        // Create design
        var layerDef = {
            layers: [
                {
                    id: "layer0",
                    jsonql: this.createMapnikJsonQL(design, schema, filters)
                }
            ],
            css: this.createCss(design),
            interactivity: {
                layer: "layer0",
                fields: ["id"]
            }
        };
        return layerDef;
    };
    MarkersLayer.prototype.createMapnikJsonQL = function (design, schema, filters) {
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        var exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
        // Compile geometry axis
        var geometryExpr = axisBuilder.compileAxis({ axis: design.axes.geometry, tableAlias: "innerquery" });
        // Convert to Web mercator (3857)
        geometryExpr = { type: "op", op: "ST_Transform", exprs: [geometryExpr, 3857] };
        // row_number() over (partition by round(ST_XMin(location)/!pixel_width!*5), round(ST_YMin(location)/!pixel_height!*5)) AS r
        var cluster = {
            type: "select",
            expr: {
                type: "op",
                op: "row_number",
                exprs: [],
                over: { partitionBy: [
                        { type: "op", op: "round", exprs: [
                                { type: "op", op: "/", exprs: [
                                        { type: "op", op: "ST_XMin", exprs: [geometryExpr] },
                                        { type: "op", op: "*", exprs: [{ type: "token", token: "!pixel_width!" }, 5] }
                                    ] }
                            ] },
                        { type: "op", op: "round", exprs: [
                                { type: "op", op: "/", exprs: [
                                        { type: "op", op: "ST_YMin", exprs: [geometryExpr] },
                                        { type: "op", op: "*", exprs: [{ type: "token", token: "!pixel_height!" }, 5] }
                                    ] }
                            ] },
                    ] }
            },
            alias: "r"
        };
        // Select _id, location and clustered row number
        var innerquery = {
            type: "query",
            selects: [
                { type: "select", expr: { type: "field", tableAlias: "innerquery", column: schema.getTable(design.table).primaryKey }, alias: "id" },
                { type: "select", expr: geometryExpr, alias: "the_geom_webmercator" },
                cluster
            ],
            from: exprCompiler.compileTable(design.table, "innerquery")
        };
        // Add color select if color axis
        if (design.axes.color) {
            var colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "innerquery" });
            innerquery.selects.push({ type: "select", expr: colorExpr, alias: "color" });
        }
        // Create filters. First limit to bounding box
        var whereClauses = [
            {
                type: "op",
                op: "&&",
                exprs: [
                    geometryExpr,
                    { type: "token", token: "!bbox!" }
                ]
            }
        ];
        // Then add filters baked into layer
        if (design.filter) {
            whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "innerquery" }));
        }
        // Then add extra filters passed in, if relevant
        // Get relevant filters
        var relevantFilters = lodash_1.default.where(filters, { table: design.table });
        for (var _i = 0, relevantFilters_2 = relevantFilters; _i < relevantFilters_2.length; _i++) {
            var filter = relevantFilters_2[_i];
            whereClauses.push(mwater_expressions_1.injectTableAlias(filter.jsonql, "innerquery"));
        }
        whereClauses = lodash_1.default.compact(whereClauses);
        // Wrap if multiple
        if (whereClauses.length > 1) {
            innerquery.where = { type: "op", op: "and", exprs: whereClauses };
        }
        else {
            innerquery.where = whereClauses[0];
        }
        // Create outer query which takes where r <= 3 to limit # of points in a cluster
        var outerquery = {
            type: "query",
            selects: [
                { type: "select", expr: { type: "op", op: "::text", exprs: [{ type: "field", tableAlias: "innerquery", column: "id" }] }, alias: "id" },
                { type: "select", expr: { type: "field", tableAlias: "innerquery", column: "the_geom_webmercator" }, alias: "the_geom_webmercator" },
                { type: "select", expr: { type: "op", op: "ST_GeometryType", exprs: [{ type: "field", tableAlias: "innerquery", column: "the_geom_webmercator" }] }, alias: "geometry_type" } // ST_GeometryType(innerquery.the_geom_webmercator) as geometry_type
            ],
            from: { type: "subquery", query: innerquery, alias: "innerquery" },
            where: { type: "op", op: "<=", exprs: [{ type: "field", tableAlias: "innerquery", column: "r" }, 3] }
        };
        // Add color select if color axis
        if (design.axes.color) {
            outerquery.selects.push({ type: "select", expr: { type: "field", tableAlias: "innerquery", column: "color" }, alias: "color" }); // innerquery.color as color
        }
        return outerquery;
    };
    // Creates CartoCSS
    MarkersLayer.prototype.createCss = function (design) {
        var stroke, symbol;
        var css = "";
        if (design.symbol) {
            symbol = "marker-file: url(" + design.symbol + ");";
            stroke = "marker-line-width: 60;";
        }
        else {
            symbol = "marker-type: ellipse;";
            stroke = "marker-line-width: 1;";
        }
        // Should only display markers when it is a point geometry
        css += "#layer0[geometry_type='ST_Point'] {\n  marker-fill: " + (design.color || "#666666") + ";\nmarker-width: " + (design.markerSize || 10) + ";\nmarker-line-color: white;" + stroke + "marker-line-opacity: 0.6;\nmarker-placement: point;" + symbol + "  marker-allow-overlap: true;\n}\n#layer0 {\n  line-color: " + (design.color || "#666666") + ";\nline-width: " + ((design.lineWidth != null) ? design.lineWidth : "3") + ";\n}\n#layer0[geometry_type='ST_Polygon'],#layer0[geometry_type='ST_MultiPolygon'] {\n  polygon-fill: " + (design.color || "#666666") + ";\n  polygon-opacity: 0.25;\n}\n";
        // If color axes, add color conditions
        if (design.axes.color && design.axes.color.colorMap) {
            for (var _i = 0, _a = design.axes.color.colorMap; _i < _a.length; _i++) {
                var item = _a[_i];
                // If invisible
                if (lodash_1.default.includes(design.axes.color.excludedValues || [], item.value)) {
                    css += "#layer0[color=" + JSON.stringify(item.value) + "] { line-opacity: 0; marker-line-opacity: 0; marker-fill-opacity: 0; polygon-opacity: 0; }";
                }
                else {
                    css += "#layer0[color=" + JSON.stringify(item.value) + '] { line-color: ' + item.color + " }\n#layer0[color=" + JSON.stringify(item.value) + '][geometry_type=\'ST_Point\'] { marker-fill: ' + item.color + " }\n#layer0[color=" + JSON.stringify(item.value) + '][geometry_type=\'ST_Polygon\'],#layer0[color=' + JSON.stringify(item.value) + "][geometry_type='ST_MultiPolygon'] { \npolygon-fill: " + item.color + ";}";
                }
            }
        }
        return css;
    };
    // Called when the interactivity grid is clicked.
    // arguments:
    //   ev: { data: interactivty data e.g. `{ id: 123 }` }
    //   clickOptions:
    //     design: design of layer
    //     schema: schema to use
    //     dataSource: data source to use
    //     layerDataSource: layer data source
    //     scopeData: current scope data if layer is scoping
    //     filters: compiled filters to apply to the popup
    //
    // Returns:
    //   null/undefined
    //   or
    //   {
    //     scope: scope to apply ({ name, filter, data })
    //     row: { tableId:, primaryKey: }  # row that was selected
    //     popup: React element to put into a popup
    //   }
    MarkersLayer.prototype.onGridClick = function (ev, clickOptions) {
        // TODO abstract most to base class
        if (ev.data && ev.data.id) {
            var table = clickOptions.design.table;
            var results = {};
            // Scope toggle item if ctrl-click
            if (ev.event.originalEvent.shiftKey) {
                var ids = clickOptions.scopeData || [];
                if (ids.includes(ev.data.id)) {
                    ids = lodash_1.default.without(ids, ev.data.id);
                }
                else {
                    ids = ids.concat([ev.data.id]);
                }
                // Create filter for rows
                var filter = {
                    table: table,
                    jsonql: { type: "op", op: "=", modifier: "any", exprs: [
                            { type: "field", tableAlias: "{alias}", column: clickOptions.schema.getTable(table).primaryKey },
                            { type: "literal", value: ids }
                        ] }
                };
                // Scope to item
                if (ids.length > 0) {
                    results.scope = {
                        name: "Selected " + ids.length + " Markers(s)",
                        filter: filter,
                        data: ids
                    };
                }
                else {
                    results.scope = null;
                }
            }
            // Popup
            if (clickOptions.design.popup && !ev.event.originalEvent.shiftKey) {
                // Create filter using popupFilterJoins
                var popupFilterJoins = clickOptions.design.popupFilterJoins || PopupFilterJoinsUtils.createDefaultPopupFilterJoins(table);
                var popupFilters_1 = PopupFilterJoinsUtils.createPopupFilters(popupFilterJoins, clickOptions.schema, table, ev.data.id);
                var BlocksLayoutManager = require('../layouts/blocks/BlocksLayoutManager');
                var WidgetFactory_1 = require('../widgets/WidgetFactory');
                results.popup = new BlocksLayoutManager().renderLayout({
                    items: clickOptions.design.popup.items,
                    style: "popup",
                    renderWidget: function (options) {
                        var widget = WidgetFactory_1.createWidget(options.type);
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
                            height: options.height
                        });
                    }
                });
            }
            else if (!ev.event.originalEvent.shiftKey) {
                results.row = { tableId: table, primaryKey: ev.data.id };
            }
            return results;
        }
        else {
            return null;
        }
    };
    // Gets the bounds of the layer as GeoJSON
    MarkersLayer.prototype.getBounds = function (design, schema, dataSource, filters, callback) {
        return this.getBoundsFromExpr(schema, dataSource, design.table, design.axes.geometry.expr, design.filter || null, filters, callback);
    };
    // Get min and max zoom levels
    MarkersLayer.prototype.getMinZoom = function (design) { return design.minZoom; };
    MarkersLayer.prototype.getMaxZoom = function (design) { return design.maxZoom || 21; };
    // Get the legend to be optionally displayed on the map. Returns
    // a React element
    MarkersLayer.prototype.getLegend = function (design, schema, name, dataSource, locale, filters) {
        var _filters = filters.slice();
        if (design.filter != null) {
            var exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
            var jsonql = exprCompiler.compileExpr({ expr: design.filter, tableAlias: "{alias}" });
            if (jsonql) {
                _filters.push({ table: design.filter.table, jsonql: jsonql });
            }
        }
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        return react_1.default.createElement(LayerLegendComponent, {
            schema: schema,
            defaultColor: design.color,
            symbol: design.symbol || 'font-awesome/circle',
            markerSize: design.markerSize,
            name: name,
            dataSource: dataSource,
            filters: lodash_1.default.compact(_filters),
            axis: axisBuilder.cleanAxis({ axis: design.axes.color || null, table: design.table, types: ['enum', 'text', 'boolean', 'date'], aggrNeed: "none" }),
            locale: locale
        });
    };
    // Get a list of table ids that can be filtered on
    MarkersLayer.prototype.getFilterableTables = function (design, schema) {
        if (design.table) {
            return [design.table];
        }
        else {
            return [];
        }
    };
    // True if layer can be edited
    MarkersLayer.prototype.isEditable = function () {
        return true;
    };
    // Creates a design element with specified options
    // options:
    //   design: design of layer
    //   schema: schema to use
    //   dataSource: data source to use
    //   onDesignChange: function called when design changes
    //   filters: array of filters
    MarkersLayer.prototype.createDesignerElement = function (options) {
        var _this = this;
        // Require here to prevent server require problems
        var MarkersLayerDesignerComponent = require('./MarkersLayerDesignerComponent');
        // Clean on way in and out
        return react_1.default.createElement(MarkersLayerDesignerComponent, {
            schema: options.schema,
            dataSource: options.dataSource,
            design: this.cleanDesign(options.design, options.schema),
            filters: options.filters,
            onDesignChange: function (design) {
                return options.onDesignChange(_this.cleanDesign(design, options.schema));
            }
        });
    };
    // Returns a cleaned design
    MarkersLayer.prototype.cleanDesign = function (design, schema) {
        var exprCleaner = new mwater_expressions_1.ExprCleaner(schema);
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        // Migrate legacy sublayers
        if (design.sublayers) {
            design = lodash_1.default.extend({}, design, design.sublayers[0]);
            delete design.sublayers;
        }
        design = immer_1.produce(design, function (draft) {
            draft.axes = design.axes || {};
            draft.color = design.color || "#0088FF";
            draft.axes.geometry = axisBuilder.cleanAxis({ axis: (draft.axes.geometry ? immer_1.original(draft.axes.geometry) || null : null), table: design.table, types: ['geometry'], aggrNeed: "none" });
            draft.axes.color = axisBuilder.cleanAxis({ axis: (draft.axes.color ? immer_1.original(draft.axes.color) || null : null), table: design.table, types: ['enum', 'text', 'boolean', 'date'], aggrNeed: "none" });
            draft.filter = exprCleaner.cleanExpr(design.filter || null, { table: draft.table });
        });
        return design;
    };
    // Validates design. Null if ok, message otherwise
    MarkersLayer.prototype.validateDesign = function (design, schema) {
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        var exprValidator = new mwater_expressions_1.ExprValidator(schema);
        if (!design.table) {
            return "Missing table";
        }
        if (!design.axes || !design.axes.geometry) {
            return "Missing axes";
        }
        var error = axisBuilder.validateAxis({ axis: design.axes.geometry });
        if (error) {
            return error;
        }
        // Validate color
        error = axisBuilder.validateAxis({ axis: design.axes.color || null });
        if (error) {
            return error;
        }
        // Check that doesn't compile to null (persistent bug that haven't been able to track down)
        if (!axisBuilder.compileAxis({ axis: design.axes.geometry, tableAlias: "innerquery" })) {
            return "Null geometry axis";
        }
        // Validate filter
        error = exprValidator.validateExpr(design.filter || null);
        if (error) {
            return error;
        }
        return null;
    };
    MarkersLayer.prototype.createKMLExportJsonQL = function (design, schema, filters) {
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        var exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
        // Compile geometry axis
        var geometryExpr = axisBuilder.compileAxis({ axis: design.axes.geometry, tableAlias: "innerquery" });
        // Convert to Web mercator (3857)
        geometryExpr = { type: "op", op: "ST_Transform", exprs: [geometryExpr, 4326] };
        // Select _id, location and clustered row number
        var innerquery = {
            type: "query",
            selects: [
                { type: "select", expr: { type: "field", tableAlias: "innerquery", column: schema.getTable(design.table).primaryKey }, alias: "id" },
                { type: "select", expr: { type: "op", op: "ST_XMIN", exprs: [geometryExpr] }, alias: "longitude" },
                { type: "select", expr: { type: "op", op: "ST_YMIN", exprs: [geometryExpr] }, alias: "latitude" } // innerquery.the_geom_webmercator as the_geom_webmercator
            ],
            from: exprCompiler.compileTable(design.table, "innerquery")
        };
        var extraFields = ["code", "name", "desc", "type", "photos"];
        for (var _i = 0, extraFields_1 = extraFields; _i < extraFields_1.length; _i++) {
            var field = extraFields_1[_i];
            var column = schema.getColumn(design.table, field);
            if (column) {
                innerquery.selects.push({ type: "select", expr: { type: "field", tableAlias: "innerquery", column: field }, alias: field });
            }
        }
        // Add color select if color axis
        if (design.axes.color) {
            var colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "innerquery" });
            var valueExpr = exprCompiler.compileExpr({ expr: design.axes.color.expr, tableAlias: "innerquery" });
            innerquery.selects.push({ type: "select", expr: colorExpr, alias: "color" });
            innerquery.selects.push({ type: "select", expr: valueExpr, alias: "value" });
        }
        // Create filters. First limit to bounding box
        var whereClauses = [];
        // Then add filters baked into layer
        if (design.filter) {
            whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "innerquery" }));
        }
        // Then add extra filters passed in, if relevant
        // Get relevant filters
        var relevantFilters = lodash_1.default.where(filters, { table: design.table });
        for (var _a = 0, relevantFilters_3 = relevantFilters; _a < relevantFilters_3.length; _a++) {
            var filter = relevantFilters_3[_a];
            whereClauses.push(mwater_expressions_1.injectTableAlias(filter.jsonql, "innerquery"));
        }
        whereClauses = lodash_1.default.compact(whereClauses);
        // Wrap if multiple
        if (whereClauses.length > 1) {
            innerquery.where = { type: "op", op: "and", exprs: whereClauses };
        }
        else {
            innerquery.where = whereClauses[0];
        }
        return innerquery;
    };
    MarkersLayer.prototype.createKMLExportStyleInfo = function (design, schema, filters) {
        var symbol;
        if (design.symbol) {
            (symbol = design.symbol);
        }
        else {
            symbol = "font-awesome/circle";
        }
        var style = {
            color: design.color,
            symbol: symbol
        };
        if (design.axes.color && design.axes.color.colorMap) {
            style.colorMap = design.axes.color.colorMap;
        }
        return style;
    };
    MarkersLayer.prototype.getKMLExportJsonQL = function (design, schema, filters) {
        var layerDef = {
            layers: [
                {
                    id: "layer0",
                    jsonql: this.createKMLExportJsonQL(design, schema, filters),
                    style: this.createKMLExportStyleInfo(design, schema, filters)
                }
            ]
        };
        return layerDef;
    };
    MarkersLayer.prototype.acceptKmlVisitorForRow = function (visitor, row) {
        return visitor.addPoint(row.latitude, row.longitude, row.name, visitor.buildDescription(row), row.color);
    };
    return MarkersLayer;
}(Layer_1.default));
exports.default = MarkersLayer;
