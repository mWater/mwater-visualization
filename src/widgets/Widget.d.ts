import { DataSource, Schema } from "mwater-expressions";
import { ReactElement } from "react";
import { JsonQLFilter } from "../JsonQLFilter"
import { WidgetScope } from "../WidgetScope";

export default class Widget {
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

  /* Get the data that the widget needs. This will be called on the server, typically.
   *   design: design of the chart
   *   schema: schema to use
   *   dataSource: data source to get data from
   *   filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
   *   callback: (error, data)
   */
  getData(design: any, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[], callback: (error: any, data?: any) => void): void

  /** Determine if widget is auto-height, which means that a vertical height is not required. */
  isAutoHeight(): boolean

  /** Get a list of table ids that can be filtered on */
  getFilterableTables(design: any, schema: Schema): string[]

  /** Get table of contents entries for the widget, entries that should be displayed in the TOC. 
   * returns `[{ id: "id that is unique within widget", text: "text of TOC entry", level: 1, 2, etc. }] 
   */
  getTOCEntries(design: any, namedStrings: { [key: string]: string }): { id: string, text: string, level: number }[]
}
