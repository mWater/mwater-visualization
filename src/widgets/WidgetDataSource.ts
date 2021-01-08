import { JsonQLFilter } from ".."
import { MapDataSource } from "../maps/MapDataSource"
import { MapDesign } from "../maps/MapDesign"

/** Interface for a widget data source that gives the widget access to the data it needs, even if that data is not directly available from the data source
 * For example, Alice might share a widget with Bob. Bob can't access the data directly that Alice sees (since it's private), but he can use the widget 
 * data source to get it, as the server will return the exact data he needs for the widget, since the server has a copy of the design of the widget.
 */
export interface WidgetDataSource {
  /** Get the data that the widget needs. The widget should implement getData method (see above) to get the actual data on the server
   *  design: design of the widget. Ignored in the case of server-side rendering
   *  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
   *  callback: (error, data)
   */
  getData(design: any, filters: JsonQLFilter[], callback: (error: any, data?: any) => void): void

  /** For map widgets, the following is required */
  getMapDataSource?(design: MapDesign): MapDataSource

  /** Get the url to download an image (by id from an image or imagelist column) 
   * Height, if specified, is minimum height needed. May return larger image */
  getImageUrl(imageId: string, height?: number): string
}