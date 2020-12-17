import { Expr, LiteralType } from "mwater-expressions"

/** Maps are stored as a base layer, a series of layers and filters. */
export interface MapDesign {
  /** "bing_road"/"bing_aerial"/"cartodb_positron"/"cartodb_dark_matter"/"blank" */
  baseLayer: "bing_road" | "bing_aerial" | "cartodb_positron" | "cartodb_dark_matter" | "blank"

  /** 0-1 opacity. null/undefined = 1 */
  baseLayerOpacity?: number | null

  /** [ see layer view below ] */
  layerViews: MapLayerView[]

  /** filter expression indexed by table. e.g. { sometable: logical expression, etc. } */
  filters: { [tableId: string]: Expr }

  /** bounds as { w:, n:, e:, s: } */
  bounds: { w: number, n: number, e: number, s: number }

  /** User defined attribution string, added with other required attributions to the map */
  attribution?: string

  /** true to automatically zoom to bounds of data */
  autoBounds?: boolean

  /** maximum allowed zoom level */
  maxZoom?: boolean

  /** array of global filters. See below. */
  globalFilters?: GlobalFilter[]
}


/** Is a view of a layer including whether visible, opacity. */
export interface MapLayerView {
  /** unique id */
  id: string

  /** string name */
  name: string

  /** string description (not currently shown used) */
  desc?: string

  /** type of the layer. Pass this to layer factory with design */
  type: string

  /** design of the layer. Layer-type specific */
  design: any

  /** true/false */
  visible: boolean

  /** 0.0-1.0 */
  opacity: number

  /** optional group. layers in the same group act as radio buttons */
  group?: string | null

  /** true to hide legend */
  hideLegend?: boolean
}

/** Global filters apply to multiple tables at once if a certain column is present. User-interface to set them is application-specific
and the default (non-mWater) dashboard applies them but does not allow editing. */
export interface GlobalFilter {
  /** id of column to filter */
  columnId: string

  /** type of column to filter (to ensure that consistent) */
  columnType: LiteralType

  /** op of expression for filtering */
  op: string

  /** array of expressions to use for filtering. field expression for column will be injected as expression 0 in the resulting filter expression */
  exprs: Expr[]
}
