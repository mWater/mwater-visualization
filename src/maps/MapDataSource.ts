import { JsonQLFilter } from "../JsonQLFilter"
import { MapLayerDataSource } from "./MapLayerDataSource"
import { MapDesign } from "./MapDesign"
import { QuickfiltersDataSource } from "../quickfilter/QuickfiltersDataSource"

/** Map data source gives data sources for layers */
export interface MapDataSource {
  /** Gets the data source for a layer */
  getLayerDataSource: (layerId: string) => MapLayerDataSource

  /** Gets the quickfilters data source */
  getQuickfiltersDataSource(): QuickfiltersDataSource

  /** Gets the bounds for the map. Null for no opinion. Callback as { n:, s:, w:, e: } */
  getBounds(
    design: MapDesign,
    filters: JsonQLFilter[],
    callback: (error: any, bounds?: { w: number; n: number; e: number; s: number } | null) => void
  ): void
}
