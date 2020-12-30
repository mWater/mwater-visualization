import { JsonQLFilter } from ".."
import { WidgetDataSource } from "../widgets/WidgetDataSource";

/** Data source for a layer of a map. Gives urls, popup data */
export interface LayerDataSource {
  /** Get the url for the image tiles with the specified filters applied
   * Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
   * Only called on layers that are valid */
  getTileUrl(design: any, filters: JsonQLFilter[]): string

  /** Get the url for the interactivity tiles with the specified filters applied
   * Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
   * Only called on layers that are valid */
  getUtfGridUrl(design: any, filters: JsonQLFilter[]): string

  /** Gets widget data source for a popup widget */
  getPopupWidgetDataSource(design: any, widgetId: string): WidgetDataSource
}