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
const HoverContent_1 = __importDefault(require("./HoverContent"));
class ChoroplethLayer extends Layer_1.default {
    /** Gets the type of layer definition */
    getLayerDefinitionType() {
        return "VectorTile";
    }
    getVectorTile(design, sourceId, schema, filters, opacity) {
        // Verify that scopeLevel is an integer to prevent injection
        if (design.scopeLevel != null && ![0, 1, 2, 3, 4, 5].includes(design.scopeLevel)) {
            throw new Error("Invalid scope level");
        }
        // Verify that detailLevel is an integer to prevent injection
        if (![0, 1, 2, 3, 4, 5].includes(design.detailLevel)) {
            throw new Error("Invalid detail level");
        }
        if (design.regionMode === "plain") {
            return this.createPlainVectorTile(design, sourceId, schema, filters, opacity);
        }
        else if (design.regionMode === "indirect" || !design.regionMode) {
            return this.createIndirectVectorTile(design, sourceId, schema, filters, opacity);
        }
        else if (design.regionMode == "direct") {
            return this.createDirectVectorTile(design, sourceId, schema, filters, opacity);
        }
        else {
            throw new Error("NOT IMPLEMENTED");
        }
    }
    createPlainVectorTile(design, sourceId, schema, filters, opacity) {
        const regionsTable = design.regionsTable || "admin_regions";
        // Expression of envelope from tile table
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
        Returns two source layers, "polygons" and "points". Points are used for labels.
    
        polygons:
          select name, ST_AsMVTGeom(shape_simplified, tile.envelope) as the_geom_webmercator from
          admin_regions as regions, tile as tile
          where regions.level0 = 242
          and regions.level = 1
          and shape && tile.envelope_with_margin
    
        points:
          select name, ST_AsMVTGeom(
            (select ST_Centroid(polys.geom) from ST_Dump(shape_simplified) as polys order by ST_Area(polys.geom) desc limit 1)
          , tile.envelope) as the_geom_webmercator from
          admin_regions as regions, tile as tile
          where regions.level0 = 242
          and regions.level = 1
          and shape && tile.envelope_with_margin
    
          */
        // Create where
        const where = {
            type: "op",
            op: "and",
            exprs: [
                // Level to display
                {
                    type: "op",
                    op: "=",
                    exprs: [{ type: "field", tableAlias: "regions", column: "level" }, design.detailLevel]
                },
                // Filter to tile
                {
                    type: "op",
                    op: "&&",
                    exprs: [{ type: "field", tableAlias: "regions", column: "shape" }, envelopeWithMarginExpr]
                }
            ]
        };
        // Scope overall
        if (design.scope) {
            where.exprs.push({
                type: "op",
                op: "=",
                exprs: [
                    { type: "field", tableAlias: "regions", column: `level${design.scopeLevel || 0}` },
                    { type: "literal", value: design.scope }
                ]
            });
        }
        // Add filters on regions to outer query
        for (const filter of filters) {
            if (filter.table == regionsTable) {
                where.exprs.push((0, mwater_expressions_1.injectTableAlias)(filter.jsonql, "regions"));
            }
        }
        const polygonsQuery = {
            type: "query",
            selects: [
                { type: "select", expr: { type: "field", tableAlias: "regions", column: "_id" }, alias: "id" },
                {
                    type: "select",
                    expr: {
                        type: "op",
                        op: "ST_AsMVTGeom",
                        exprs: [{ type: "field", tableAlias: "regions", column: "shape_simplified" }, envelopeExpr]
                    },
                    alias: "the_geom_webmercator"
                },
                { type: "select", expr: { type: "field", tableAlias: "regions", column: "name" }, alias: "name" }
            ],
            from: { type: "table", table: regionsTable, alias: "regions" },
            where: where
        };
        const pointsQuery = {
            type: "query",
            selects: [
                { type: "select", expr: { type: "field", tableAlias: "regions", column: "_id" }, alias: "id" },
                {
                    type: "select",
                    expr: {
                        type: "op",
                        op: "ST_AsMVTGeom",
                        exprs: [
                            {
                                type: "scalar",
                                expr: {
                                    type: "op",
                                    op: "ST_Centroid",
                                    exprs: [{ type: "field", tableAlias: "polys", column: "geom" }]
                                },
                                from: {
                                    type: "subexpr",
                                    expr: {
                                        type: "op",
                                        op: "ST_Dump",
                                        exprs: [{ type: "field", tableAlias: "regions", column: "shape_simplified" }]
                                    },
                                    alias: "polys"
                                },
                                orderBy: [
                                    {
                                        expr: {
                                            type: "op",
                                            op: "ST_Area",
                                            exprs: [{ type: "field", tableAlias: "polys", column: "geom" }]
                                        },
                                        direction: "desc"
                                    }
                                ],
                                limit: 1
                            },
                            envelopeExpr
                        ]
                    },
                    alias: "the_geom_webmercator"
                },
                { type: "select", expr: { type: "field", tableAlias: "regions", column: "name" }, alias: "name" }
            ],
            from: { type: "table", table: regionsTable, alias: "regions" },
            where: where
        };
        // Create layers
        const mapLayers = [];
        mapLayers.push({
            id: `${sourceId}:polygon-fill`,
            type: "fill",
            source: sourceId,
            "source-layer": "polygons",
            paint: {
                "fill-opacity": design.fillOpacity * design.fillOpacity * opacity,
                "fill-color": design.color || "transparent",
                "fill-outline-color": "transparent"
            }
        });
        mapLayers.push({
            id: `${sourceId}:polygon-line`,
            type: "line",
            source: sourceId,
            "source-layer": "polygons",
            paint: {
                // Because of https://github.com/mapbox/mapbox-gl-js/issues/4090, line opacities < 1 create artifacts.
                "line-color": design.borderColor || "#000",
                "line-opacity": opacity,
                "line-width": 1,
                "line-blur": 1.5
            }
        });
        if (design.displayNames) {
            mapLayers.push({
                id: `${sourceId}:labels`,
                type: "symbol",
                source: sourceId,
                "source-layer": "points",
                layout: {
                    "text-field": ["get", "name"],
                    "text-size": 10
                },
                paint: {
                    "text-color": "black",
                    "text-halo-color": "rgba(255, 255, 255, 0.5)",
                    "text-halo-width": 2,
                    "text-opacity": opacity
                }
            });
        }
        return {
            ctes: [],
            sourceLayers: [
                { id: "polygons", jsonql: polygonsQuery },
                { id: "points", jsonql: pointsQuery }
            ],
            mapLayers: mapLayers,
            mapLayersHandleClicks: [`${sourceId}:polygon-fill`],
            minZoom: design.minZoom,
            maxZoom: design.maxZoom
        };
    }
    createIndirectVectorTile(design, sourceId, schema, filters, opacity) {
        var _a, _b, _c;
        const axisBuilder = new AxisBuilder_1.default({ schema });
        const exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
        const regionsTable = design.regionsTable || "admin_regions";
        // Expression of scale and envelope from tile table
        const envelopeExpr = {
            type: "scalar",
            expr: { type: "field", tableAlias: "tile", column: "envelope" },
            from: { type: "table", table: "tile", alias: "tile" }
        };
        /*
        Returns two source layers, "polygons" and "points". Points are used for labels.
    
        Has a CTE (regions) that is the core data that doesn't change by tile. e.g.:
    
          select admin_regions.level1 as id,
          count(innerquery.*) as color
          from
          admin_regions inner join
          entities.water_point as innerquery
          on innerquery.admin_region = admin_regions._id
          where admin_regions.level0 = 242
          group by 1
    
        polygons:
          select name, ST_AsMVTGeom(shape_simplified, tile.envelope) as the_geom_webmercator, regions.color from
          admin_regions as regions2
          left outer join regions as regions on regions.id = regions2._id
          where regions2.level = 1 and regions2.level0 = 242
    
        points:
          select name, ST_AsMVTGeom(
            (select ST_Centroid(polys.geom) from ST_Dump(shape_simplified) as polys order by ST_Area(polys.geom) desc limit 1), tile.envelope) as the_geom_webmercator, regions.color from
          admin_regions as regions2
          left outer join regions as regions on regions.id = regions2._id, tile as tile
          where regions2.level = 1 and regions2.level0 = 242 and shape && tile.envelope_with_margin
    
        */
        const compiledAdminRegionExpr = exprCompiler.compileExpr({
            expr: design.adminRegionExpr || null,
            tableAlias: "innerquery"
        });
        // Create CTE query
        const cteQuery = {
            type: "query",
            selects: [
                {
                    type: "select",
                    expr: { type: "field", tableAlias: "regions", column: `level${design.detailLevel}` },
                    alias: "id"
                }
            ],
            from: {
                type: "join",
                kind: "inner",
                left: { type: "table", table: regionsTable, alias: "regions" },
                right: exprCompiler.compileTable(design.table, "innerquery"),
                on: {
                    type: "op",
                    op: "=",
                    exprs: [compiledAdminRegionExpr, { type: "field", tableAlias: "regions", column: "_id" }]
                }
            },
            groupBy: [1]
        };
        // Add color select if color axis
        if (design.axes.color) {
            const colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "innerquery" });
            cteQuery.selects.push({ type: "select", expr: colorExpr, alias: "color" });
        }
        // Add label select if color axis
        if (design.axes.label) {
            const labelExpr = axisBuilder.compileAxis({ axis: design.axes.label, tableAlias: "innerquery" });
            cteQuery.selects.push({ type: "select", expr: labelExpr, alias: "label" });
        }
        let whereClauses = [];
        if (design.scope) {
            whereClauses.push({
                type: "op",
                op: "=",
                exprs: [{ type: "field", tableAlias: "regions", column: `level${design.scopeLevel || 0}` }, design.scope]
            });
        }
        // Then add filters
        if (design.filter) {
            whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "innerquery" }));
        }
        // Then add extra filters passed in, if relevant
        const relevantFilters = lodash_1.default.where(filters, { table: design.table });
        for (let filter of relevantFilters) {
            whereClauses.push((0, mwater_expressions_1.injectTableAlias)(filter.jsonql, "innerquery"));
        }
        whereClauses = lodash_1.default.compact(whereClauses);
        if (whereClauses.length > 0) {
            cteQuery.where = { type: "op", op: "and", exprs: whereClauses };
        }
        // Create outer where clause
        const outerWhere = {
            type: "op",
            op: "and",
            exprs: [
                // Level to display
                {
                    type: "op",
                    op: "=",
                    exprs: [{ type: "field", tableAlias: "regions2", column: "level" }, design.detailLevel]
                }
            ]
        };
        // Scope overall
        if (design.scope) {
            outerWhere.exprs.push({
                type: "op",
                op: "=",
                exprs: [
                    { type: "field", tableAlias: "regions2", column: `level${design.scopeLevel || 0}` },
                    { type: "literal", value: design.scope }
                ]
            });
        }
        // Add filters on regions to outer query
        for (const filter of filters) {
            if (filter.table == regionsTable) {
                outerWhere.exprs.push((0, mwater_expressions_1.injectTableAlias)(filter.jsonql, "regions2"));
            }
        }
        // Now create outer query
        const polygonsQuery = {
            type: "query",
            selects: [
                { type: "select", expr: { type: "field", tableAlias: "regions2", column: "_id" }, alias: "id" },
                {
                    type: "select",
                    expr: {
                        type: "op",
                        op: "ST_AsMVTGeom",
                        exprs: [{ type: "field", tableAlias: "regions2", column: "shape_simplified" }, envelopeExpr]
                    },
                    alias: "the_geom_webmercator"
                },
                { type: "select", expr: { type: "field", tableAlias: "regions2", column: "name" }, alias: "name" }
            ],
            from: {
                type: "join",
                kind: "left",
                left: { type: "table", table: regionsTable, alias: "regions2" },
                right: { type: "table", table: "regions", alias: "regions" },
                on: {
                    type: "op",
                    op: "=",
                    exprs: [
                        { type: "field", tableAlias: "regions", column: "id" },
                        { type: "field", tableAlias: "regions2", column: "_id" }
                    ]
                }
            },
            where: outerWhere
        };
        const pointsQuery = {
            type: "query",
            selects: [
                { type: "select", expr: { type: "field", tableAlias: "regions2", column: "_id" }, alias: "id" },
                {
                    type: "select",
                    expr: {
                        type: "op",
                        op: "ST_AsMVTGeom",
                        exprs: [
                            {
                                type: "scalar",
                                expr: {
                                    type: "op",
                                    op: "ST_Centroid",
                                    exprs: [{ type: "field", tableAlias: "polys", column: "geom" }]
                                },
                                from: {
                                    type: "subexpr",
                                    expr: {
                                        type: "op",
                                        op: "ST_Dump",
                                        exprs: [{ type: "field", tableAlias: "regions2", column: "shape_simplified" }]
                                    },
                                    alias: "polys"
                                },
                                orderBy: [
                                    {
                                        expr: {
                                            type: "op",
                                            op: "ST_Area",
                                            exprs: [{ type: "field", tableAlias: "polys", column: "geom" }]
                                        },
                                        direction: "desc"
                                    }
                                ],
                                limit: 1
                            },
                            envelopeExpr
                        ]
                    },
                    alias: "the_geom_webmercator"
                },
                { type: "select", expr: { type: "field", tableAlias: "regions2", column: "name" }, alias: "name" }
            ],
            from: {
                type: "join",
                kind: "left",
                left: { type: "table", table: regionsTable, alias: "regions2" },
                right: { type: "table", table: "regions", alias: "regions" },
                on: {
                    type: "op",
                    op: "=",
                    exprs: [
                        { type: "field", tableAlias: "regions", column: "id" },
                        { type: "field", tableAlias: "regions2", column: "_id" }
                    ]
                }
            },
            where: outerWhere
        };
        // Bubble up color and label
        if (design.axes.color) {
            polygonsQuery.selects.push({
                type: "select",
                expr: { type: "field", tableAlias: "regions", column: "color" },
                alias: "color"
            });
            pointsQuery.selects.push({
                type: "select",
                expr: { type: "field", tableAlias: "regions", column: "color" },
                alias: "color"
            });
        }
        // Add label select if color axis
        if (design.axes.label) {
            polygonsQuery.selects.push({
                type: "select",
                expr: { type: "field", tableAlias: "regions", column: "label" },
                alias: "label"
            });
            pointsQuery.selects.push({
                type: "select",
                expr: { type: "field", tableAlias: "regions", column: "label" },
                alias: "label"
            });
        }
        // If color axes, add color conditions
        const color = (0, mapboxUtils_1.compileColorMapToMapbox)(design.axes.color, design.color || "transparent");
        // Create layers
        const mapLayers = [];
        mapLayers.push({
            id: `${sourceId}:polygon-fill`,
            type: "fill",
            source: sourceId,
            "source-layer": "polygons",
            paint: {
                "fill-opacity": design.fillOpacity * design.fillOpacity * opacity,
                "fill-color": color,
                "fill-outline-color": "transparent"
            }
        });
        mapLayers.push({
            id: `${sourceId}:polygon-line`,
            type: "line",
            source: sourceId,
            "source-layer": "polygons",
            paint: {
                // Because of https://github.com/mapbox/mapbox-gl-js/issues/4090, line opacities < 1 create artifacts
                "line-color": (0, mapboxUtils_1.compileColorToMapbox)(design.borderColor || "#000", (_a = design.axes.color) === null || _a === void 0 ? void 0 : _a.excludedValues),
                "line-opacity": opacity,
                "line-width": 1,
                "line-blur": 1.5
            }
        });
        if (design.displayNames) {
            mapLayers.push({
                id: `${sourceId}:labels`,
                type: "symbol",
                source: sourceId,
                "source-layer": "points",
                layout: {
                    "text-field": design.axes.label ? ["get", "label"] : ["get", "name"],
                    "text-size": 10
                },
                paint: {
                    "text-color": (0, mapboxUtils_1.compileColorToMapbox)("black", (_b = design.axes.color) === null || _b === void 0 ? void 0 : _b.excludedValues),
                    "text-halo-color": (0, mapboxUtils_1.compileColorToMapbox)("rgba(255, 255, 255, 0.5)", (_c = design.axes.color) === null || _c === void 0 ? void 0 : _c.excludedValues),
                    "text-halo-width": 2,
                    "text-opacity": opacity
                }
            });
        }
        return {
            ctes: [{ tableName: "regions", jsonql: cteQuery }],
            sourceLayers: [
                { id: "polygons", jsonql: polygonsQuery },
                { id: "points", jsonql: pointsQuery }
            ],
            mapLayers: mapLayers,
            mapLayersHandleClicks: [`${sourceId}:polygon-fill`],
            minZoom: design.minZoom,
            maxZoom: design.maxZoom
        };
    }
    createDirectVectorTile(design, sourceId, schema, filters, opacity) {
        const axisBuilder = new AxisBuilder_1.default({ schema });
        const regionsTable = design.regionsTable || "admin_regions";
        // Expression of scale and envelope from tile table
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
        Returns two source layers, "polygons" and "points". Points are used for labels.
    
        polygons:
          select name, ST_AsMVTGeom(shape_simplified, tile.envelope) as the_geom_webmercator from
          admin_regions as regions, tile as tile
          where regions.level0 = 242
          and regions.level = 1
          and shape && tile.envelope_with_margin
    
        points:
          select name, ST_AsMVTGeom(
            (select ST_Centroid(polys.geom) from ST_Dump(shape_simplified) as polys order by ST_Area(polys.geom) desc limit 1)
          , tile.envelope) as the_geom_webmercator from
          admin_regions as regions, tile as tile
          where regions.level0 = 242
          and regions.level = 1
          and shape && tile.envelope_with_margin
    
          */
        // Create where
        const where = {
            type: "op",
            op: "and",
            exprs: [
                // Level to display
                {
                    type: "op",
                    op: "=",
                    exprs: [{ type: "field", tableAlias: "regions", column: "level" }, design.detailLevel]
                },
                // Filter to tile
                {
                    type: "op",
                    op: "&&",
                    exprs: [{ type: "field", tableAlias: "regions", column: "shape" }, envelopeWithMarginExpr]
                }
            ]
        };
        // Scope overall
        if (design.scope) {
            where.exprs.push({
                type: "op",
                op: "=",
                exprs: [
                    { type: "field", tableAlias: "regions", column: `level${design.scopeLevel || 0}` },
                    { type: "literal", value: design.scope }
                ]
            });
        }
        // Add filters on regions to outer query
        for (const filter of filters) {
            if (filter.table == regionsTable) {
                where.exprs.push((0, mwater_expressions_1.injectTableAlias)(filter.jsonql, "regions"));
            }
        }
        const polygonsQuery = {
            type: "query",
            selects: [
                { type: "select", expr: { type: "field", tableAlias: "regions", column: "_id" }, alias: "id" },
                {
                    type: "select",
                    expr: {
                        type: "op",
                        op: "ST_AsMVTGeom",
                        exprs: [{ type: "field", tableAlias: "regions", column: "shape_simplified" }, envelopeExpr]
                    },
                    alias: "the_geom_webmercator"
                },
                { type: "select", expr: { type: "field", tableAlias: "regions", column: "name" }, alias: "name" }
            ],
            from: { type: "table", table: regionsTable, alias: "regions" },
            where: where
        };
        const pointsQuery = {
            type: "query",
            selects: [
                { type: "select", expr: { type: "field", tableAlias: "regions", column: "_id" }, alias: "id" },
                {
                    type: "select",
                    expr: {
                        type: "op",
                        op: "ST_AsMVTGeom",
                        exprs: [
                            {
                                type: "scalar",
                                expr: {
                                    type: "op",
                                    op: "ST_Centroid",
                                    exprs: [{ type: "field", tableAlias: "polys", column: "geom" }]
                                },
                                from: {
                                    type: "subexpr",
                                    expr: {
                                        type: "op",
                                        op: "ST_Dump",
                                        exprs: [{ type: "field", tableAlias: "regions", column: "shape_simplified" }]
                                    },
                                    alias: "polys"
                                },
                                orderBy: [
                                    {
                                        expr: {
                                            type: "op",
                                            op: "ST_Area",
                                            exprs: [{ type: "field", tableAlias: "polys", column: "geom" }]
                                        },
                                        direction: "desc"
                                    }
                                ],
                                limit: 1
                            },
                            envelopeExpr
                        ]
                    },
                    alias: "the_geom_webmercator"
                },
                { type: "select", expr: { type: "field", tableAlias: "regions", column: "name" }, alias: "name" }
            ],
            from: { type: "table", table: regionsTable, alias: "regions" },
            where: where
        };
        // Add color select
        if (design.axes.color) {
            const colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "regions" });
            pointsQuery.selects.push({ type: "select", expr: colorExpr, alias: "color" });
            polygonsQuery.selects.push({ type: "select", expr: colorExpr, alias: "color" });
        }
        // Add label select if color axis
        if (design.axes.label) {
            const labelExpr = axisBuilder.compileAxis({ axis: design.axes.label, tableAlias: "regions" });
            pointsQuery.selects.push({ type: "select", expr: labelExpr, alias: "label" });
            polygonsQuery.selects.push({ type: "select", expr: labelExpr, alias: "label" });
        }
        // If color axes, add color conditions
        const color = (0, mapboxUtils_1.compileColorMapToMapbox)(design.axes.color, design.color || "transparent");
        // Create layers
        const mapLayers = [];
        mapLayers.push({
            id: `${sourceId}:polygon-fill`,
            type: "fill",
            source: sourceId,
            "source-layer": "polygons",
            paint: {
                "fill-opacity": design.fillOpacity * design.fillOpacity * opacity,
                "fill-color": color,
                "fill-outline-color": "transparent"
            }
        });
        mapLayers.push({
            id: `${sourceId}:polygon-line`,
            type: "line",
            source: sourceId,
            "source-layer": "polygons",
            paint: {
                // Because of https://github.com/mapbox/mapbox-gl-js/issues/4090, line opacities < 1 create artifacts.
                "line-color": design.borderColor || "#000",
                "line-opacity": opacity,
                "line-width": 1,
                "line-blur": 1.5
            }
        });
        if (design.displayNames) {
            mapLayers.push({
                id: `${sourceId}:labels`,
                type: "symbol",
                source: sourceId,
                "source-layer": "points",
                layout: {
                    "text-field": ["get", "name"],
                    "text-size": 10
                },
                paint: {
                    "text-color": "black",
                    "text-halo-color": "rgba(255, 255, 255, 0.5)",
                    "text-halo-width": 2,
                    "text-opacity": opacity
                }
            });
        }
        return {
            ctes: [],
            sourceLayers: [
                { id: "polygons", jsonql: polygonsQuery },
                { id: "points", jsonql: pointsQuery }
            ],
            mapLayers: mapLayers,
            mapLayersHandleClicks: [`${sourceId}:polygon-fill`],
            minZoom: design.minZoom,
            maxZoom: design.maxZoom
        };
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
    getJsonQLCss(design, schema, filters) {
        // Create design
        const layerDef = {
            layers: [{ id: "layer0", jsonql: this.createMapnikJsonQL(design, schema, filters) }],
            css: this.createCss(design, schema, filters),
            interactivity: {
                layer: "layer0",
                fields: ["id", "name"]
            }
        };
        return layerDef;
    }
    createMapnikJsonQL(design, schema, filters) {
        const axisBuilder = new AxisBuilder_1.default({ schema });
        const exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
        // Verify that scopeLevel is an integer to prevent injection
        if (design.scopeLevel != null && ![0, 1, 2, 3, 4, 5].includes(design.scopeLevel)) {
            throw new Error("Invalid scope level");
        }
        // Verify that detailLevel is an integer to prevent injection
        if (![0, 1, 2, 3, 4, 5].includes(design.detailLevel)) {
            throw new Error("Invalid detail level");
        }
        const regionsTable = design.regionsTable || "admin_regions";
        if (design.regionMode === "plain") {
            /*
            E.g:
            select name, shape_simplified from
              admin_regions as regions
              where regions.level0 = 'eb3e12a2-de1e-49a9-8afd-966eb55d47eb'
              and regions.level = 2
            */
            const query = {
                type: "query",
                selects: [
                    { type: "select", expr: { type: "field", tableAlias: "regions", column: "_id" }, alias: "id" },
                    {
                        type: "select",
                        expr: { type: "field", tableAlias: "regions", column: "shape_simplified" },
                        alias: "the_geom_webmercator"
                    },
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
                            exprs: [{ type: "field", tableAlias: "regions", column: "level" }, design.detailLevel]
                        }
                    ]
                }
            };
            // Scope overall
            if (design.scope) {
                ;
                query.where.exprs.push({
                    type: "op",
                    op: "=",
                    exprs: [
                        { type: "field", tableAlias: "regions", column: `level${design.scopeLevel || 0}` },
                        { type: "literal", value: design.scope }
                    ]
                });
            }
            // Add filters on regions to outer query
            for (const filter of filters) {
                if (filter.table == regionsTable) {
                    ;
                    query.where.exprs.push((0, mwater_expressions_1.injectTableAlias)(filter.jsonql, "regions"));
                }
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
            const compiledAdminRegionExpr = exprCompiler.compileExpr({
                expr: design.adminRegionExpr || null,
                tableAlias: "innerquery"
            });
            // Create inner query
            const innerQuery = {
                type: "query",
                selects: [
                    {
                        type: "select",
                        expr: { type: "field", tableAlias: "regions", column: `level${design.detailLevel}` },
                        alias: "id"
                    }
                ],
                from: {
                    type: "join",
                    kind: "inner",
                    left: { type: "table", table: regionsTable, alias: "regions" },
                    right: exprCompiler.compileTable(design.table, "innerquery"),
                    on: {
                        type: "op",
                        op: "=",
                        exprs: [compiledAdminRegionExpr, { type: "field", tableAlias: "regions", column: "_id" }]
                    }
                },
                groupBy: [1]
            };
            // Add color select if color axis
            if (design.axes.color) {
                const colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "innerquery" });
                innerQuery.selects.push({ type: "select", expr: colorExpr, alias: "color" });
            }
            // Add label select if color axis
            if (design.axes.label) {
                const labelExpr = axisBuilder.compileAxis({ axis: design.axes.label, tableAlias: "innerquery" });
                innerQuery.selects.push({ type: "select", expr: labelExpr, alias: "label" });
            }
            let whereClauses = [];
            if (design.scope) {
                whereClauses.push({
                    type: "op",
                    op: "=",
                    exprs: [{ type: "field", tableAlias: "regions", column: `level${design.scopeLevel || 0}` }, design.scope]
                });
            }
            // Then add filters
            if (design.filter) {
                whereClauses.push(exprCompiler.compileExpr({ expr: design.filter, tableAlias: "innerquery" }));
            }
            // Then add extra filters passed in, if relevant
            const relevantFilters = lodash_1.default.where(filters, { table: design.table });
            for (let filter of relevantFilters) {
                whereClauses.push((0, mwater_expressions_1.injectTableAlias)(filter.jsonql, "innerquery"));
            }
            whereClauses = lodash_1.default.compact(whereClauses);
            if (whereClauses.length > 0) {
                innerQuery.where = { type: "op", op: "and", exprs: whereClauses };
            }
            // Now create outer query
            const query = {
                type: "query",
                selects: [
                    { type: "select", expr: { type: "field", tableAlias: "regions2", column: "_id" }, alias: "id" },
                    {
                        type: "select",
                        expr: { type: "field", tableAlias: "regions2", column: "shape_simplified" },
                        alias: "the_geom_webmercator"
                    },
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
                            exprs: [{ type: "field", tableAlias: "regions2", column: "level" }, design.detailLevel]
                        }
                    ]
                }
            };
            // Scope overall
            if (design.scope) {
                ;
                query.where.exprs.push({
                    type: "op",
                    op: "=",
                    exprs: [
                        { type: "field", tableAlias: "regions2", column: `level${design.scopeLevel || 0}` },
                        { type: "literal", value: design.scope }
                    ]
                });
            }
            // Add filters on regions to outer query
            for (const filter of filters) {
                if (filter.table == regionsTable) {
                    ;
                    query.where.exprs.push((0, mwater_expressions_1.injectTableAlias)(filter.jsonql, "regions2"));
                }
            }
            // Bubble up color and label
            if (design.axes.color) {
                query.selects.push({
                    type: "select",
                    expr: { type: "field", tableAlias: "regions", column: "color" },
                    alias: "color"
                });
            }
            // Add label select if color axis
            if (design.axes.label) {
                query.selects.push({
                    type: "select",
                    expr: { type: "field", tableAlias: "regions", column: "label" },
                    alias: "label"
                });
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
            const query = {
                type: "query",
                selects: [
                    { type: "select", expr: { type: "field", tableAlias: "regions", column: "_id" }, alias: "id" },
                    {
                        type: "select",
                        expr: { type: "field", tableAlias: "regions", column: "shape_simplified" },
                        alias: "the_geom_webmercator"
                    },
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
                            exprs: [{ type: "field", tableAlias: "regions", column: "level" }, design.detailLevel]
                        }
                    ]
                }
            };
            // Add color select
            if (design.axes.color) {
                const colorExpr = axisBuilder.compileAxis({ axis: design.axes.color, tableAlias: "regions" });
                query.selects.push({ type: "select", expr: colorExpr, alias: "color" });
            }
            // Add label select if color axis
            if (design.axes.label) {
                const labelExpr = axisBuilder.compileAxis({ axis: design.axes.label, tableAlias: "regions" });
                query.selects.push({ type: "select", expr: labelExpr, alias: "label" });
            }
            // Scope overall
            if (design.scope) {
                ;
                query.where.exprs.push({
                    type: "op",
                    op: "=",
                    exprs: [
                        { type: "field", tableAlias: "regions", column: `level${design.scopeLevel || 0}` },
                        { type: "literal", value: design.scope }
                    ]
                });
            }
            // Add filters on regions to outer query
            for (const filter of filters) {
                if (filter.table == regionsTable) {
                    ;
                    query.where.exprs.push((0, mwater_expressions_1.injectTableAlias)(filter.jsonql, "regions"));
                }
            }
            return query;
        }
        throw new Error(`Unsupported regionMode ${design.regionMode}`);
    }
    createCss(design, schema, filters) {
        let css = `\
#layer0 {
  line-color: ${design.borderColor || "#000"};
  line-width: 1.5;
  line-opacity: 0.5;
  polygon-opacity: ` +
            design.fillOpacity * design.fillOpacity +
            `;
  polygon-fill: ` +
            (design.color || "transparent") +
            `;
}
\
`;
        if (design.displayNames) {
            css += `\
#layer0::labels {
  text-name: [name];
  text-face-name: 'Arial Regular';
  text-halo-radius: 2;
  text-halo-opacity: 0.5;
  text-halo-fill: #FFF;
}\
`;
        }
        // If color axes, add color conditions
        if (design.axes.color && design.axes.color.colorMap) {
            for (let item of design.axes.color.colorMap) {
                // If invisible
                if (lodash_1.default.includes(design.axes.color.excludedValues || [], item.value)) {
                    css += `#layer0 [color=${JSON.stringify(item.value)}] { line-color: transparent; polygon-opacity: 0; polygon-fill: transparent; }\n`;
                    if (design.displayNames) {
                        css += `#layer0::labels [color=${JSON.stringify(item.value)}] { text-opacity: 0; text-halo-opacity: 0; }\n`;
                    }
                }
                else {
                    css += `#layer0 [color=${JSON.stringify(item.value)}] { polygon-fill: ${item.color}; }\n`;
                }
            }
        }
        return css;
    }
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
    onGridClick(ev, clickOptions) {
        const regionsTable = clickOptions.design.regionsTable || "admin_regions";
        // Row only if mode is "plain" or "direct"
        if (clickOptions.design.regionMode == "plain" || clickOptions.design.regionMode == "direct") {
            if (ev.data && ev.data.id) {
                return {
                    row: { tableId: regionsTable, primaryKey: ev.data.id }
                };
            }
            else {
                return null;
            }
        }
        // Ignore if indirect with no table
        if (!clickOptions.design.table) {
            return null;
        }
        // TODO abstract most to base class
        if (ev.data && ev.data.id) {
            const results = {
                row: { tableId: regionsTable, primaryKey: ev.data.id }
            };
            // Create filter for single row
            const { table } = clickOptions.design;
            // Compile adminRegionExpr
            const exprCompiler = new mwater_expressions_1.ExprCompiler(clickOptions.schema);
            const filterExpr = {
                type: "op",
                op: "within",
                table,
                exprs: [
                    clickOptions.design.adminRegionExpr,
                    { type: "literal", idTable: regionsTable, valueType: "id", value: ev.data.id }
                ]
            };
            const compiledFilterExpr = exprCompiler.compileExpr({ expr: filterExpr, tableAlias: "{alias}" });
            // Filter within
            const filter = {
                table,
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
                        filter,
                        filterExpr,
                        data: ev.data.id
                    };
                }
            }
            else if (clickOptions.design.popup) {
                // Create default popup filter joins
                const defaultPopupFilterJoins = {};
                if (clickOptions.design.adminRegionExpr) {
                    defaultPopupFilterJoins[clickOptions.design.table] = clickOptions.design.adminRegionExpr;
                }
                // Create filter using popupFilterJoins
                const popupFilterJoins = clickOptions.design.popupFilterJoins || defaultPopupFilterJoins;
                const popupFilters = PopupFilterJoinsUtils.createPopupFilters(popupFilterJoins, clickOptions.schema, table, ev.data.id, true);
                // Add filter for admin region
                popupFilters.push({
                    table: regionsTable,
                    jsonql: {
                        type: "op",
                        op: "=",
                        exprs: [
                            { type: "field", tableAlias: "{alias}", column: "_id" },
                            { type: "literal", value: ev.data.id }
                        ]
                    }
                });
                const BlocksLayoutManager = require("../layouts/blocks/BlocksLayoutManager").default;
                const WidgetFactory = require("../widgets/WidgetFactory").default;
                results.popup = new BlocksLayoutManager().renderLayout({
                    items: clickOptions.design.popup.items,
                    style: "popup",
                    renderWidget: (options) => {
                        const widget = WidgetFactory.createWidget(options.type);
                        // Create filters for single row
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
            return results;
        }
        else {
            return null;
        }
    }
    // same as onGridClick but handles hover over
    onGridHoverOver(ev, hoverOptions) {
        const regionsTable = hoverOptions.design.regionsTable || "admin_regions";
        // Row only if mode is "plain" or "direct"
        if (hoverOptions.design.regionMode == "plain" || hoverOptions.design.regionMode == "direct") {
            if (!ev.data || !ev.data.id) {
                return null;
            }
        }
        // Ignore if indirect with no table
        if (!hoverOptions.design.table) {
            return null;
        }
        if (ev.data && ev.data.id) {
            const { table } = hoverOptions.design;
            const results = {};
            // Popup
            if (hoverOptions.design.hoverOver) {
                // Create default popup filter joins
                const defaultPopupFilterJoins = {};
                if (hoverOptions.design.adminRegionExpr) {
                    defaultPopupFilterJoins[hoverOptions.design.table] = hoverOptions.design.adminRegionExpr;
                }
                // Create filter using popupFilterJoins
                const popupFilterJoins = hoverOptions.design.popupFilterJoins || defaultPopupFilterJoins;
                const popupFilters = PopupFilterJoinsUtils.createPopupFilters(popupFilterJoins, hoverOptions.schema, table, ev.data.id, true);
                results.hoverOver = react_1.default.createElement(HoverContent_1.default, {
                    key: ev.data.id,
                    schema: hoverOptions.schema,
                    dataSource: hoverOptions.dataSource,
                    design: hoverOptions.design,
                    filters: popupFilters
                });
            }
            return results;
        }
        else {
            return null;
        }
    }
    // Gets the bounds of the layer as GeoJSON
    getBounds(design, schema, dataSource, filters, callback) {
        const regionsTable = design.regionsTable || "admin_regions";
        const appliedFilters = [];
        // If scoped, use that as filter
        if (design.scope) {
            appliedFilters.push({
                table: regionsTable,
                jsonql: {
                    type: "op",
                    op: "and",
                    exprs: [
                        {
                            type: "op",
                            op: "=",
                            exprs: [{ type: "field", tableAlias: "{alias}", column: `level${design.scopeLevel}` }, design.scope]
                        },
                        {
                            type: "op",
                            op: "=",
                            exprs: [{ type: "field", tableAlias: "{alias}", column: `level` }, design.detailLevel]
                        }
                    ]
                }
            });
        }
        // If regions table is filtered, use that as filter
        for (const filter of filters) {
            if (filter.table == regionsTable) {
                appliedFilters.push(filter);
            }
        }
        // Use shape_simplified for speed, as bounds are always approximate
        return this.getBoundsFromExpr(schema, dataSource, regionsTable, { type: "field", table: regionsTable, column: "shape_simplified" }, null, appliedFilters, callback);
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
        if (filters == null) {
            filters = [];
        }
        const _filters = filters.slice();
        if (design.filter != null) {
            const exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
            const jsonql = exprCompiler.compileExpr({ expr: design.filter, tableAlias: "{alias}" });
            const table = design.filter.table;
            if (jsonql && table) {
                _filters.push({ table: table, jsonql });
            }
        }
        const axisBuilder = new AxisBuilder_1.default({ schema });
        const regionsTable = design.regionsTable || "admin_regions";
        const axisTable = design.regionMode === "direct" ? regionsTable : design.table;
        return react_1.default.createElement(LayerLegendComponent_1.default, {
            schema,
            name,
            filters: lodash_1.default.compact(_filters),
            axis: axisBuilder.cleanAxis({
                axis: design.axes.color || null,
                table: axisTable,
                types: ["enum", "text", "boolean", "date"],
                aggrNeed: design.regionMode == "indirect" ? "required" : "none"
            }) || undefined,
            defaultColor: design.color || undefined,
            locale
        });
    }
    // Get a list of table ids that can be filtered on
    getFilterableTables(design, schema) {
        const filterableTables = [];
        if (design.table) {
            filterableTables.push(design.table);
        }
        if (design.regionMode === "direct") {
            const regionsTable = design.regionsTable || "admin_regions";
            filterableTables.push(regionsTable);
        }
        return filterableTables;
    }
    /** True if layer can be edited */
    isEditable() {
        return true;
    }
    // Returns a cleaned design
    cleanDesign(design, schema) {
        const regionsTable = design.regionsTable || "admin_regions";
        const exprCleaner = new mwater_expressions_1.ExprCleaner(schema);
        const axisBuilder = new AxisBuilder_1.default({ schema });
        design = (0, immer_1.produce)(design, draft => {
            draft.axes = design.axes || {};
            // Default region mode
            if (!design.regionMode) {
                draft.regionMode = draft.axes.color ? "indirect" : "plain";
            }
            // Default color
            if (draft.regionMode === "plain") {
                draft.color = design.color || "#FFFFFF";
            }
            else {
                draft.color = "#FFFFFF";
            }
            if (draft.regionMode === "indirect" && design.table) {
                draft.adminRegionExpr = exprCleaner.cleanExpr(design.adminRegionExpr || null, {
                    table: design.table,
                    types: ["id"],
                    idTable: regionsTable
                });
            }
            else {
                delete draft.adminRegionExpr;
                delete draft.table;
            }
            draft.fillOpacity = design.fillOpacity != null ? design.fillOpacity : 0.75;
            draft.displayNames = design.displayNames != null ? design.displayNames : true;
            // Clean the axes
            if (draft.regionMode === "indirect" && design.table) {
                draft.axes.color = axisBuilder.cleanAxis({
                    axis: draft.axes.color ? (0, immer_1.original)(draft.axes.color) || null : null,
                    table: design.table,
                    types: ["enum", "text", "boolean", "date"],
                    aggrNeed: "required"
                });
                draft.axes.label = axisBuilder.cleanAxis({
                    axis: draft.axes.label ? (0, immer_1.original)(draft.axes.label) || null : null,
                    table: design.table,
                    types: ["text", "number"],
                    aggrNeed: "required"
                });
            }
            else if (draft.regionMode === "plain" || (draft.regionMode === "indirect" && !design.table)) {
                delete draft.axes.color;
                delete draft.axes.label;
            }
            else if (draft.regionMode === "direct") {
                draft.axes.color = axisBuilder.cleanAxis({
                    axis: draft.axes.color ? (0, immer_1.original)(draft.axes.color) || null : null,
                    table: regionsTable,
                    types: ["enum", "text", "boolean", "date"],
                    aggrNeed: "none"
                });
                draft.axes.label = axisBuilder.cleanAxis({
                    axis: draft.axes.label ? (0, immer_1.original)(draft.axes.label) || null : null,
                    table: regionsTable,
                    types: ["text", "number"],
                    aggrNeed: "none"
                });
            }
            // Filter is only for indirect
            if (draft.regionMode === "indirect" && design.table) {
                draft.filter = exprCleaner.cleanExpr(design.filter || null, { table: design.table });
            }
            else {
                delete draft.filter;
            }
            if (design.detailLevel == null) {
                draft.detailLevel = 0;
            }
        });
        return design;
    }
    // Validates design. Null if ok, message otherwise
    validateDesign(design, schema) {
        let error;
        const exprUtils = new mwater_expressions_1.ExprUtils(schema);
        const axisBuilder = new AxisBuilder_1.default({ schema });
        const exprValidator = new mwater_expressions_1.ExprValidator(schema);
        if (design.regionMode === "indirect") {
            if (!design.table) {
                return "Missing table";
            }
            if (!design.adminRegionExpr || exprUtils.getExprType(design.adminRegionExpr) !== "id") {
                return "Missing admin region expr";
            }
            error = axisBuilder.validateAxis({ axis: design.axes.color || null });
            if (error) {
                return error;
            }
            error = axisBuilder.validateAxis({ axis: design.axes.label || null });
            if (error) {
                return error;
            }
            // Validate filter
            error = exprValidator.validateExpr(design.filter || null);
            if (error) {
                return error;
            }
        }
        else if (design.regionMode === "direct") {
            error = axisBuilder.validateAxis({ axis: design.axes.color || null });
            if (error) {
                return error;
            }
            error = axisBuilder.validateAxis({ axis: design.axes.label || null });
            if (error) {
                return error;
            }
        }
        if (design.detailLevel == null) {
            return "Missing detail level";
        }
        return null;
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
        const ChoroplethLayerDesigner = require("./ChoroplethLayerDesigner").default;
        // Clean on way in and out
        return react_1.default.createElement(ChoroplethLayerDesigner, {
            schema: options.schema,
            dataSource: options.dataSource,
            design: this.cleanDesign(options.design, options.schema),
            filters: options.filters,
            onDesignChange: (design) => {
                return options.onDesignChange(this.cleanDesign(design, options.schema));
            }
        });
    }
}
exports.default = ChoroplethLayer;
