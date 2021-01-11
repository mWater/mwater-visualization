import { JsonQL } from "jsonql";
import { JsonQLFilter } from "../JsonQLFilter"
import { MapLayerDataSource } from "./MapLayerDataSource";
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
