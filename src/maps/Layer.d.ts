import { Schema, DataSource, Expr } from "mwater-expressions";
import { JsonQLFilter } from "../index";
import { OnGridClickResults } from "./maps";
import { ReactNode } from "react";
import { SecureClientSessionOptions } from "http2";
import { JsonQL } from "jsonql";

declare interface JsonQLCssLayerDefinition {
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
declare class Layer<LayerDesign> {
  /** Gets the type of layer definition */
  getLayerDefinitionType(): "JsonQLCss" | "TileUrl"

  /** Gets the layer definition as JsonQL + CSS
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
  onGridClick(ev: { data: any }, options: {
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
  }): OnGridClickResults

  /** Get the legend to be optionally displayed on the map. Returns a React element */
  getLegend(design: LayerDesign, schema: Schema, name: string, dataSource: DataSource, filters: JsonQLFilter[]): ReactNode

  /** Get min zoom level */
  getMinZoom(design: LayerDesign): number | null | undefined

  /** Get max zoom level */
  getMaxZoom(design: LayerDesign): number | null | undefined

  /** Gets the bounds of the layer as GeoJSON */
  getBounds(design: LayerDesign, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[], callback: (err: any, bounds: any) => void): void

  // # Get the legend to be optionally displayed on the map. Returns
  // # a React element
  // getLegend: (design, schema, name, dataSource, filters = []) ->

  // # Get a list of table ids that can be filtered on
  // getFilterableTables: (design, schema) ->

  // # True if layer can be edited
  // isEditable: () ->

  // # True if layer is incomplete (e.g. brand new) and should be editable immediately
  // isIncomplete: (design, schema) ->

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

export = Layer