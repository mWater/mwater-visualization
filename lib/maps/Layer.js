"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_1 = require("mwater-expressions");
const mwater_expressions_2 = require("mwater-expressions");
const bbox_1 = __importDefault(require("@turf/bbox"));
/** Defines a layer for a map which has all the logic for rendering the specific data to be viewed */
class Layer {
    /** Gets the type of layer definition */
    getLayerDefinitionType() {
        return "JsonQLCss";
    }
    /** Gets the layer definition as JsonQL + CSS for type "JsonQLCss"
        arguments:
          design: design of layer
          schema: schema to use
          filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to put in table alias
     */
    getJsonQLCss(design, schema, filters) {
        throw new Error("Not implemented");
    }
    /** Gets the utf grid url for definition type "TileUrl" */
    getUtfGridUrl(design, filters) {
        throw new Error("Not implemented");
    }
    /** Gets the layer definition for "VectorTile" type
     * @param sourceId id of the source. Should be prefixed to sublayers with a colon (prefix:id)
     * @param opacity opacity of the layer, which MapBox does not allow to be implemented for a whole layer (https://github.com/mapbox/mapbox-gl-js/issues/4090)
     */
    getVectorTile(design, sourceId, schema, filters, opacity) {
        throw new Error("Not implemented");
    }
    /**
     * Called when the interactivity grid is clicked.
     * arguments:
     *   ev: { data: interactivty data e.g. `{ id: 123 }` }
     *   options:
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
    onGridClick(ev, options) {
        return null;
    }
    /** Gets the bounds of the layer as GeoJSON */
    getBounds(design, schema, dataSource, filters, callback) {
        callback(null);
    }
    /** Get min zoom level */
    getMinZoom(design) {
        return null;
    }
    /** Get max zoom level */
    getMaxZoom(design) {
        return null;
    }
    /** Get the legend to be optionally displayed on the map. Returns a React element */
    getLegend(design, schema, name, dataSource, locale, filters) {
        return null;
    }
    /** Get a list of table ids that can be filtered on */
    getFilterableTables(design, schema) {
        return [];
    }
    /** True if layer can be edited */
    isEditable() {
        return false;
    }
    /** True if layer is incomplete (e.g. brand new) and should be editable immediately */
    isIncomplete(design, schema) {
        return this.validateDesign(this.cleanDesign(design, schema), schema) != null;
    }
    // Creates a design element with specified options.
    // Design should be cleaned on the way in and on way out.
    // options:
    //   design: design of layer
    //   schema: schema to use
    //   dataSource: data source to use
    //   onDesignChange: function called when design changes
    createDesignerElement(options) {
        throw new Error("Not implemented");
    }
    /** Returns a cleaned design */
    cleanDesign(design, schema) {
        return design;
    }
    /** Validates design. Null if ok, message otherwise */
    validateDesign(design, schema) {
        return null;
    }
    /** Convenience function to get the bounds of a geometry expression with filters */
    getBoundsFromExpr(schema, dataSource, table, geometryExpr, filterExpr, filters, callback) {
        const exprCompiler = new mwater_expressions_1.ExprCompiler(schema);
        const compiledGeometryExpr = exprCompiler.compileExpr({ expr: geometryExpr, tableAlias: "main" });
        // Create where clause from filters
        let where = {
            type: "op",
            op: "and",
            exprs: lodash_1.default.pluck(lodash_1.default.where(filters, { table }), "jsonql")
        };
        if (filterExpr) {
            where.exprs.push(exprCompiler.compileExpr({ expr: filterExpr, tableAlias: "main" }));
        }
        // Compact and inject alias
        where.exprs = lodash_1.default.compact(where.exprs);
        where = (0, mwater_expressions_2.injectTableAlias)(where, "main");
        // Get bounds
        const boundsQuery = {
            type: "query",
            selects: [
                {
                    type: "select",
                    expr: {
                        type: "op",
                        op: "::json",
                        exprs: [
                            {
                                type: "op",
                                op: "ST_AsGeoJSON",
                                exprs: [
                                    {
                                        type: "op",
                                        op: "ST_Transform",
                                        exprs: [
                                            {
                                                type: "op",
                                                op: "ST_SetSRID",
                                                exprs: [{ type: "op", op: "ST_Extent", exprs: [compiledGeometryExpr] }, 3857]
                                            },
                                            4326
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    alias: "bounds"
                }
            ],
            from: { type: "table", table, alias: "main" },
            where
        };
        return dataSource.performQuery(boundsQuery, (err, results) => {
            if (err) {
                return callback(err);
            }
            else {
                // Null if no bounds can be calculated
                let bounds = null;
                if (results[0].bounds) {
                    const [w, s, e, n] = (0, bbox_1.default)(results[0].bounds);
                    // Pad to 10km if point
                    if (w === e && n === s) {
                        bounds = {
                            w: w - 0.1,
                            s: s - 0.1,
                            e: e + 0.1,
                            n: n + 0.1
                        };
                        // Pad bounds to prevent too small box (10m)
                    }
                    else {
                        bounds = {
                            w: w - 0.001,
                            s: s - 0.001,
                            e: e + 0.001,
                            n: n + 0.001
                        };
                    }
                }
                return callback(null, bounds);
            }
        });
    }
}
exports.default = Layer;
