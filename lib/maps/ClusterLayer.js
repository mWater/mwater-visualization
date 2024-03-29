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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const immer_1 = __importStar(require("immer"));
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_1 = require("mwater-expressions");
const react_1 = __importDefault(require("react"));
const AxisBuilder_1 = __importDefault(require("../axes/AxisBuilder"));
const Layer_1 = __importDefault(require("./Layer"));
const LayerLegendComponent_1 = __importDefault(require("./LayerLegendComponent"));
class ClusterLayer extends Layer_1.default {
    /** Gets the type of layer definition */
    getLayerDefinitionType() {
        return "VectorTile";
    }
    getVectorTile(design, sourceId, schema, filters, opacity) {
        const jsonql = this.createJsonQL(design, schema, filters);
        const mapLayers = [];
        mapLayers.push({
            id: `${sourceId}:circles-single`,
            type: "circle",
            source: sourceId,
            "source-layer": "clusters",
            paint: {
                "circle-color": design.fillColor || "#337ab7",
                "circle-opacity": opacity,
                "circle-stroke-color": "white",
                "circle-stroke-width": 2,
                "circle-stroke-opacity": 0.6 * opacity,
                "circle-radius": 5
            },
            filter: ["==", ["to-number", ["get", "cnt"]], 1]
        });
        mapLayers.push({
            id: `${sourceId}:circles-multiple`,
            type: "circle",
            source: sourceId,
            "source-layer": "clusters",
            paint: {
                "circle-color": design.fillColor || "#337ab7",
                "circle-opacity": opacity,
                "circle-stroke-color": "white",
                "circle-stroke-width": 4,
                "circle-stroke-opacity": 0.6 * opacity,
                "circle-radius": ["to-number", ["get", "size"]]
            },
            filter: [">", ["to-number", ["get", "cnt"]], 1]
        });
        mapLayers.push({
            id: `${sourceId}:labels`,
            type: "symbol",
            source: sourceId,
            "source-layer": "clusters",
            layout: {
                "text-field": ["get", "cnt"],
                "text-size": 10
            },
            paint: {
                "text-color": design.textColor || "white",
                "text-opacity": 1
            },
            filter: [">", ["to-number", ["get", "cnt"]], 1]
        });
        return {
            sourceLayers: [{ id: "clusters", jsonql: jsonql }],
            ctes: [],
            mapLayers: mapLayers,
            mapLayersHandleClicks: [`${sourceId}:circles-single`, `${sourceId}:circles-multiple`]
        };
    }
    createJsonQL(design, schema, filters) {
        const axisBuilder = new AxisBuilder_1.default({ schema });
        const exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
        // Expression of scale and envelope from tile table
        const scaleExpr = {
            type: "scalar",
            expr: { type: "field", tableAlias: "tile", column: "scale" },
            from: { type: "table", table: "tile", alias: "tile" }
        };
        const envelopeExpr = {
            type: "scalar",
            expr: { type: "field", tableAlias: "tile", column: "envelope" },
            from: { type: "table", table: "tile", alias: "tile" }
        };
        const envelopeWithMarginExpr = {
            type: "scalar",
            expr: { type: "field", tableAlias: "tile", column: "envelope_with_margin" },
            from: { type: "table", table: "tile", alias: "tile" }
        };
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
                  round(ST_XMin(<geometry axis) / (tile.scale / 6)) as gridx,
                  round(ST_YMin(<geometry axis) / (tile.scale / 6)) as gridy
                  from <table> as main
                  where <geometry axis> && !bbox!
                    and <geometry axis> is not null
                    and <other filters>
                  group by 3, 4
                ) as sub1
              ) as sub2, tile as tile
            group by sub2.clust
    
        */
        // Compile geometry axis
        let geometryExpr = axisBuilder.compileAxis({ axis: design.axes.geometry, tableAlias: "main" });
        // ST_Centroid(ST_Collect(<geometry axis>))
        let centerExpr = {
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
        // round(ST_XMin(<geometry axis) / (tile.scale / 6))
        const gridXExpr = {
            type: "op",
            op: "round",
            exprs: [
                {
                    type: "op",
                    op: "/",
                    exprs: [
                        { type: "op", op: "ST_XMin", exprs: [geometryExpr] },
                        { type: "op", op: "/", exprs: [scaleExpr, 6] }
                    ]
                }
            ]
        };
        const gridYExpr = {
            type: "op",
            op: "round",
            exprs: [
                {
                    type: "op",
                    op: "/",
                    exprs: [
                        { type: "op", op: "ST_YMin", exprs: [geometryExpr] },
                        { type: "op", op: "/", exprs: [scaleExpr, 6] }
                    ]
                }
            ]
        };
        // Create inner query
        const innerQuery = {
            type: "query",
            selects: [
                { type: "select", expr: { type: "op", op: "count", exprs: [] }, alias: "cnt" },
                { type: "select", expr: centerExpr, alias: "center" },
                { type: "select", expr: gridXExpr, alias: "gridx" },
                { type: "select", expr: gridYExpr, alias: "gridy" }
            ],
            from: exprCompiler.compileTable(design.table, "main"),
            groupBy: [3, 4]
        };
        // Create filters. First ensure geometry and limit to bounding box
        let whereClauses = [
            {
                type: "op",
                op: "&&",
                exprs: [geometryExpr, envelopeWithMarginExpr]
            }
        ];
        // Then add filters baked into layer
        if (design.filter) {
            whereClauses.push(exprCompiler.compileExpr({ expr: design.filter || null, tableAlias: "main" }));
        }
        // Then add extra filters passed in, if relevant
        // Get relevant filters
        const relevantFilters = lodash_1.default.where(filters, { table: design.table });
        for (let filter of relevantFilters) {
            whereClauses.push((0, mwater_expressions_1.injectTableAlias)(filter.jsonql, "main"));
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
        const clustExpr = {
            type: "op",
            op: "ST_ClusterDBSCAN",
            exprs: [
                { type: "field", tableAlias: "innerquery", column: "center" },
                { type: "op", op: "/", exprs: [scaleExpr, 8] },
                1
            ],
            over: {}
        };
        const inner2Query = {
            type: "query",
            selects: [
                { type: "select", expr: clustExpr, alias: "clust" },
                { type: "select", expr: { type: "field", tableAlias: "innerquery", column: "center" }, alias: "center" },
                { type: "select", expr: { type: "field", tableAlias: "innerquery", column: "cnt" }, alias: "cnt" }
            ],
            from: { type: "subquery", query: innerQuery, alias: "innerquery" }
        };
        // Create final level
        // ST_AsMVTGeom(ST_Centroid(ST_Collect(center)), tile.envelope) as the_geom_webmercator,
        // sum(cnt) as cnt,
        // log(sum(cnt)) * 3 + 7 as size from
        // ST_AsMVTGeom(ST_Centroid(ST_Collect(center)), tile.envelope)
        const centerExpr2 = {
            type: "op",
            op: "ST_AsMVTGeom",
            exprs: [
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
                envelopeExpr
            ]
        };
        const cntExpr = {
            type: "op",
            op: "sum",
            exprs: [{ type: "field", tableAlias: "inner2query", column: "cnt" }]
        };
        const sizeExpr = {
            type: "op",
            op: "+",
            exprs: [{ type: "op", op: "*", exprs: [{ type: "op", op: "log", exprs: [cntExpr] }, 3] }, 7]
        };
        const query = {
            type: "query",
            selects: [
                { type: "select", expr: centerExpr2, alias: "the_geom_webmercator" },
                { type: "select", expr: cntExpr, alias: "cnt" },
                { type: "select", expr: sizeExpr, alias: "size" }
                //###{ type: "select", expr: { type: "literal", value: 12 }, alias: "size" }
            ],
            from: { type: "subquery", query: inner2Query, alias: "inner2query" },
            groupBy: [{ type: "field", tableAlias: "inner2query", column: "clust" }, envelopeExpr]
        };
        return query;
    }
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
    getJsonQLCss(design, schema, filters) {
        // Create design
        const layerDef = {
            layers: [{ id: "layer0", jsonql: this.createMapnikJsonQL(design, schema, filters) }],
            css: this.createCss(design, schema)
            // interactivity: {
            //   layer: "layer0"
            //   fields: ["id"]
            // }
        };
        return layerDef;
    }
    createMapnikJsonQL(design, schema, filters) {
        const axisBuilder = new AxisBuilder_1.default({ schema });
        const exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
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
                  round(ST_XMin(<geometry axis>) /  (!pixel_width!*40)) as gridx,
                  round(ST_YMin(<geometry axis>) /  (!pixel_width!*40)) as gridy,
                  from <table> as main
                  where <geometry axis> && !bbox!
                    and <geometry axis> is not null
                    and <other filters>
                  group by 3, 4
                ) as sub1
              ) as sub2
            group by sub2.clust
    
        */
        // Compile geometry axis
        let geometryExpr = axisBuilder.compileAxis({ axis: design.axes.geometry, tableAlias: "main" });
        // ST_Centroid(ST_Collect(<geometry axis>))
        let centerExpr = {
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
        const gridXExpr = {
            type: "op",
            op: "round",
            exprs: [
                {
                    type: "op",
                    op: "/",
                    exprs: [
                        { type: "op", op: "ST_XMin", exprs: [geometryExpr] },
                        { type: "op", op: "*", exprs: [{ type: "token", token: "!pixel_width!" }, 40] }
                    ]
                }
            ]
        };
        const gridYExpr = {
            type: "op",
            op: "round",
            exprs: [
                {
                    type: "op",
                    op: "/",
                    exprs: [
                        { type: "op", op: "ST_YMin", exprs: [geometryExpr] },
                        { type: "op", op: "*", exprs: [{ type: "token", token: "!pixel_height!" }, 5] }
                    ]
                }
            ]
        };
        // Create inner query
        const innerQuery = {
            type: "query",
            selects: [
                { type: "select", expr: { type: "op", op: "count", exprs: [] }, alias: "cnt" },
                { type: "select", expr: centerExpr, alias: "center" },
                { type: "select", expr: gridXExpr, alias: "gridx" },
                { type: "select", expr: gridYExpr, alias: "gridy" }
            ],
            from: exprCompiler.compileTable(design.table, "main"),
            groupBy: [3, 4]
        };
        // Create filters. First ensure geometry and limit to bounding box
        let whereClauses = [
            {
                type: "op",
                op: "&&",
                exprs: [geometryExpr, { type: "token", token: "!bbox!" }]
            }
        ];
        // Then add filters baked into layer
        if (design.filter) {
            whereClauses.push(exprCompiler.compileExpr({ expr: design.filter || null, tableAlias: "main" }));
        }
        // Then add extra filters passed in, if relevant
        // Get relevant filters
        const relevantFilters = lodash_1.default.where(filters, { table: design.table });
        for (let filter of relevantFilters) {
            whereClauses.push((0, mwater_expressions_1.injectTableAlias)(filter.jsonql, "main"));
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
        const clustExpr = {
            type: "op",
            op: "ST_ClusterDBSCAN",
            exprs: [
                { type: "field", tableAlias: "innerquery", column: "center" },
                {
                    type: "op",
                    op: "/",
                    exprs: [
                        {
                            type: "op",
                            op: "+",
                            exprs: [
                                { type: "op", op: "*", exprs: [{ type: "token", token: "!pixel_width!" }, 30] },
                                { type: "op", op: "*", exprs: [{ type: "token", token: "!pixel_height!" }, 30] }
                            ]
                        },
                        2
                    ]
                },
                1
            ],
            over: {}
        };
        const inner2Query = {
            type: "query",
            selects: [
                { type: "select", expr: clustExpr, alias: "clust" },
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
        const cntExpr = {
            type: "op",
            op: "sum",
            exprs: [{ type: "field", tableAlias: "inner2query", column: "cnt" }]
        };
        const sizeExpr = {
            type: "op",
            op: "+",
            exprs: [{ type: "op", op: "*", exprs: [{ type: "op", op: "log", exprs: [cntExpr] }, 6] }, 14]
        };
        const query = {
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
    }
    createCss(design, schema) {
        const css = `\
#layer0 [cnt>1] {
  marker-width: [size];
  marker-line-color: white;
  marker-line-width: 4;
  marker-line-opacity: 0.6;
  marker-placement: point;
  marker-type: ellipse;
  marker-allow-overlap: true;
  marker-fill: ` +
            (design.fillColor || "#337ab7") +
            `;
}

#layer0::l1 [cnt>1] { 
  text-name: [cnt];
  text-face-name: 'Arial Bold';
  text-allow-overlap: true;
  text-fill: ` +
            (design.textColor || "white") +
            `;
}

#layer0 [cnt=1] {
  marker-width: 10;
  marker-line-color: white;
  marker-line-width: 2;
  marker-line-opacity: 0.6;
  marker-placement: point;
  marker-type: ellipse;
  marker-allow-overlap: true;
  marker-fill: ` +
            (design.fillColor || "#337ab7") +
            `;
}\
`;
        return css;
    }
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
    getBounds(design, schema, dataSource, filters, callback) {
        return this.getBoundsFromExpr(schema, dataSource, design.table, design.axes.geometry.expr, design.filter || null, filters, callback);
    }
    getMinZoom(design) {
        return design.minZoom;
    }
    getMaxZoom(design) {
        return design.maxZoom || 21;
    }
    // Get the legend to be optionally displayed on the map. Returns
    // a React element
    getLegend(design, schema, name, dataSource, locale, filters = []) {
        const _filters = filters.slice();
        if (design.filter != null) {
            const exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
            const jsonql = exprCompiler.compileExpr({ expr: design.filter, tableAlias: "{alias}" });
            if (jsonql) {
                _filters.push({ table: design.filter.table, jsonql });
            }
        }
        const axisBuilder = new AxisBuilder_1.default({ schema });
        return react_1.default.createElement(LayerLegendComponent_1.default, {
            schema,
            defaultColor: design.fillColor || "#337ab7",
            symbol: "font-awesome/circle",
            name,
            filters: lodash_1.default.compact(_filters),
            locale
        });
    }
    // Get a list of table ids that can be filtered on
    getFilterableTables(design, schema) {
        if (design.table) {
            return [design.table];
        }
        else {
            return [];
        }
    }
    // True if layer can be edited
    isEditable() {
        return true;
    }
    // True if layer is incomplete (e.g. brand new) and should be editable immediately
    isIncomplete(design, schema) {
        return this.validateDesign(design, schema) != null;
    }
    // Creates a design element with specified options
    // options:
    //   design: design of layer
    //   schema: schema to use
    //   dataSource: data source to use
    //   onDesignChange: function called when design changes
    //   filters: array of filters
    createDesignerElement(options) {
        // Require here to prevent server require problems
        const ClusterLayerDesignerComponent = require("./ClusterLayerDesignerComponent").default;
        // Clean on way in and out
        return react_1.default.createElement(ClusterLayerDesignerComponent, {
            schema: options.schema,
            dataSource: options.dataSource,
            design: this.cleanDesign(options.design, options.schema),
            filters: options.filters,
            onDesignChange: (design) => {
                return options.onDesignChange(this.cleanDesign(design, options.schema));
            }
        });
    }
    // Returns a cleaned design
    cleanDesign(design, schema) {
        const exprCleaner = new mwater_expressions_1.ExprCleaner(schema);
        const axisBuilder = new AxisBuilder_1.default({ schema });
        design = (0, immer_1.default)(design, (draft) => {
            // Default colors
            draft.textColor = design.textColor || "white";
            draft.fillColor = design.fillColor || "#337ab7";
            draft.axes = design.axes || {};
            draft.axes.geometry = axisBuilder.cleanAxis({
                axis: draft.axes.geometry ? (0, immer_1.original)(draft.axes.geometry) || null : null,
                table: design.table,
                types: ["geometry"],
                aggrNeed: "none"
            });
            draft.filter = exprCleaner.cleanExpr(design.filter || null, { table: design.table });
        });
        return design;
    }
    // Validates design. Null if ok, message otherwise
    validateDesign(design, schema) {
        const axisBuilder = new AxisBuilder_1.default({ schema });
        const exprValidator = new mwater_expressions_1.ExprValidator(schema);
        if (!design.table) {
            return "Missing table";
        }
        if (!design.axes || !design.axes.geometry) {
            return "Missing axes";
        }
        let error = axisBuilder.validateAxis({ axis: design.axes.geometry });
        if (error) {
            return error;
        }
        // Check type of axis (prevents blank axes)
        if (axisBuilder.getAxisType(design.axes.geometry) != "geometry") {
            return "Geometry axis required";
        }
        // Validate filter
        error = exprValidator.validateExpr(design.filter || null);
        if (error) {
            return error;
        }
        return null;
    }
}
exports.default = ClusterLayer;
