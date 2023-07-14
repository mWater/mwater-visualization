import { JsonQLQuery } from "jsonql"
import { Expr } from "mwater-expressions"

export interface LayerDefinition {
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

export type OnGridClickResults = {
  scope?: any
  row?: { tableId: string; primaryKey: any }
  popup?: React.ReactElement<{}>
} | null

export type OnGridHoverResults = {
  scope?: any
  hoverOver?: React.ReactElement<{}>
} | null

export interface HoverOverItem {
  id: string
  label: string
  value?: Expr
}
