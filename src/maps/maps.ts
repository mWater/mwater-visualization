import { JsonQL } from "jsonql";
import { JsonQLFilter } from "..";
import { MapDesign } from "./MapDesign";

export interface LayerDefinition {
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

export type OnGridClickResults = { scope?: any, row?: { tableId: string, primaryKey: any }, popup?: React.ReactElement<{}> } | null

export interface MapDataSource {
  /** Gets the data source for a layer */
  getLayerDataSource: (layerId: string) => MapLayerDataSource
  
  /** Gets the bounds for the map. Null for no opinion. Callback as { n:, s:, w:, e: } */
  getBounds(design: MapDesign, filters: JsonQLFilter[], callback: (bounds: { w: number, n: number, e: number, s: number } | null) => void): void
}

/** Data source for a single map layer */
export interface MapLayerDataSource {
  getTileUrl: (layerDesign: any, filter: JsonQLFilter[]) => string | null
  getUtfGridUrl: (design: MapDesign, filter: JsonQLFilter[]) => string | null
}