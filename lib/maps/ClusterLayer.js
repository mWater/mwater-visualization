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
var immer_1 = __importStar(require("immer"));
var lodash_1 = __importDefault(require("lodash"));
var mwater_expressions_1 = require("mwater-expressions");
var react_1 = __importDefault(require("react"));
var AxisBuilder_1 = __importDefault(require("../axes/AxisBuilder"));
var Layer_1 = __importDefault(require("./Layer"));
var LayerLegendComponent = require('./LayerLegendComponent');
var ClusterLayer = /** @class */ (function (_super) {
    __extends(ClusterLayer, _super);
    function ClusterLayer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /** Gets the type of layer definition */
    ClusterLayer.prototype.getLayerDefinitionType = function () { return "VectorTile"; };
    ClusterLayer.prototype.getVectorTile = function (design, sourceId, schema, filters, opacity) {
        var jsonql = this.createJsonQL(design, schema, filters);
        var mapLayers = [];
        mapLayers.push({
            'id': sourceId + ":circles-single",
            'type': 'circle',
            'source': sourceId,
            'source-layer': 'clusters',
            paint: {
                "circle-color": design.fillColor || "#337ab7",
                "circle-opacity": opacity,
                "circle-stroke-color": "white",
                "circle-stroke-width": 2,
                "circle-stroke-opacity": 0.6 * opacity,
                "circle-radius": 5
            },
            filter: ['==', ["to-number", ['get', 'cnt']], 1]
        });
        mapLayers.push({
            'id': sourceId + ":circles-multiple",
            'type': 'circle',
            'source': sourceId,
            'source-layer': 'clusters',
            paint: {
                "circle-color": design.fillColor || "#337ab7",
                "circle-opacity": opacity,
                "circle-stroke-color": "white",
                "circle-stroke-width": 4,
                "circle-stroke-opacity": 0.6 * opacity,
                "circle-radius": ["to-number", ['get', 'size']]
            },
            filter: ['>', ["to-number", ['get', 'cnt']], 1]
        });
        mapLayers.push({
            'id': sourceId + ":labels",
            'type': 'symbol',
            'source': sourceId,
            'source-layer': 'clusters',
            layout: {
                "text-field": ['get', 'cnt'],
                "text-size": 10
            },
            paint: {
                "text-color": (design.textColor || "white"),
                "text-opacity": 1
            },
            filter: ['>', ["to-number", ['get', 'cnt']], 1]
        });
        return {
            sourceLayers: [
                { id: "clusters", jsonql: jsonql }
            ],
            ctes: [],
            mapLayers: mapLayers,
            mapLayersHandleClicks: [sourceId + ":circles-single", sourceId + ":circles-multiple"]
        };
    };
    ClusterLayer.prototype.createJsonQL = function (design, schema, filters) {
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        var exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
        /*
        Query:
          Works by first snapping to grid and then clustering the clusters with slower DBSCAN method
    
          select
            ST_AsMVTGeom(ST_Centroid(ST_Collect(center)), tile.envelope) as the_geom_webmercator,
            sum(cnt) as cnt,
            log(sum(cnt)) * 6 + 14 as size from
              (
                select
                ST_ClusterDBSCAN(center, (tile.scale / 8), 1) over () as clust,
                sub1.center as center,
                cnt as cnt
                from
                (
                  select
                  count(*) as cnt,
                  ST_Centroid(ST_Collect(<geometry axis>)) as center,
                  ST_Snaptogrid(<geometry axis>, tile.scale/6, tile.scale/6) as grid
                  from <table> as main, tile as tile
                  where <geometry axis> && !bbox!
                    and <geometry axis> is not null
                    and <other filters>
                  group by 3
                ) as sub1
              ) as sub2, tile as tile
            group by sub2.clust
    
        */
        // Compile geometry axis
        var geometryExpr = axisBuilder.compileAxis({ axis: design.axes.geometry, tableAlias: "main" });
        // Convert to Web mercator (3857)
        geometryExpr = { type: "op", op: "ST_Transform", exprs: [geometryExpr, 3857] };
        // ST_Centroid(ST_Collect(<geometry axis>))
        var centerExpr = {
            type: "op",
            op: "ST_Centroid",
            exprs: [
                {
                    type: "op",
                    op: "ST_Collect",
                    exprs: [geometryExpr]
                }
            ]
        };
        // ST_Snaptogrid(<geometry axis>, !pixel_width!*40, !pixel_height!*40)
        var gridExpr = {
            type: "op",
            op: "ST_Snaptogrid",
            exprs: [
                geometryExpr,
                {
                    type: "op",
                    op: "/",
                    exprs: [{ type: "field", tableAlias: "tile", column: "scale" }, 6]
                },
                {
                    type: "op",
                    op: "/",
                    exprs: [{ type: "field", tableAlias: "tile", column: "scale" }, 6]
                }
            ]
        };
        // Create inner query
        var innerQuery = {
            type: "query",
            selects: [
                { type: "select", expr: { type: "op", op: "count", exprs: [] }, alias: "cnt" },
                { type: "select", expr: centerExpr, alias: "center" },
                { type: "select", expr: gridExpr, alias: "grid" }
            ],
            from: {
                type: "join",
                kind: "cross",
                left: exprCompiler.compileTable(design.table, "main"),
                right: { type: "table", table: "tile", alias: "tile" }
            },
            groupBy: [3]
        };
        // Create filters. First ensure geometry and limit to bounding box
        var whereClauses = [
            {
                type: "op",
                op: "&&",
                exprs: [
                    geometryExpr,
                    { type: "field", tableAlias: "tile", column: "envelope" }
                ]
            }
        ];
        // Then add filters baked into layer
        if (design.filter) {
            whereClauses.push(exprCompiler.compileExpr({ expr: design.filter || null, tableAlias: "main" }));
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
            innerQuery.where = { type: "op", op: "and", exprs: whereClauses };
        }
        else {
            innerQuery.where = whereClauses[0];
        }
        // Create next level
        // select 
        // ST_ClusterDBSCAN(center, (tile.scale / 8), 1) over () as clust,
        // sub1.center as center,
        // cnt as cnt from () as innerquery
        var clustExpr = {
            type: "op",
            op: "ST_ClusterDBSCAN",
            exprs: [
                { type: "field", tableAlias: "innerquery", column: "center" },
                { type: "op", op: "/", exprs: [{ type: "field", tableAlias: "tile", column: "scale" }, 8] },
                1
            ],
            over: {}
        };
        var inner2Query = {
            type: "query",
            selects: [
                { type: "select", expr: clustExpr, alias: "clust" },
                { type: "select", expr: { type: "field", tableAlias: "innerquery", column: "center" }, alias: "center" },
                { type: "select", expr: { type: "field", tableAlias: "innerquery", column: "cnt" }, alias: "cnt" }
            ],
            from: {
                type: "join",
                kind: "cross",
                left: { type: "subquery", query: innerQuery, alias: "innerquery" },
                right: { type: "table", table: "tile", alias: "tile" }
            }
        };
        // Create final level
        // ST_AsMVTGeom(ST_Centroid(ST_Collect(center)), tile.envelope) as the_geom_webmercator,
        // sum(cnt) as cnt, 
        // log(sum(cnt)) * 3 + 7 as size from 
        // ST_AsMVTGeom(ST_Centroid(ST_Collect(center)), tile.envelope)
        var centerExpr2 = { type: "op", op: "ST_AsMVTGeom", exprs: [
                {
                    type: "op",
                    op: "ST_Centroid",
                    exprs: [
                        {
                            type: "op",
                            op: "ST_Collect",
                            exprs: [{ type: "field", tableAlias: "inner2query", column: "center" }]
                        }
                    ]
                },
                { type: "field", tableAlias: "tile", column: "envelope" }
            ] };
        var cntExpr = { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "inner2query", column: "cnt" }] };
        var sizeExpr = {
            type: "op",
            op: "+",
            exprs: [{ type: "op", op: "*", exprs: [{ type: "op", op: "log", exprs: [cntExpr] }, 3] }, 7]
        };
        var query = {
            type: "query",
            selects: [
                { type: "select", expr: centerExpr2, alias: "the_geom_webmercator" },
                { type: "select", expr: cntExpr, alias: "cnt" },
                { type: "select", expr: sizeExpr, alias: "size" }
                //###{ type: "select", expr: { type: "literal", value: 12 }, alias: "size" }
            ],
            from: {
                type: "join",
                kind: "cross",
                left: { type: "subquery", query: inner2Query, alias: "inner2query" },
                right: { type: "table", table: "tile", alias: "tile" }
            },
            groupBy: [
                { type: "field", tableAlias: "inner2query", column: "clust" },
                { type: "field", tableAlias: "tile", column: "envelope" }
            ]
        };
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
    ClusterLayer.prototype.getJsonQLCss = function (design, schema, filters) {
        // Create design
        var layerDef = {
            layers: [{ id: "layer0", jsonql: this.createMapnikJsonQL(design, schema, filters) }],
            css: this.createCss(design, schema)
            // interactivity: {
            //   layer: "layer0"
            //   fields: ["id"]
            // }
        };
        return layerDef;
    };
    ClusterLayer.prototype.createMapnikJsonQL = function (design, schema, filters) {
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        var exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
        /*
        Query:
          Works by first snapping to grid and then clustering the clusters with slower DBSCAN method
    
          select
            ST_Centroid(ST_Collect(center)) as the_geom_webmercator,
            sum(cnt) as cnt,
            log(sum(cnt)) * 6 + 14 as size from
              (
                select
                ST_ClusterDBSCAN(center, (!pixel_width!*30 + !pixel_height!*30)/2, 1) over () as clust,
                sub1.center as center,
                cnt as cnt
                from
                (
                  select
                  count(*) as cnt,
                  ST_Centroid(ST_Collect(<geometry axis>)) as center,
                  ST_Snaptogrid(<geometry axis>, !pixel_width!*40, !pixel_height!*40) as grid
                  from <table> as main
                  where <geometry axis> && !bbox!
                    and <geometry axis> is not null
                    and <other filters>
                  group by 3
                ) as sub1
              ) as sub2
            group by sub2.clust
    
        */
        // Compile geometry axis
        var geometryExpr = axisBuilder.compileAxis({ axis: design.axes.geometry, tableAlias: "main" });
        // Convert to Web mercator (3857)
        geometryExpr = { type: "op", op: "ST_Transform", exprs: [geometryExpr, 3857] };
        // ST_Centroid(ST_Collect(<geometry axis>))
        var centerExpr = {
            type: "op",
            op: "ST_Centroid",
            exprs: [
                {
                    type: "op",
                    op: "ST_Collect",
                    exprs: [geometryExpr]
                }
            ]
        };
        // ST_Snaptogrid(<geometry axis>, !pixel_width!*40, !pixel_height!*40)
        var gridExpr = {
            type: "op",
            op: "ST_Snaptogrid",
            exprs: [
                geometryExpr,
                {
                    type: "op",
                    op: "*",
                    exprs: [{ type: "token", token: "!pixel_width!" }, 40]
                },
                {
                    type: "op",
                    op: "*",
                    exprs: [{ type: "token", token: "!pixel_width!" }, 40]
                }
            ]
        };
        // Create inner query
        var innerQuery = {
            type: "query",
            selects: [
                { type: "select", expr: { type: "op", op: "count", exprs: [] }, alias: "cnt" },
                { type: "select", expr: centerExpr, alias: "center" },
                { type: "select", expr: gridExpr, alias: "grid" }
            ],
            from: exprCompiler.compileTable(design.table, "main"),
            groupBy: [3]
        };
        // Create filters. First ensure geometry and limit to bounding box
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
            whereClauses.push(exprCompiler.compileExpr({ expr: design.filter || null, tableAlias: "main" }));
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
            innerQuery.where = { type: "op", op: "and", exprs: whereClauses };
        }
        else {
            innerQuery.where = whereClauses[0];
        }
        // Create next level
        // select 
        // ST_ClusterDBSCAN(center, (!pixel_width!*30 + !pixel_height!*30)/2, 1) over () as clust,
        // sub1.center as center,
        // cnt as cnt from () as innerquery
        var clustExpr = {
            type: "op",
            op: "ST_ClusterDBSCAN",
            exprs: [
                { type: "field", tableAlias: "innerquery", column: "center" },
                { type: "op", op: "/", exprs: [
                        { type: "op", op: "+", exprs: [
                                { type: "op", op: "*", exprs: [{ type: "token", token: "!pixel_width!" }, 30] },
                                { type: "op", op: "*", exprs: [{ type: "token", token: "!pixel_height!" }, 30] }
                            ] },
                        2
                    ] },
                1
            ]
        };
        var inner2Query = {
            type: "query",
            selects: [
                { type: "select", expr: clustExpr, over: {}, alias: "clust" },
                { type: "select", expr: { type: "field", tableAlias: "innerquery", column: "center" }, alias: "center" },
                { type: "select", expr: { type: "field", tableAlias: "innerquery", column: "cnt" }, alias: "cnt" }
            ],
            from: { type: "subquery", query: innerQuery, alias: "innerquery" }
        };
        // Create final level
        // ST_Centroid(ST_Collect(center)) as the_geom_webmercator,
        // sum(cnt) as cnt, 
        // log(sum(cnt)) * 6 + 14 as size from 
        // ST_Centroid(ST_Collect(center))
        centerExpr = {
            type: "op",
            op: "ST_Centroid",
            exprs: [
                {
                    type: "op",
                    op: "ST_Collect",
                    exprs: [{ type: "field", tableAlias: "inner2query", column: "center" }]
                }
            ]
        };
        var cntExpr = { type: "op", op: "sum", exprs: [{ type: "field", tableAlias: "inner2query", column: "cnt" }] };
        var sizeExpr = {
            type: "op",
            op: "+",
            exprs: [{ type: "op", op: "*", exprs: [{ type: "op", op: "log", exprs: [cntExpr] }, 6] }, 14]
        };
        var query = {
            type: "query",
            selects: [
                { type: "select", expr: centerExpr, alias: "the_geom_webmercator" },
                { type: "select", expr: cntExpr, alias: "cnt" },
                { type: "select", expr: sizeExpr, alias: "size" }
            ],
            from: { type: "subquery", query: inner2Query, alias: "inner2query" },
            groupBy: [{ type: "field", tableAlias: "inner2query", column: "clust" }]
        };
        return query;
    };
    ClusterLayer.prototype.createCss = function (design, schema) {
        var css = "#layer0 [cnt>1] {\n  marker-width: [size]\n  marker-line-color: white\n  marker-line-width: 4\n  marker-line-opacity: 0.6\n  marker-placement: point\n  marker-type: ellipse\n  marker-allow-overlap: true\n  marker-fill: " + (design.fillColor || "#337ab7") + "\n}\n\n#layer0::l1 [cnt>1] { \n  text-name: [cnt]\n  text-face-name: 'Arial Bold'\n  text-allow-overlap: true\n  text-fill: " + (design.textColor || "white") + "\n}\n\n#layer0 [cnt=1] {\n  marker-width: 10\n  marker-line-color: white\n  marker-line-width: 2\n  marker-line-opacity: 0.6\n  marker-placement: point\n  marker-type: ellipse\n  marker-allow-overlap: true\n  marker-fill: " + (design.fillColor || "#337ab7") + "\n}";
        return css;
    };
    // # Called when the interactivity grid is clicked.
    // # arguments:
    // #   ev: { data: interactivty data e.g. `{ id: 123 }` }
    // #   options:
    // #     design: design of layer
    // #     schema: schema to use
    // #     dataSource: data source to use
    // #     layerDataSource: layer data source
    // #     scopeData: current scope data if layer is scoping
    // #     filters: compiled filters to apply to the popup
    // #
    // # Returns:
    // #   null/undefined
    // #   or
    // #   {
    // #     scope: scope to apply ({ name, filter, data })
    // #     row: { tableId:, primaryKey: }  # row that was selected
    // #     popup: React element to put into a popup
    // #   }
    // onGridClick: (ev, clickOptions) ->
    //   # TODO abstract most to base class
    //   if ev.data and ev.data.id
    //     table = clickOptions.design.table
    //     results = {}
    //     # Scope toggle item if ctrl-click
    //     if ev.event.originalEvent.shiftKey
    //       ids = clickOptions.scopeData or []
    //       if ev.data.id in ids
    //         ids = _.without(ids, ev.data.id)
    //       else
    //         ids = ids.concat([ev.data.id])
    //       # Create filter for rows
    //       filter = {
    //         table: table
    //         jsonql: { type: "op", op: "=", modifier: "any", exprs: [
    //           { type: "field", tableAlias: "{alias}", column: clickOptions.schema.getTable(table).primaryKey }
    //           { type: "literal", value: ids }
    //         ]}
    //       }
    //       # Scope to item
    //       if ids.length > 0
    //         results.scope = {
    //           name: "Selected #{ids.length} Circle(s)"
    //           filter: filter
    //           data: ids
    //         }
    //       else
    //         results.scope = null
    //     # Popup
    //     if clickOptions.design.popup and not ev.event.originalEvent.shiftKey
    //       BlocksLayoutManager = require '../layouts/blocks/BlocksLayoutManager'
    //       WidgetFactory = require '../widgets/WidgetFactory'
    //       results.popup = new BlocksLayoutManager().renderLayout({
    //         items: clickOptions.design.popup.items
    //         style: "popup"
    //         renderWidget: (options) =>
    //           widget = WidgetFactory.createWidget(options.type)
    //           # Create filters for single row
    //           filter = {
    //             table: table
    //             jsonql: { type: "op", op: "=", exprs: [
    //               { type: "field", tableAlias: "{alias}", column: clickOptions.schema.getTable(table).primaryKey }
    //               { type: "literal", value: ev.data.id }
    //             ]}
    //           }
    //           filters = clickOptions.filters.concat([filter])
    //           # Get data source for widget
    //           widgetDataSource = clickOptions.layerDataSource.getPopupWidgetDataSource(clickOptions.design, options.id)
    //           return widget.createViewElement({
    //             schema: clickOptions.schema
    //             dataSource: clickOptions.dataSource
    //             widgetDataSource: widgetDataSource
    //             design: options.design
    //             scope: null
    //             filters: filters
    //             onScopeChange: null
    //             onDesignChange: null
    //             width: options.width
    //             height: options.height
    //           })
    //         })
    //     else if not ev.event.originalEvent.shiftKey
    //       results.row = { tableId: table, primaryKey: ev.data.id }
    //     return results
    //   else
    //     return null
    // Gets the bounds of the layer as GeoJSON
    ClusterLayer.prototype.getBounds = function (design, schema, dataSource, filters, callback) {
        return this.getBoundsFromExpr(schema, dataSource, design.table, design.axes.geometry.expr, design.filter || null, filters, callback);
    };
    ClusterLayer.prototype.getMinZoom = function (design) { return design.minZoom; };
    ClusterLayer.prototype.getMaxZoom = function (design) { return design.maxZoom || 21; };
    // Get the legend to be optionally displayed on the map. Returns
    // a React element
    ClusterLayer.prototype.getLegend = function (design, schema, name, dataSource, locale, filters) {
        if (filters === void 0) { filters = []; }
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
            defaultColor: design.fillColor || "#337ab7",
            symbol: 'font-awesome/circle',
            name: name,
            dataSource: dataSource,
            filters: lodash_1.default.compact(_filters),
            locale: locale
        });
    };
    // Get a list of table ids that can be filtered on
    ClusterLayer.prototype.getFilterableTables = function (design, schema) {
        if (design.table) {
            return [design.table];
        }
        else {
            return [];
        }
    };
    // True if layer can be edited
    ClusterLayer.prototype.isEditable = function () { return true; };
    // True if layer is incomplete (e.g. brand new) and should be editable immediately
    ClusterLayer.prototype.isIncomplete = function (design, schema) {
        return (this.validateDesign(design, schema) != null);
    };
    // Creates a design element with specified options
    // options:
    //   design: design of layer
    //   schema: schema to use
    //   dataSource: data source to use
    //   onDesignChange: function called when design changes
    //   filters: array of filters
    ClusterLayer.prototype.createDesignerElement = function (options) {
        var _this = this;
        // Require here to prevent server require problems
        var ClusterLayerDesignerComponent = require('./ClusterLayerDesignerComponent');
        // Clean on way in and out
        return react_1.default.createElement(ClusterLayerDesignerComponent, {
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
    ClusterLayer.prototype.cleanDesign = function (design, schema) {
        var exprCleaner = new mwater_expressions_1.ExprCleaner(schema);
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
        design = immer_1.default(design, function (draft) {
            // Default colors
            draft.textColor = design.textColor || "white";
            draft.fillColor = design.fillColor || "#337ab7";
            draft.axes = design.axes || {};
            draft.axes.geometry = axisBuilder.cleanAxis({ axis: (draft.axes.geometry ? immer_1.original(draft.axes.geometry) || null : null), table: design.table, types: ['geometry'], aggrNeed: "none" });
            draft.filter = exprCleaner.cleanExpr(design.filter || null, { table: design.table });
        });
        return design;
    };
    // Validates design. Null if ok, message otherwise
    ClusterLayer.prototype.validateDesign = function (design, schema) {
        var axisBuilder = new AxisBuilder_1.default({ schema: schema });
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
        return null;
    };
    return ClusterLayer;
}(Layer_1.default));
exports.default = ClusterLayer;
// TODO NO KML SUPPORT
