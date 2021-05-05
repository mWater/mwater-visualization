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
var lodash_1 = __importDefault(require("lodash"));
var immer_1 = __importStar(require("immer"));
var mwater_expressions_1 = require("mwater-expressions");
var react_1 = __importDefault(require("react"));
var AxisBuilder_1 = __importDefault(require("../axes/AxisBuilder"));
var Layer_1 = __importDefault(require("./Layer"));
var mapboxUtils_1 = require("./mapboxUtils");
var LegendGroup = require('./LegendGroup');
var LayerLegendComponent = require('./LayerLegendComponent');
var PopupFilterJoinsUtils = require('./PopupFilterJoinsUtils');
/*
Layer which draws a buffer around geometries (i.e. a radius circle around points)

Design is:
  table: table to get data from
  axes: axes (see below)
  filter: optional logical expression to filter by
  color: color of layer (e.g. #FF8800). Color axis overrides
  fillOpacity: Opacity to fill the circles (0-1)
  radius: radius to draw in meters
  minZoom: minimum zoom level
  maxZoom: maximum zoom level

  popup: contains items: which is BlocksLayoutManager items. Will be displayed when the circle is clicked
  popupFilterJoins: customizable filtering for popup. See PopupFilterJoins.md

axes:
  geometry: where to draw buffers around
  color: color axis

*/
var BufferLayer = /** @class */ (function (_super) {
    __extends(BufferLayer, _super);
    function BufferLayer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /** Gets the type of layer definition */
    BufferLayer.prototype.getLayerDefinitionType = function () { return "VectorTile"; };
    BufferLayer.prototype.getVectorTile = function (design, sourceId, schema, filters, opacity) {
        var jsonql = this.createJsonQL(design, schema, filters);
        var mapLayers = [];
        // If color axes, add color conditions
        var color = mapboxUtils_1.compileColorMapToMapbox(design.axes.color, design.color || "transparent");
        mapLayers.push({
            'id': sourceId + ":fill",
            'type': 'fill',
            'source': sourceId,
            'source-layer': 'circles',
            paint: {
                'fill-opacity': design.fillOpacity * opacity,
                "fill-color": color,
                "fill-outline-color": "transparent"
            }
        });
        // if (design.borderStyle == "color") {
        //   mapLayers.push({
        //     'id': `${sourceId}:line`,
        //     'type': 'line',
        //     'source': sourceId,
        //     'source-layer': 'grid',
        //     paint: {
        //       "line-color": color,
        //       // Make darker if fill opacity is higher
        //       "line-opacity": (1 - (1 - design.fillOpacity!) / 2) * opacity,
        //       "line-width": 1
        //     }
        //   })
        // }
        return {
            sourceLayers: [
                { id: "circles", jsonql: jsonql }
            ],
            ctes: [],
            mapLayers: mapLayers,
            mapLayersHandleClicks: [sourceId + ":fill"]
        };
    };
    BufferLayer.prototype.createJsonQL = function (design, schema, filters) {
        var colorExpr;
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        var exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
        // Expression for the envelope of the tile
        var envelopeExpr = { type: "scalar", from: { type: "table", table: "tile", alias: "tile" },
            expr: { type: "field", tableAlias: "tile", column: "envelope" } };
        /*
        Query:
          select
          <primary key> as id,
          [<color axis> as color,
          ST_AsMVTGeom(<geometry axis>, (select tile.envelope from tile as tile) as the_geom_webmercator,
          from <table> as main
          where
            <geometry axis> is not null
            * Bounding box filter for speed
          and <geometry axis> &&
          ST_Transform(ST_Expand(
            * Prevent 3857 overflow (i.e. > 85 degrees lat)
            ST_Intersection(
              ST_Transform(!bbox!, 4326),
              ST_Expand(ST_MakeEnvelope(-180, -85, 180, 85, 4326), -<radius in degrees>))
            , <radius in degrees>})
          , 3857)
          and <other filters>
        */
        // Compile geometry axis
        var geometryExpr = axisBuilder.compileAxis({ axis: design.axes.geometry, tableAlias: "main" });
        // radius / cos(st_ymax(st_transform(geometryExpr, 4326)) * 0.017453293) 
        var bufferAmountExpr = {
            type: "op",
            op: "/",
            exprs: [
                design.radius,
                { type: "op", op: "cos", exprs: [
                        { type: "op", op: "*", exprs: [
                                { type: "op", op: "ST_YMax", exprs: [{ type: "op", op: "ST_Transform", exprs: [geometryExpr, 4326] }] },
                                0.017453293
                            ] }
                    ] }
            ]
        };
        var bufferExpr = {
            type: "op",
            op: "ST_Buffer",
            exprs: [geometryExpr, bufferAmountExpr]
        };
        var selects = [
            { type: "select", expr: { type: "field", tableAlias: "main", column: schema.getTable(design.table).primaryKey }, alias: "id" },
            { type: "select", expr: { type: "op", op: "ST_AsMVTGeom", exprs: [bufferExpr, envelopeExpr] }, alias: "the_geom_webmercator" },
        ];
        // Add color select if color axis
        if (design.axes.color) {
            colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "main" });
            selects.push({ type: "select", expr: colorExpr, alias: "color" });
        }
        // Create select
        var query = {
            type: "query",
            selects: selects,
            from: exprCompiler.compileTable(design.table, "main")
        };
        // To prevent buffer from exceeding coordinates
        // ST_Transform(ST_Expand(
        //     # Prevent 3857 overflow (i.e. > 85 degrees lat)
        //     ST_Intersection(
        //       ST_Transform(!bbox!, 4326),
        //       ST_Expand(ST_MakeEnvelope(-180, -85, 180, 85, 4326), -<radius in degrees>))
        //     , <radius in degrees>})
        //   , 3857)
        // TODO document how we compute this
        var radiusDeg = design.radius / 100000;
        var boundingBox = {
            type: "op",
            op: "ST_Transform",
            exprs: [
                { type: "op", op: "ST_Expand", exprs: [
                        { type: "op", op: "ST_Intersection", exprs: [
                                { type: "op", op: "ST_Transform", exprs: [
                                        envelopeExpr,
                                        4326
                                    ] },
                                { type: "op", op: "ST_Expand", exprs: [
                                        { type: "op", op: "ST_MakeEnvelope", exprs: [-180, -85, 180, 85, 4326] },
                                        -radiusDeg
                                    ] }
                            ] },
                        radiusDeg
                    ] },
                3857
            ]
        };
        // Create filters. First ensure geometry and limit to bounding box
        var whereClauses = [
            { type: "op", op: "is not null", exprs: [geometryExpr] },
            {
                type: "op",
                op: "&&",
                exprs: [
                    geometryExpr,
                    boundingBox
                ]
            }
        ];
        // Then add filters baked into layer
        if (design.filter) {
            whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "main" }));
        }
        // Then add extra filters passed in, if relevant
        // Get relevant filters
        var relevantFilters = lodash_1.default.where(filters, { table: design.table });
        for (var _i = 0, relevantFilters_1 = relevantFilters; _i < relevantFilters_1.length; _i++) {
            var filter = relevantFilters_1[_i];
            whereClauses.push(mwater_expressions_1.injectTableAlias(filter.jsonql, "main"));
        }
        whereClauses = lodash_1.default.compact(whereClauses);
        // Wrap if multiple
        if (whereClauses.length > 1) {
            query.where = { type: "op", op: "and", exprs: whereClauses };
        }
        else {
            query.where = whereClauses[0];
        }
        // Sort order
        if (design.axes.color && design.axes.color.colorMap) {
            // TODO should use categories, not colormap order
            var order_1 = design.axes.color.drawOrder || lodash_1.default.pluck(design.axes.color.colorMap, "value");
            var categories = axisBuilder.getCategories(design.axes.color, order_1);
            var cases = lodash_1.default.map(categories, function (category, i) {
                return {
                    when: (category.value != null) ? { type: "op", op: "=", exprs: [colorExpr, category.value] } : { type: "op", op: "is null", exprs: [colorExpr] },
                    then: order_1.indexOf(category.value) || -1
                };
            });
            if (cases.length > 0) {
                query.orderBy = [
                    {
                        expr: {
                            type: "case",
                            cases: cases
                        },
                        direction: "desc" // Reverse color map order
                    }
                ];
            }
        }
        return query;
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
    BufferLayer.prototype.getJsonQLCss = function (design, schema, filters) {
        // Create design
        var layerDef = {
            layers: [{ id: "layer0", jsonql: this.createMapnikJsonQL(design, schema, filters) }],
            css: this.createCss(design, schema),
            interactivity: {
                layer: "layer0",
                fields: ["id"]
            }
        };
        return layerDef;
    };
    BufferLayer.prototype.createMapnikJsonQL = function (design, schema, filters) {
        var colorExpr;
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        var exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
        /*
        Query:
          select
          <primary key> as id,
          [<color axis> as color,
          st_transform(<geometry axis>, 3857) as the_geom_webmercator,
          radius * 2 / (!pixel_width! * cos(st_ymin(st_transform(geometryExpr, 4326)) * 0.017453293) as width
          from <table> as main
          where
            <geometry axis> is not null
            * Bounding box filter for speed
          and <geometry axis> &&
          ST_Transform(ST_Expand(
            * Prevent 3857 overflow (i.e. > 85 degrees lat)
            ST_Intersection(
              ST_Transform(!bbox!, 4326),
              ST_Expand(ST_MakeEnvelope(-180, -85, 180, 85, 4326), -<radius in degrees>))
            , <radius in degrees>})
          , 3857)
          and <other filters>
        */
        // Compile geometry axis
        var geometryExpr = axisBuilder.compileAxis({ axis: design.axes.geometry, tableAlias: "main" });
        // radius * 2 / (!pixel_width! * cos(st_ymin(st_transform(geometryExpr, 4326)) * 0.017453293) + 1 # add one to make always visible
        var widthExpr = {
            type: "op",
            op: "+",
            exprs: [
                {
                    type: "op",
                    op: "/",
                    exprs: [{ type: "op", op: "*", exprs: [design.radius, 2] }, { type: "op", op: "*", exprs: [
                                { type: "op", op: "nullif", exprs: [{ type: "token", token: "!pixel_height!" }, 0] },
                                { type: "op", op: "cos", exprs: [
                                        { type: "op", op: "*", exprs: [
                                                { type: "op", op: "ST_YMIN", exprs: [{ type: "op", op: "ST_Transform", exprs: [geometryExpr, 4326] }] },
                                                0.017453293
                                            ] }
                                    ] }
                            ] }
                    ]
                },
                2
            ]
        };
        var selects = [
            { type: "select", expr: { type: "field", tableAlias: "main", column: schema.getTable(design.table).primaryKey }, alias: "id" },
            { type: "select", expr: geometryExpr, alias: "the_geom_webmercator" },
            { type: "select", expr: widthExpr, alias: "width" } // Width of circles
        ];
        // Add color select if color axis
        if (design.axes.color) {
            colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "main" });
            selects.push({ type: "select", expr: colorExpr, alias: "color" });
        }
        // Select _id, location and clustered row number
        var query = {
            type: "query",
            selects: selects,
            from: exprCompiler.compileTable(design.table, "main")
        };
        // ST_Transform(ST_Expand(
        //     # Prevent 3857 overflow (i.e. > 85 degrees lat)
        //     ST_Intersection(
        //       ST_Transform(!bbox!, 4326),
        //       ST_Expand(ST_MakeEnvelope(-180, -85, 180, 85, 4326), -<radius in degrees>))
        //     , <radius in degrees>})
        //   , 3857)
        // TODO document how we compute this
        var radiusDeg = design.radius / 100000;
        var boundingBox = {
            type: "op",
            op: "ST_Transform",
            exprs: [
                { type: "op", op: "ST_Expand", exprs: [
                        { type: "op", op: "ST_Intersection", exprs: [
                                { type: "op", op: "ST_Transform", exprs: [
                                        { type: "token", token: "!bbox!" },
                                        4326
                                    ] },
                                { type: "op", op: "ST_Expand", exprs: [
                                        { type: "op", op: "ST_MakeEnvelope", exprs: [-180, -85, 180, 85, 4326] },
                                        -radiusDeg
                                    ] }
                            ] },
                        radiusDeg
                    ] },
                3857
            ]
        };
        // Create filters. First ensure geometry and limit to bounding box
        var whereClauses = [
            { type: "op", op: "is not null", exprs: [geometryExpr] },
            {
                type: "op",
                op: "&&",
                exprs: [
                    geometryExpr,
                    boundingBox
                ]
            }
        ];
        // Then add filters baked into layer
        if (design.filter) {
            whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "main" }));
        }
        // Then add extra filters passed in, if relevant
        // Get relevant filters
        var relevantFilters = lodash_1.default.where(filters, { table: design.table });
        for (var _i = 0, relevantFilters_2 = relevantFilters; _i < relevantFilters_2.length; _i++) {
            var filter = relevantFilters_2[_i];
            whereClauses.push(mwater_expressions_1.injectTableAlias(filter.jsonql, "main"));
        }
        whereClauses = lodash_1.default.compact(whereClauses);
        // Wrap if multiple
        if (whereClauses.length > 1) {
            query.where = { type: "op", op: "and", exprs: whereClauses };
        }
        else {
            query.where = whereClauses[0];
        }
        // Sort order
        if (design.axes.color && design.axes.color.colorMap) {
            // TODO should use categories, not colormap order
            var order_2 = design.axes.color.drawOrder || lodash_1.default.pluck(design.axes.color.colorMap, "value");
            var categories = axisBuilder.getCategories(design.axes.color, order_2);
            var cases = lodash_1.default.map(categories, function (category, i) {
                return {
                    when: (category.value != null) ? { type: "op", op: "=", exprs: [colorExpr, category.value] } : { type: "op", op: "is null", exprs: [colorExpr] },
                    then: order_2.indexOf(category.value) || -1
                };
            });
            if (cases.length > 0) {
                query.orderBy = [
                    {
                        expr: {
                            type: "case",
                            cases: cases
                        },
                        direction: "desc" // Reverse color map order
                    }
                ];
            }
        }
        return query;
    };
    BufferLayer.prototype.createCss = function (design, schema) {
        var css = "#layer0 {\n  marker-fill-opacity: " + design.fillOpacity + ";\nmarker-type: ellipse;\nmarker-width: [width];\nmarker-line-width: 0;\nmarker-allow-overlap: true;\nmarker-ignore-placement: true;\nmarker-fill: " + (design.color || "transparent") + ";\n}";
        // If color axes, add color conditions
        if (design.axes.color != null && design.axes.color.colorMap != null) {
            for (var _i = 0, _a = design.axes.color.colorMap; _i < _a.length; _i++) {
                var item = _a[_i];
                // If invisible
                if ((design.axes.color.excludedValues || []).includes(item.value)) {
                    css += "#layer0 [color=" + JSON.stringify(item.value) + "] { marker-fill-opacity: 0; }\n";
                }
                else {
                    css += "#layer0 [color=" + JSON.stringify(item.value) + "] { marker-fill: " + item.color + "; }\n";
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
    BufferLayer.prototype.onGridClick = function (ev, clickOptions) {
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
                // Create filter expression for rows
                var filterExpr = {
                    table: table,
                    type: "op",
                    op: "= any",
                    exprs: [
                        { type: "id", table: table },
                        { type: "literal", valueType: "id[]", value: ids }
                    ]
                };
                // Scope to item
                if (ids.length > 0) {
                    results.scope = {
                        name: "Selected " + ids.length + " Circle(s)",
                        filter: filter,
                        filterExpr: filterExpr,
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
    BufferLayer.prototype.getBounds = function (design, schema, dataSource, filters, callback) {
        // TODO technically should pad for the radius, but we always pad by 20% anyway so it should be fine
        return this.getBoundsFromExpr(schema, dataSource, design.table, design.axes.geometry.expr, design.filter || null, filters, callback);
    };
    BufferLayer.prototype.getMinZoom = function (design) { return design.minZoom; };
    // Removed as was making deceptively not present
    // # Get min and max zoom levels
    // getMinZoom: (design) ->
    //   # Earth is 40000km around, is 256 pixels. So zoom z radius map of r takes up 2*r*256*2^z/40000000 meters.
    //   # So zoom with 5 pixels across = log2(4000000*5/(2*r*256))
    //   if design.radius
    //     zoom = Math.ceil(Math.log(40000000*5/(2*design.radius*256))/Math.log(2))
    //     if design.minZoom?
    //       return Math.max(zoom, design.minZoom)
    //     return zoom
    //   else
    //     return design.minZoom
    BufferLayer.prototype.getMaxZoom = function (design) { return design.maxZoom || 21; };
    // Get the legend to be optionally displayed on the map. Returns
    // a React element
    BufferLayer.prototype.getLegend = function (design, schema, name, dataSource, locale, filters) {
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
            name: name,
            dataSource: dataSource,
            filters: lodash_1.default.compact(_filters),
            axis: axisBuilder.cleanAxis({ axis: design.axes.color, table: design.table, types: ['enum', 'text', 'boolean', 'date'], aggrNeed: "none" }),
            radiusLayer: true,
            defaultColor: design.color,
            locale: locale
        });
    };
    // Get a list of table ids that can be filtered on
    BufferLayer.prototype.getFilterableTables = function (design, schema) {
        if (design.table) {
            return [design.table];
        }
        else {
            return [];
        }
    };
    // True if layer can be edited
    BufferLayer.prototype.isEditable = function () { return true; };
    // True if layer is incomplete (e.g. brand new) and should be editable immediately
    BufferLayer.prototype.isIncomplete = function (design, schema) {
        return (this.validateDesign(design, schema) != null);
    };
    // Creates a design element with specified options
    // options:
    //   design: design of layer
    //   schema: schema to use
    //   dataSource: data source to use
    //   onDesignChange: function called when design changes
    //   filters: array of filters
    BufferLayer.prototype.createDesignerElement = function (options) {
        var _this = this;
        // Require here to prevent server require problems
        var BufferLayerDesignerComponent = require('./BufferLayerDesignerComponent');
        // Clean on way in and out
        return react_1.default.createElement(BufferLayerDesignerComponent, {
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
    BufferLayer.prototype.cleanDesign = function (design, schema) {
        var exprCleaner = new mwater_expressions_1.ExprCleaner(schema);
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        design = immer_1.default(design, function (draft) {
            // Default color
            draft.color = design.color || "#0088FF";
            draft.axes = design.axes || {};
            draft.radius = design.radius || 1000;
            draft.fillOpacity = (design.fillOpacity != null) ? design.fillOpacity : 0.5;
            draft.axes.geometry = axisBuilder.cleanAxis({ axis: (draft.axes.geometry ? immer_1.original(draft.axes.geometry) || null : null), table: design.table, types: ['geometry'], aggrNeed: "none" });
            draft.axes.color = axisBuilder.cleanAxis({ axis: (draft.axes.color ? immer_1.original(draft.axes.color) || null : null), table: design.table, types: ['enum', 'text', 'boolean', 'date'], aggrNeed: "none" });
            draft.filter = exprCleaner.cleanExpr(design.filter || null, { table: design.table });
        });
        return design;
    };
    // Validates design. Null if ok, message otherwise
    BufferLayer.prototype.validateDesign = function (design, schema) {
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        var exprValidator = new mwater_expressions_1.ExprValidator(schema);
        if (!design.table) {
            return "Missing table";
        }
        if ((design.radius == null)) {
            return "Missing radius";
        }
        if (!design.axes || !design.axes.geometry) {
            return "Missing axes";
        }
        var error = axisBuilder.validateAxis({ axis: design.axes.geometry });
        if (error) {
            return error;
        }
        error = axisBuilder.validateAxis({ axis: design.axes.color });
        if (error) {
            return error;
        }
        // Validate filter
        error = exprValidator.validateExpr(design.filter || null);
        if (error) {
            return error;
        }
        return null;
    };
    BufferLayer.prototype.createKMLExportJsonQL = function (design, schema, filters) {
        var colorExpr;
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        var exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
        // Compile geometry axis
        var geometryExpr = axisBuilder.compileAxis({ axis: design.axes.geometry, tableAlias: "main" });
        // st_transform(st_buffer(st_transform(<geometry axis>, 4326)::geography, <radius>)::geometry, 3857) as the_geom_webmercator
        var bufferedGeometry = {
            type: "op", op: "ST_AsGeoJson", exprs: [
                { type: "op", op: "::geometry", exprs: [
                        { type: "op", op: "ST_Buffer", exprs: [
                                { type: "op", op: "::geography", exprs: [{ type: "op", op: "ST_Transform", exprs: [geometryExpr, 4326] }] },
                                design.radius
                            ] }
                    ] }
            ]
        };
        var selects = [
            { type: "select", expr: { type: "field", tableAlias: "main", column: schema.getTable(design.table).primaryKey }, alias: "id" },
            { type: "select", expr: bufferedGeometry, alias: "the_geom_webmercator" }
        ];
        var extraFields = ["code", "name", "desc", "type", "photos"];
        for (var _i = 0, extraFields_1 = extraFields; _i < extraFields_1.length; _i++) {
            var field = extraFields_1[_i];
            var column = schema.getColumn(design.table, field);
            if (column) {
                selects.push({ type: "select", expr: { type: "field", tableAlias: "main", column: field }, alias: field });
            }
        }
        // Add color select if color axis
        if (design.axes.color) {
            var valueExpr = exprCompiler.compileExpr({ expr: design.axes.color.expr, tableAlias: "main" });
            colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "main" });
            selects.push({ type: "select", expr: valueExpr, alias: "value" });
            selects.push({ type: "select", expr: colorExpr, alias: "color" });
        }
        // Select _id, location and clustered row number
        var query = {
            type: "query",
            selects: selects,
            from: exprCompiler.compileTable(design.table, "main")
        };
        // ST_Transform(ST_Expand(
        //     # Prevent 3857 overflow (i.e. > 85 degrees lat)
        //     ST_Intersection(
        //       ST_Transform(!bbox!, 4326),
        //       ST_Expand(ST_MakeEnvelope(-180, -85, 180, 85, 4326), -<radius in degrees>))
        //     , <radius in degrees>})
        //   , 3857)
        // TODO document how we compute this
        var radiusDeg = design.radius / 100000;
        // Create filters. First ensure geometry and limit to bounding box
        var whereClauses = [
            { type: "op", op: "is not null", exprs: [geometryExpr] }
        ];
        // Then add filters baked into layer
        if (design.filter) {
            whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "main" }));
        }
        // Then add extra filters passed in, if relevant
        // Get relevant filters
        var relevantFilters = lodash_1.default.where(filters, { table: design.table });
        for (var _a = 0, relevantFilters_3 = relevantFilters; _a < relevantFilters_3.length; _a++) {
            var filter = relevantFilters_3[_a];
            whereClauses.push(mwater_expressions_1.injectTableAlias(filter.jsonql, "main"));
        }
        whereClauses = lodash_1.default.compact(whereClauses);
        // Wrap if multiple
        if (whereClauses.length > 1) {
            query.where = { type: "op", op: "and", exprs: whereClauses };
        }
        else {
            query.where = whereClauses[0];
        }
        if (design.axes.color && design.axes.color.colorMap) {
            var order_3 = design.axes.color.drawOrder || lodash_1.default.pluck(design.axes.color.colorMap, "value");
            var categories = axisBuilder.getCategories(design.axes.color, lodash_1.default.pluck(design.axes.color.colorMap, "value"));
            var cases = lodash_1.default.map(categories, function (category, i) {
                return {
                    when: (category.value != null) ? { type: "op", op: "=", exprs: [colorExpr, category.value] } : { type: "op", op: "is null", exprs: [colorExpr] },
                    then: order_3.indexOf(category.value) || -1
                };
            });
            if (cases.length > 0) {
                query.orderBy = [
                    {
                        expr: {
                            type: "case",
                            cases: cases
                        },
                        direction: "desc" // Reverse color map order
                    }
                ];
            }
        }
        return query;
    };
    BufferLayer.prototype.getKMLExportJsonQL = function (design, schema, filters) {
        var style = {
            color: design.color,
            opacity: design.fillOpacity
        };
        if (design.axes.color && design.axes.color.colorMap) {
            style.colorMap = design.axes.color.colorMap;
        }
        var layerDef = {
            layers: [{ id: "layer0", jsonql: this.createKMLExportJsonQL(design, schema, filters), style: style }]
        };
        return layerDef;
    };
    BufferLayer.prototype.acceptKmlVisitorForRow = function (visitor, row) {
        var data = JSON.parse(row.the_geom_webmercator);
        var outer = data.coordinates[0];
        var inner = data.coordinates.slice(1);
        var list = lodash_1.default.map(outer, function (coordinates) { return coordinates.join(","); });
        return visitor.addPolygon(list.join(" "), row.color, false, row.name, visitor.buildDescription(row));
    };
    return BufferLayer;
}(Layer_1.default));
exports.default = BufferLayer;
