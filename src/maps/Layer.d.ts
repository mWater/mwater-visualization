import { Schema, DataSource, Expr } from "mwater-expressions";
import { JsonQLFilter } from "../index";
import { OnGridClickResults } from "./maps";
import { ReactNode } from "react";
import { JsonQL, JsonQLQuery } from "jsonql";

export interface JsonQLCssLayerDefinition {
  layers: Array<{ 
    /** Layer id */
    id: string
    /** jsonql that includes "the_webmercator_geom" as a column */
    jsonql: JsonQL
  }>

  /** carto css */
  css: string

  interactivity?: { 
    /** id of layer */
    layer: string, 
    /** array of field names */
    fields: string[] 
  }
}

/** Defines a layer for a map which has all the logic for rendering the specific data to be viewed */
export default class Layer<LayerDesign> {
  /** Gets the type of layer definition */
  getLayerDefinitionType(): "JsonQLCss" | "TileUrl" | "VectorTile"

  /** Gets the layer definition as JsonQL + CSS for type "JsonQLCss"
      arguments:
        design: design of layer
        schema: schema to use
        filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to put in table alias
   */
  getJsonQLCss(design: LayerDesign, schema: Schema, filters: JsonQLFilter[]): JsonQLCssLayerDefinition

  /** Gets the tile url for definition type "TileUrl" */
  getTileUrl(design: LayerDesign, filters: JsonQLFilter[]): string | null

  /** Gets the utf grid url for definition type "TileUrl" */
  getUtfGridUrl(design: LayerDesign, filters: JsonQLFilter[]): string | null

  /** Gets the layer definition for "VectorTile" type
   * @param sourceId id of the source. Should be prefixed to sublayers with a colon (prefix:id)
   * @param opacity opacity of the layer, which MapBox does not allow to be implemented for a whole layer (https://github.com/mapbox/mapbox-gl-js/issues/4090)
   */
  getVectorTile(design: LayerDesign, sourceId: string, schema: Schema, filters: JsonQLFilter[], opacity: number): VectorTileDef

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
  onGridClick(ev: { data: any, event: any }, options: OnGridClickOptions<LayerDesign>): OnGridClickResults

  /** Get the legend to be optionally displayed on the map. Returns a React element */
  getLegend(design: LayerDesign, schema: Schema, name: string, dataSource: DataSource, locale: string, filters: JsonQLFilter[]): ReactNode

  /** Get min zoom level */
  getMinZoom(design: LayerDesign): number | null | undefined

  /** Get max zoom level */
  getMaxZoom(design: LayerDesign): number | null | undefined

  /** Gets the bounds of the layer as GeoJSON */
  getBounds(design: LayerDesign, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[], callback: (err: any, bounds: any) => void): void

  // # Get the legend to be optionally displayed on the map. Returns
  // # a React element
  // getLegend: (design, schema, name, dataSource, filters = []) ->

  /** Get a list of table ids that can be filtered on */
  getFilterableTables(design: LayerDesign, schema: Schema): string[]

  /** True if layer can be edited */
  isEditable(): boolean

  /** True if layer is incomplete (e.g. brand new) and should be editable immediately */
  isIncomplete(design: LayerDesign, schema: Schema): boolean

  // # Creates a design element with specified options.
  // # Design should be cleaned on the way in and on way out.
  // # options:
  // #   design: design of layer
  // #   schema: schema to use
  // #   dataSource: data source to use
  // #   onDesignChange: function called when design changes
  // createDesignerElement: (options) ->

  /** Returns a cleaned design */
  cleanDesign(design: LayerDesign, schema: Schema): LayerDesign

  /** Validates design. Null if ok, message otherwise */
  validateDesign(design: LayerDesign, schema: Schema): string | null

  // # arguments:
  // #   design: design of layer
  // #   schema: schema to use
  // #   filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to put in table alias
  // getKMLExportJsonQL: (design, schema, filters) ->

  /** Convenience function to get the bounds of a geometry expression with filters */
  getBoundsFromExpr(schema: Schema, dataSource: DataSource, table: string, geometryExpr: Expr, filterExpr: Expr, filters: JsonQLFilter[], callback: (err: any, bounds: any) => void): void
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

  /** Sublayers must be mapbox layers that reference the source layers */
  subLayers: mapboxgl.AnyLayer[]

  /** Enforced minimum zoom level */
  minZoom?: number

  /** Enforced maximum zoom level */
  maxZoom?: number
}

export interface VectorTileSourceLayer {
  /** Unique id of the source layer */
  id: string

  /** Query that produces the source layer, without the ST_AsMVT but with the ST_AsMVTGeom. 
   * References CTE called tile which has x, y, z and envelope.
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
