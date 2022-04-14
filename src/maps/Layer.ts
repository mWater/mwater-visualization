import _ from "lodash"
import { ExprCompiler } from "mwater-expressions"
import { injectTableAlias } from "mwater-expressions"
import { default as bbox } from "@turf/bbox"

import { Schema, DataSource, Expr } from "mwater-expressions"
import { JsonQLFilter } from "../index"
import { OnGridClickResults } from "./maps"
import { ReactNode } from "react"
import { JsonQLExpr, JsonQLQuery, JsonQLSelectQuery } from "jsonql"
import { LayerSpecification } from "maplibre-gl"

export interface JsonQLCssLayerDefinition {
  layers: Array<{
    /** Layer id */
    id: string
    /** jsonql that includes "the_webmercator_geom" as a column */
    jsonql: JsonQLQuery
  }>

  /** carto css */
  css: string

  interactivity?: {
    /** id of layer */
    layer: string
    /** array of field names */
    fields: string[]
  }
}

export interface OnGridClickOptions<LayerDesign> {
  /** design of layer */
  design: LayerDesign
  /** schema to use */
  schema: Schema
  /** data source to use */
  dataSource: DataSource
  /** layer data source */
  layerDataSource: any // TODO
  /** current scope data if layer is scoping */
  scopeData: any
  /** compiled filters to apply to the popup */
  filters: JsonQLFilter[]
}

/** Definition of a vector tile layer */
export interface VectorTileDef {
  sourceLayers: VectorTileSourceLayer[]

  /** Common table expressions of the tiles */
  ctes: VectorTileCTE[]

  /** Map layers must be mapbox layers that reference the source layers */
  mapLayers: LayerSpecification[]

  /** Which layer ids have click handlers attached. Should be non-overlapping */
  mapLayersHandleClicks: string[]

  /** Enforced minimum zoom level */
  minZoom?: number

  /** Enforced maximum zoom level */
  maxZoom?: number
}

export interface VectorTileSourceLayer {
  /** Unique id of the source layer */
  id: string

  /** Query that produces the source layer, without the ST_AsMVT but with the ST_AsMVTGeom.
   * References CTE called tile which has x, y, z, envelope and envelope_with_margin.
   */
  jsonql: JsonQLQuery
}

/** Common table expression that a vector tile source layer can reference.
 * Will be pre-computed and cached. Cannot reference tile parameters.
 */
export interface VectorTileCTE {
  /** tableName of the cte table. Must be [a-z]+ */
  tableName: string

  /** Contents of the CTE table */
  jsonql: JsonQLQuery
}

/** Defines a layer for a map which has all the logic for rendering the specific data to be viewed */
export default class Layer<LayerDesign> {
  /** Gets the type of layer definition */
  getLayerDefinitionType(): "JsonQLCss" | "TileUrl" | "VectorTile" {
    return "JsonQLCss"
  }

  /** Gets the layer definition as JsonQL + CSS for type "JsonQLCss"
      arguments:
        design: design of layer
        schema: schema to use
        filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to put in table alias
   */
  getJsonQLCss(design: LayerDesign, schema: Schema, filters: JsonQLFilter[]): JsonQLCssLayerDefinition {
    throw new Error("Not implemented")
  }

  /** Gets the utf grid url for definition type "TileUrl" */
  getUtfGridUrl(design: LayerDesign, filters: JsonQLFilter[]): string | null {
    throw new Error("Not implemented")
  }

  /** Gets the layer definition for "VectorTile" type
   * @param sourceId id of the source. Should be prefixed to sublayers with a colon (prefix:id)
   * @param opacity opacity of the layer, which MapBox does not allow to be implemented for a whole layer (https://github.com/mapbox/mapbox-gl-js/issues/4090)
   */
  getVectorTile(
    design: LayerDesign,
    sourceId: string,
    schema: Schema,
    filters: JsonQLFilter[],
    opacity: number
  ): VectorTileDef {
    throw new Error("Not implemented")
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
  onGridClick(ev: { data: any; event: any }, options: OnGridClickOptions<LayerDesign>): OnGridClickResults {
    return null
  }

  /** Gets the bounds of the layer as GeoJSON */
  getBounds(
    design: LayerDesign,
    schema: Schema,
    dataSource: DataSource,
    filters: JsonQLFilter[],
    callback: (err: any, bounds?: { n: number; s: number; e: number; w: number } | null) => void
  ): void {
    callback(null)
  }

  /** Get min zoom level */
  getMinZoom(design: LayerDesign): number | null | undefined {
    return null
  }

  /** Get max zoom level */
  getMaxZoom(design: LayerDesign): number | null | undefined {
    return null
  }

  /** Get the legend to be optionally displayed on the map. Returns a React element */
  getLegend(
    design: LayerDesign,
    schema: Schema,
    name: string,
    dataSource: DataSource,
    locale: string,
    filters: JsonQLFilter[]
  ): ReactNode {
    return null
  }

  /** Get a list of table ids that can be filtered on */
  getFilterableTables(design: LayerDesign, schema: Schema): string[] {
    return []
  }

  /** True if layer can be edited */
  isEditable(): boolean {
    return false
  }

  /** True if layer is incomplete (e.g. brand new) and should be editable immediately */
  isIncomplete(design: LayerDesign, schema: Schema): boolean {
    return this.validateDesign(this.cleanDesign(design, schema), schema) != null
  }

  // Creates a design element with specified options.
  // Design should be cleaned on the way in and on way out.
  // options:
  //   design: design of layer
  //   schema: schema to use
  //   dataSource: data source to use
  //   onDesignChange: function called when design changes
  createDesignerElement(options: {
    design: LayerDesign
    schema: Schema
    dataSource: DataSource
    onDesignChange: (design: LayerDesign) => void
  }) {
    throw new Error("Not implemented")
  }

  /** Returns a cleaned design */
  cleanDesign(design: LayerDesign, schema: Schema): LayerDesign {
    return design
  }

  /** Validates design. Null if ok, message otherwise */
  validateDesign(design: LayerDesign, schema: Schema): string | null {
    return null
  }

  /** Convenience function to get the bounds of a geometry expression with filters */
  getBoundsFromExpr(
    schema: Schema,
    dataSource: DataSource,
    table: string,
    geometryExpr: Expr,
    filterExpr: Expr,
    filters: JsonQLFilter[],
    callback: (err: any, bounds?: { n: number; e: number; w: number; s: number } | null) => void
  ): void {
    const exprCompiler = new ExprCompiler(schema)
    const compiledGeometryExpr = exprCompiler.compileExpr({ expr: geometryExpr, tableAlias: "main" })

    // Create where clause from filters
    let where: JsonQLExpr = {
      type: "op",
      op: "and",
      exprs: _.pluck(_.where(filters, { table }), "jsonql")
    }

    if (filterExpr) {
      where.exprs.push(exprCompiler.compileExpr({ expr: filterExpr, tableAlias: "main" }))
    }

    // Compact and inject alias
    where.exprs = _.compact(where.exprs)
    where = injectTableAlias(where, "main")

    // Get bounds
    const boundsQuery: JsonQLSelectQuery = {
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
    }

    return dataSource.performQuery(boundsQuery, (err: any, results: any) => {
      if (err) {
        return callback(err)
      } else {
        // Null if no bounds can be calculated
        let bounds = null

        if (results[0].bounds) {
          const [w, s, e, n] = bbox(results[0].bounds)
          // Pad to 10km if point
          if (w === e && n === s) {
            bounds = {
              w: w - 0.1,
              s: s - 0.1,
              e: e + 0.1,
              n: n + 0.1
            }
            // Pad bounds to prevent too small box (10m)
          } else {
            bounds = {
              w: w - 0.001,
              s: s - 0.001,
              e: e + 0.001,
              n: n + 0.001
            }
          }
        }

        return callback(null, bounds)
      }
    })
  }
}
