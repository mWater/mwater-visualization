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
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const immer_1 = require("immer");
const Layer_1 = __importDefault(require("./Layer"));
const mwater_expressions_1 = require("mwater-expressions");
const AxisBuilder_1 = __importDefault(require("../axes/AxisBuilder"));
const mapboxUtils_1 = require("./mapboxUtils");
const LayerLegendComponent_1 = __importDefault(require("./LayerLegendComponent"));
const PopupFilterJoinsUtils = __importStar(require("./PopupFilterJoinsUtils"));
class MarkersLayer extends Layer_1.default {
    /** Gets the type of layer definition */
    getLayerDefinitionType() {
        return "VectorTile";
    }
    getVectorTile(design, sourceId, schema, filters, opacity) {
        var _a, _b, _c;
        const jsonql = this.createJsonQL(design, schema, filters);
        const mapLayers = [];
        // If color axes, add color conditions
        const color = (0, mapboxUtils_1.compileColorMapToMapbox)(design.axes.color, design.color || "#666666");
        // Add markers
        const libreFilters = [];
        const excludedValues = (_b = (_a = design.axes.color) === null || _a === void 0 ? void 0 : _a.excludedValues) !== null && _b !== void 0 ? _b : [];
        if (excludedValues.length > 0) {
            libreFilters.push("all");
            libreFilters.push(["has", "color"]);
            libreFilters.push(["!", ["in", ["get", "color"], ['literal', excludedValues]]]);
        }
        const addFilter = (f) => {
            if (libreFilters.length > 0) {
                return libreFilters.concat([f]);
            }
            else {
                return libreFilters.concat(f);
            }
        };
        // Add polygons
        mapLayers.push({
            id: `${sourceId}:polygons`,
            type: "fill",
            source: sourceId,
            "source-layer": "main",
            paint: {
                "fill-color": color,
                "fill-opacity": 0.25 * opacity
            },
            filter: addFilter([
                "any",
                ["==", ["get", "geometry_type"], "ST_Polygon"],
                ["==", ["get", "geometry_type"], "ST_MultiPolygon"]
            ])
        });
        // Add polygon outlines and lines
        mapLayers.push({
            id: `${sourceId}:polygon-outlines`,
            type: "line",
            source: sourceId,
            "source-layer": "main",
            paint: {
                "line-color": color,
                "line-width": design.lineWidth != null ? design.lineWidth : 3,
                "line-opacity": opacity
            },
            filter: addFilter([
                "any",
                ["==", ["get", "geometry_type"], "ST_Polygon"],
                ["==", ["get", "geometry_type"], "ST_MultiPolygon"]
            ])
        });
        // Add lines
        mapLayers.push({
            id: `${sourceId}:lines`,
            type: "line",
            source: sourceId,
            "source-layer": "main",
            paint: {
                "line-color": color,
                "line-width": design.lineWidth != null ? design.lineWidth : 3,
                "line-opacity": opacity
            },
            filter: addFilter([
                "any",
                ["==", ["get", "geometry_type"], "ST_LineString"],
                ["==", ["get", "geometry_type"], "ST_MultiLineString"]
            ])
        });
        if (!design.symbol) {
            mapLayers.push({
                id: `${sourceId}:points`,
                type: "circle",
                source: sourceId,
                "source-layer": "main",
                paint: {
                    "circle-color": color,
                    "circle-opacity": 0.8 * opacity,
                    "circle-stroke-color": (0, mapboxUtils_1.compileColorToMapbox)("white", (_c = design.axes.color) === null || _c === void 0 ? void 0 : _c.excludedValues),
                    "circle-stroke-width": 1,
                    "circle-stroke-opacity": 0.5 * opacity,
                    "circle-radius": (design.markerSize || 10) / 2
                },
                filter: addFilter(["==", ["get", "geometry_type"], "ST_Point"])
            });
        }
        else {
            mapLayers.push({
                id: `${sourceId}:points`,
                type: "symbol",
                source: sourceId,
                "source-layer": "main",
                layout: {
                    "icon-image": design.symbol,
                    "icon-allow-overlap": true,
                    "icon-size": (design.markerSize || 10) / 14 // For some reason, scales down from 20 to 14. No idea why
                },
                paint: {
                    "icon-color": color,
                    "icon-opacity": opacity
                },
                filter: addFilter(["==", ["get", "geometry_type"], "ST_Point"])
            });
        }
        return {
            sourceLayers: [{ id: "main", jsonql }],
            ctes: [],
            minZoom: design.minZoom,
            maxZoom: design.maxZoom,
            mapLayers: mapLayers,
            mapLayersHandleClicks: [
                `${sourceId}:points`,
                `${sourceId}:lines`,
                `${sourceId}:polygon-outlines`,
                `${sourceId}:polygons`,
            ]
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
        // Compile geometry axis
        let geometryExpr = axisBuilder.compileAxis({ axis: design.axes.geometry, tableAlias: "innerquery" });
        // row_number() over (partition by st_snaptogrid(location, tile.scale / 150, tile.scale / 150)) AS r
        const cluster = {
            type: "select",
            expr: {
                type: "op",
                op: "row_number",
                exprs: [],
                over: {
                    partitionBy: [
                        {
                            type: "op",
                            op: "round",
                            exprs: [
                                {
                                    type: "op",
                                    op: "/",
                                    exprs: [
                                        { type: "op", op: "ST_XMin", exprs: [geometryExpr] },
                                        { type: "op", op: "/", exprs: [scaleExpr, 150] }
                                    ]
                                }
                            ]
                        },
                        {
                            type: "op",
                            op: "round",
                            exprs: [
                                {
                                    type: "op",
                                    op: "/",
                                    exprs: [
                                        { type: "op", op: "ST_YMin", exprs: [geometryExpr] },
                                        { type: "op", op: "/", exprs: [scaleExpr, 150] }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            },
            alias: "r"
        };
        // Select _id, location and clustered row number
        const innerquery = {
            type: "query",
            selects: [
                {
                    type: "select",
                    expr: { type: "field", tableAlias: "innerquery", column: schema.getTable(design.table).primaryKey },
                    alias: "id"
                },
                { type: "select", expr: geometryExpr, alias: "the_geom_webmercator" },
                cluster
            ],
            from: exprCompiler.compileTable(design.table, "innerquery")
        };
        // Add color select if color axis
        if (design.axes.color) {
            const colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "innerquery" });
            innerquery.selects.push({ type: "select", expr: colorExpr, alias: "color" });
        }
        // Create filters. First limit to envelope
        let whereClauses = [
            {
                type: "op",
                op: "&&",
                exprs: [geometryExpr, envelopeWithMarginExpr]
            }
        ];
        // Then add filters baked into layer
        if (design.filter) {
            whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "innerquery" }));
        }
        // Then add extra filters passed in, if relevant
        // Get relevant filters
        const relevantFilters = lodash_1.default.where(filters, { table: design.table });
        for (let filter of relevantFilters) {
            whereClauses.push((0, mwater_expressions_1.injectTableAlias)(filter.jsonql, "innerquery"));
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
        // Wrap geometry in ST_Force2D to avoid https://trac.osgeo.org/postgis/ticket/4690 (https://github.com/mWater/mwater-server/issues/495)
        const outerquery = {
            type: "query",
            selects: [
                {
                    type: "select",
                    expr: { type: "field", tableAlias: "innerquery", column: "id" },
                    alias: "id"
                },
                {
                    type: "select",
                    expr: {
                        type: "op",
                        op: "ST_AsMVTGeom",
                        exprs: [
                            { type: "op", op: "ST_Force2D", exprs: [
                                    { type: "field", tableAlias: "innerquery", column: "the_geom_webmercator" }
                                ] },
                            envelopeExpr
                        ]
                    },
                    alias: "the_geom_webmercator"
                },
                {
                    type: "select",
                    expr: {
                        type: "op",
                        op: "ST_GeometryType",
                        exprs: [{ type: "field", tableAlias: "innerquery", column: "the_geom_webmercator" }]
                    },
                    alias: "geometry_type"
                } // ST_GeometryType(innerquery.the_geom_webmercator) as geometry_type
            ],
            from: { type: "subquery", query: innerquery, alias: "innerquery" },
            where: { type: "op", op: "<=", exprs: [{ type: "field", tableAlias: "innerquery", column: "r" }, 3] }
        };
        // Add color select if color axis
        if (design.axes.color) {
            outerquery.selects.push({
                type: "select",
                expr: { type: "field", tableAlias: "innerquery", column: "color" },
                alias: "color"
            }); // innerquery.color as color
        }
        return outerquery;
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
    }
    createMapnikJsonQL(design, schema, filters) {
        const axisBuilder = new AxisBuilder_1.default({ schema });
        const exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
        // Compile geometry axis
        let geometryExpr = axisBuilder.compileAxis({ axis: design.axes.geometry, tableAlias: "innerquery" });
        // row_number() over (partition by round(ST_XMin(location)/!pixel_width!*5), round(ST_YMin(location)/!pixel_height!*5)) AS r
        const cluster = {
            type: "select",
            expr: {
                type: "op",
                op: "row_number",
                exprs: [],
                over: {
                    partitionBy: [
                        {
                            type: "op",
                            op: "round",
                            exprs: [
                                {
                                    type: "op",
                                    op: "/",
                                    exprs: [
                                        { type: "op", op: "ST_XMin", exprs: [geometryExpr] },
                                        { type: "op", op: "*", exprs: [{ type: "token", token: "!pixel_width!" }, 5] }
                                    ]
                                }
                            ]
                        },
                        {
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
                        }
                    ]
                }
            },
            alias: "r"
        };
        // Select _id, location and clustered row number
        const innerquery = {
            type: "query",
            selects: [
                {
                    type: "select",
                    expr: { type: "field", tableAlias: "innerquery", column: schema.getTable(design.table).primaryKey },
                    alias: "id"
                },
                { type: "select", expr: geometryExpr, alias: "the_geom_webmercator" },
                cluster
            ],
            from: exprCompiler.compileTable(design.table, "innerquery")
        };
        // Add color select if color axis
        if (design.axes.color) {
            const colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "innerquery" });
            innerquery.selects.push({ type: "select", expr: colorExpr, alias: "color" });
        }
        // Create filters. First limit to bounding box
        let whereClauses = [
            {
                type: "op",
                op: "&&",
                exprs: [geometryExpr, { type: "token", token: "!bbox!" }]
            }
        ];
        // Then add filters baked into layer
        if (design.filter) {
            whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "innerquery" }));
        }
        // Then add extra filters passed in, if relevant
        // Get relevant filters
        const relevantFilters = lodash_1.default.where(filters, { table: design.table });
        for (let filter of relevantFilters) {
            whereClauses.push((0, mwater_expressions_1.injectTableAlias)(filter.jsonql, "innerquery"));
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
        const outerquery = {
            type: "query",
            selects: [
                {
                    type: "select",
                    expr: { type: "field", tableAlias: "innerquery", column: "id" },
                    alias: "id"
                },
                {
                    type: "select",
                    expr: { type: "field", tableAlias: "innerquery", column: "the_geom_webmercator" },
                    alias: "the_geom_webmercator"
                },
                {
                    type: "select",
                    expr: {
                        type: "op",
                        op: "ST_GeometryType",
                        exprs: [{ type: "field", tableAlias: "innerquery", column: "the_geom_webmercator" }]
                    },
                    alias: "geometry_type"
                } // ST_GeometryType(innerquery.the_geom_webmercator) as geometry_type
            ],
            from: { type: "subquery", query: innerquery, alias: "innerquery" },
            where: { type: "op", op: "<=", exprs: [{ type: "field", tableAlias: "innerquery", column: "r" }, 3] }
        };
        // Add color select if color axis
        if (design.axes.color) {
            outerquery.selects.push({
                type: "select",
                expr: { type: "field", tableAlias: "innerquery", column: "color" },
                alias: "color"
            }); // innerquery.color as color
        }
        return outerquery;
    }
    // Creates CartoCSS
    createCss(design) {
        let stroke, symbol;
        let css = "";
        if (design.symbol) {
            symbol = `marker-file: url(${design.symbol});`;
            stroke = "marker-line-width: 60;";
        }
        else {
            symbol = "marker-type: ellipse;";
            stroke = "marker-line-width: 1;";
        }
        // Should only display markers when it is a point geometry
        css +=
            `\
#layer0[geometry_type='ST_Point'] {
  marker-fill: ` +
                (design.color || "#666666") +
                `;
marker-width: ` +
                (design.markerSize || 10) +
                `;
marker-line-color: white;\
` +
                stroke +
                `\
marker-line-opacity: 0.6;
marker-placement: point;\
` +
                symbol +
                `\
  marker-allow-overlap: true;
}
#layer0 {
  line-color: ` +
                (design.color || "#666666") +
                `;
line-width: ` +
                (design.lineWidth != null ? design.lineWidth : "3") +
                `;
}
#layer0[geometry_type='ST_Polygon'],#layer0[geometry_type='ST_MultiPolygon'] {
  polygon-fill: ` +
                (design.color || "#666666") +
                `;
  polygon-opacity: 0.25;
}
\
`;
        // If color axes, add color conditions
        if (design.axes.color && design.axes.color.colorMap) {
            for (let item of design.axes.color.colorMap) {
                // If invisible
                if (lodash_1.default.includes(design.axes.color.excludedValues || [], item.value)) {
                    css +=
                        `\
#layer0[color=` +
                            JSON.stringify(item.value) +
                            `] { line-opacity: 0; marker-line-opacity: 0; marker-fill-opacity: 0; polygon-opacity: 0; }\
`;
                }
                else {
                    css +=
                        `\
#layer0[color=` +
                            JSON.stringify(item.value) +
                            "] { line-color: " +
                            item.color +
                            ` }
#layer0[color=` +
                            JSON.stringify(item.value) +
                            "][geometry_type='ST_Point'] { marker-fill: " +
                            item.color +
                            ` }
#layer0[color=` +
                            JSON.stringify(item.value) +
                            "][geometry_type='ST_Polygon'],#layer0[color=" +
                            JSON.stringify(item.value) +
                            `][geometry_type='ST_MultiPolygon'] { 
polygon-fill: ` +
                            item.color +
                            `;\
}\
`;
                }
            }
        }
        return css;
    }
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
    onGridClick(ev, clickOptions) {
        // TODO abstract most to base class
        if (ev.data && ev.data.id) {
            const { table } = clickOptions.design;
            const results = {};
            // Scope toggle item if ctrl-click
            if (ev.event.originalEvent.shiftKey) {
                let ids = clickOptions.scopeData || [];
                if (ids.includes(ev.data.id)) {
                    ids = lodash_1.default.without(ids, ev.data.id);
                }
                else {
                    ids = ids.concat([ev.data.id]);
                }
                // Create filter for rows
                const filter = {
                    table,
                    jsonql: {
                        type: "op",
                        op: "=",
                        modifier: "any",
                        exprs: [
                            { type: "field", tableAlias: "{alias}", column: clickOptions.schema.getTable(table).primaryKey },
                            { type: "literal", value: ids }
                        ]
                    }
                };
                // Scope to item
                if (ids.length > 0) {
                    results.scope = {
                        name: `Selected ${ids.length} Markers(s)`,
                        filter,
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
                const popupFilterJoins = clickOptions.design.popupFilterJoins || PopupFilterJoinsUtils.createDefaultPopupFilterJoins(table);
                const popupFilters = PopupFilterJoinsUtils.createPopupFilters(popupFilterJoins, clickOptions.schema, table, ev.data.id);
                const BlocksLayoutManager = require("../layouts/blocks/BlocksLayoutManager").default;
                const WidgetFactory = require("../widgets/WidgetFactory").default;
                results.popup = new BlocksLayoutManager().renderLayout({
                    items: clickOptions.design.popup.items,
                    style: "popup",
                    renderWidget: (options) => {
                        const widget = WidgetFactory.createWidget(options.type);
                        const filters = clickOptions.filters.concat(popupFilters);
                        // Get data source for widget
                        const widgetDataSource = clickOptions.layerDataSource.getPopupWidgetDataSource(clickOptions.design, options.id);
                        return widget.createViewElement({
                            schema: clickOptions.schema,
                            dataSource: clickOptions.dataSource,
                            widgetDataSource,
                            design: options.design,
                            scope: null,
                            filters,
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
    }
    // Gets the bounds of the layer as GeoJSON
    getBounds(design, schema, dataSource, filters, callback) {
        return this.getBoundsFromExpr(schema, dataSource, design.table, design.axes.geometry.expr, design.filter || null, filters, callback);
    }
    // Get min and max zoom levels
    getMinZoom(design) {
        return design.minZoom;
    }
    getMaxZoom(design) {
        return design.maxZoom || 21;
    }
    // Get the legend to be optionally displayed on the map. Returns
    // a React element
    getLegend(design, schema, name, dataSource, locale, filters) {
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
            defaultColor: design.color,
            symbol: design.symbol || "font-awesome/circle",
            markerSize: design.markerSize,
            name,
            filters: lodash_1.default.compact(_filters),
            axis: axisBuilder.cleanAxis({
                axis: design.axes.color || null,
                table: design.table,
                types: ["enum", "text", "boolean", "date"],
                aggrNeed: "none"
            }),
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
    // Creates a design element with specified options
    // options:
    //   design: design of layer
    //   schema: schema to use
    //   dataSource: data source to use
    //   onDesignChange: function called when design changes
    //   filters: array of filters
    createDesignerElement(options) {
        // Require here to prevent server require problems
        const MarkersLayerDesignerComponent = require("./MarkersLayerDesignerComponent").default;
        // Clean on way in and out
        return react_1.default.createElement(MarkersLayerDesignerComponent, {
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
        // Migrate legacy sublayers
        if (design.sublayers) {
            design = lodash_1.default.extend({}, design, design.sublayers[0]);
            delete design.sublayers;
        }
        design = (0, immer_1.produce)(design, (draft) => {
            draft.axes = design.axes || {};
            draft.color = design.color || "#0088FF";
            draft.axes.geometry = axisBuilder.cleanAxis({
                axis: draft.axes.geometry ? (0, immer_1.original)(draft.axes.geometry) || null : null,
                table: design.table,
                types: ["geometry"],
                aggrNeed: "none"
            });
            draft.axes.color = axisBuilder.cleanAxis({
                axis: draft.axes.color ? (0, immer_1.original)(draft.axes.color) || null : null,
                table: design.table,
                types: ["enum", "text", "boolean", "date"],
                aggrNeed: "none"
            });
            draft.filter = exprCleaner.cleanExpr(design.filter || null, { table: draft.table });
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
    }
}
exports.default = MarkersLayer;
