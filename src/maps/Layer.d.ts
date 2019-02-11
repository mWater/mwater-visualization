import { JsonQL, Schema, DataSource } from "mwater-expressions";
import { JsonQLFilter } from "../index";
import { OnGridClickResults } from "./maps";

declare interface LayerDefinition {
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
declare class Layer {
  /** Gets the layer definition as JsonQL + CSS
    # arguments:
    #   design: design of layer
    #   schema: schema to use
    #   filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to put in table alias
   */
  getJsonQLCss(design: any, schema: Schema, filters: JsonQLFilter[]): LayerDefinition

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
    design: any
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

    // # Gets the bounds of the layer as GeoJSON
    // getBounds: (design, schema, dataSource, filters, callback) ->
  
    // # Get min and max zoom levels
    // getMinZoom: (design) -> return null
    // getMaxZoom: (design) -> return null
  
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
  
    // # Returns a cleaned design
    // cleanDesign: (design, schema) ->
  
    // # Validates design. Null if ok, message otherwise
    // validateDesign: (design, schema) ->
  
    // # arguments:
    // #   design: design of layer
    // #   schema: schema to use
    // #   filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to put in table alias
    // getKMLExportJsonQL: (design, schema, filters) ->
  
    // # Convenience function to get the bounds of a geometry expression with filters
    // getBoundsFromExpr: (schema, dataSource, table, geometryExpr, filterExpr, filters, callback) ->
}

export = Layer