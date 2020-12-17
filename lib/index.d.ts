import { Schema, DataSource, Expr } from "mwater-expressions";
import { ReactElement } from "react";  
import React from "react"
import { JsonQL } from "jsonql";

export { default as LeafletMapComponent, MapBounds, TileLayer, GeoJsonLayer, MapLayer } from "./maps/LeafletMapComponent";

export { default as DateRangeComponent } from "./DateRangeComponent";

export { default as RegionSelectComponent } from './maps/RegionSelectComponent'

export * from './datagrids/DatagridDesign'

export { default as TableSelectComponent } from './TableSelectComponent'

export class WidgetFactory {
  static createWidget(type: string): Widget
}

export interface JsonQLFilter {
  table: string
  /** jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
  jsonql: JsonQL
}

export { default as DashboardComponent } from './dashboards/DashboardComponent'
export { default as DashboardDataSource } from './dashboards/DashboardDataSource'
export { default as DirectDashboardDataSource } from './dashboards/DirectDashboardDataSource'
export * from './dashboards/DashboardDesign'

export { default as compressJson } from './compressJson'

export { default as LocaleContextInjector } from './LocaleContextInjector'

/** Scope that a particular widget can apply when a part of it is clicked */
export interface WidgetScope {
  /** Human-readable name of the scope */
  name: string

  /** Filter as JsonQL */
  filter: JsonQLFilter

  /** Filter as an expression */
  filterExpr: Expr

  /** Widget-specific data */
  data: any
}

export class Widget {
  /** Creates a React element that is a view of the widget */
  createViewElement(options: {
    /** schema to use **/
    schema: Schema
    /** data source to use. Only used when designing, for display uses widgetDataSource **/
    dataSource: DataSource
    /** Gives data to the widget in a way that allows client-server separation and secure sharing. See definition in WidgetDataSource. **/
    widgetDataSource: any // TODO
    /** widget design **/
    design: object
    /** scope of the widget (when the widget self-selects a particular scope) **/
    scope?: WidgetScope | null
    /** array of filters to apply.**/
    filters: JsonQLFilter[]
    /** called with scope of widget **/
    onScopeChange: (scope: WidgetScope | null) => void
    /** called with new design. null/undefined for readonly **/
    onDesignChange?: { (design: object): void } | null
    /** width in pixels on screen **/
    width?: number
    /** height in pixels on screen **/
    height?: number
    /** optional table name of table that will be filtered to have a single row present. Widget designer should optionally account for this **/
    singleRowTable?: string
    /** Called with (tableId, rowId) when item is clicked **/
    onRowClick?: (tableId: string, rowId: any) => void
    /** Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget */
    namedStrings?: { [key: string]: string }

  }): ReactElement<any>

// # Get the data that the widget needs. This will be called on the server, typically.
// #   design: design of the chart
// #   schema: schema to use
// #   dataSource: data source to get data from
// #   filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
// #   callback: (error, data)
// getData: (design, schema, dataSource, filters, callback) ->
//   throw new Error("Not implemented")

// # Determine if widget is auto-height, which means that a vertical height is not required.
// isAutoHeight: -> false

// # Get a list of table ids that can be filtered on
// getFilterableTables: (design, schema) ->
//   return []

// # Get table of contents entries for the widget, entries that should be displayed in the TOC.
// # returns `[{ id: "id that is unique within widget", text: "text of TOC entry", level: 1, 2, etc. }]
// getTOCEntries: (design, namedStrings) ->
//   return []
}

export class MWaterLoaderComponent extends React.Component<{
  apiUrl: string
  client?: string
  share?: string
  /**  user id of logged in user */
  user?: string                              
  /**  Load schema as a specific user (for shared dashboards, etc) */
  asUser?: string         
  /**  Extra tables to load in schema. Forms are not loaded by default as they are too many */                   
  extraTables?: string[]  
  /**  Called when extra tables are changed and schema will be reloaded */
  onExtraTablesChange?: (extraTables: string[]) => void
  /**  Override default add layer component. See AddLayerComponent for details */
  addLayerElementFactory?: any              
  children: (error: any, config: { schema: Schema, dataSource: DataSource }) => ReactElement<any>
}> {}

export class MWaterContextComponent extends React.Component<{
  apiUrl: string
  client?: string
  /**  user id of logged in user */
  user?: string                   
  schema: Schema           
  /**  Extra tables to load in schema. Forms are not loaded by default as they are too many */                   
  extraTables?: string[]  
  /**  Called when extra tables are changed and schema will be reloaded */
  onExtraTablesChange?: (extraTables: string[]) => void
  /**  Override default add layer component. See AddLayerComponent for details */
  addLayerElementFactory?: any              
}> {}

export { default as mWaterLoader } from './mWaterLoader'

export class DirectWidgetDataSource {
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

  // # Get the data that the widget needs. The widget should implement getData method (see above) to get the actual data on the server
  // #  design: design of the widget. Ignored in the case of server-side rendering
  // #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  // #  callback: (error, data)
  // getData: (design, filters, callback) ->
  //   @options.widget.getData(design, @options.schema, @options.dataSource, filters, callback)

  // # For map widgets, the following is required
  // #  design: design of the widget. Ignored in the case of server-side rendering
  // getMapDataSource: (design) ->
  //   DirectMapDataSource = require '../maps/DirectMapDataSource'
  //   return new DirectMapDataSource({ apiUrl: @options.apiUrl, client: @options.client, design: design, schema: @options.schema, dataSource: @options.dataSource })

  // # Get the url to download an image (by id from an image or imagelist column)
  // # Height, if specified, is minimum height needed. May return larger image
  // getImageUrl: (imageId, height) ->
  //   return @options.dataSource.getImageUrl(imageId, height)
}