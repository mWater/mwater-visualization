import { DataSource, Schema } from "mwater-expressions";
import { JsonQLFilter } from "../JsonQLFilter"
import { MapDataSource } from "../maps/MapDataSource";
import Widget from "./Widget";
import { WidgetDataSource } from "./WidgetDataSource";

export default class DirectWidgetDataSource implements WidgetDataSource {
  constructor(options: {
    /** widget object */
    widget: Widget
    /** schema to use */
    schema: Schema
    /** general data source */
    dataSource: DataSource
    /** API url to use for talking to mWater server. Not needed if no map widgets */
    apiUrl: string
    /** client id to use for talking to mWater server. Not needed if no map widgets */
    client?: string
  })

  /** Get the data that the widget needs. The widget should implement getData method (see above) to get the actual data on the server
   * design: design of the widget. Ignored in the case of server-side rendering
   * filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
   * callback: (error, data)
   */
  getData(design: any, filters: JsonQLFilter[], callback: (error: any, data: any) => void): void

  /** For map widgets, the following is required */
  getMapDataSource(design: any): MapDataSource

  /** Get the url to download an image (by id from an image or imagelist column) 
   * Height, if specified, is minimum height needed. May return larger image */
  getImageUrl(imageId: string, height?: number): string
}