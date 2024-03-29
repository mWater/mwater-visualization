import { DataSource, Schema } from "mwater-expressions"
import { ReactNode } from "react"
import { JsonQLFilter } from "../../JsonQLFilter"
import { WidgetScope } from "../../WidgetScope"
import { WidgetDataSource } from "../WidgetDataSource"

export interface ChartCreateViewElementOptions {
  /** schema to use **/
  schema: Schema

  /** data source to use. Only used when designing, for display uses data **/
  dataSource: DataSource

  /** Chart design **/
  design: any

  /** called with new design. null/undefined for readonly **/
  onDesignChange?: { (design: any): void } | null

  /** Data that chart requested */
  data: any

  /** scope of the widget (when the widget self-selects a particular scope) **/
  scope?: WidgetScope | null

  /** called with scope of widget **/
  onScopeChange?: (scope: WidgetScope | null) => void

  /** array of filters to apply.**/
  filters?: JsonQLFilter[]

  /** width in pixels on screen **/
  width?: number

  /** height in pixels on screen **/
  height?: number

  /** Called with (tableId, rowId) when item is clicked **/
  onRowClick?: (tableId: string, rowId: any) => void
}

export default class Chart {
  // Removes any invalid values from a design. Returns cleaned design
  cleanDesign(design: any, schema: Schema) {
    throw new Error("Not implemented")
  }

  // Determines if design is valid. Null/undefined for yes, error string for no
  validateDesign(design: any, schema: Schema): null | undefined | string {
    throw new Error("Not implemented")
  }

  // True if a design is empty and so to display the editor immediately
  isEmpty(design: any) {
    return false
  }

  // Determine if widget is auto-height, which means that a vertical height is not required.
  isAutoHeight() {
    return false
  }

  // True if designer should have a preview pane to the left
  hasDesignerPreview() {
    return true
  }

  // Label for the edit gear dropdown
  getEditLabel() {
    return "Edit"
  }

  // Creates a design element with specified options
  // options include:
  //   schema: schema to use
  //   dataSource: dataSource to use
  //   design: design
  //   onDesignChange: function
  createDesignerElement(options: {
    schema: Schema
    dataSource: DataSource
    /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
    filters?: JsonQLFilter[]
    design: any
    onDesignChange: (design: any) => void
  }): ReactNode {
    throw new Error("Not implemented")
  }

  // Get data for the chart asynchronously. Charts should not call this directly!
  // Instead they should use the widgetDataSource provided to the chart view.
  //   design: design of the chart
  //   schema: schema to use
  //   dataSource: data source to get data from
  //   filters: array of { table: table id, jsonql: jsonql condition with {alias} for tableAlias }
  //   callback: (error, data)
  getData(design: any, schema: Schema, dataSource: DataSource, filters: any, callback: any) {
    throw new Error("Not implemented")
  }

  // Create a view element for the chart
  // Options include:
  //   schema: schema to use
  //   dataSource: dataSource to use
  //   design: design of the chart
  //   onDesignChange: when design changes
  //   data: results from queries
  //   width, height: size of the chart view
  //   scope: current scope of the view element
  //   onScopeChange: called when scope changes with new scope
  //   onRowClick: Called with (tableId, rowId) when item is clicked
  createViewElement(options: ChartCreateViewElementOptions): ReactNode {
    throw new Error("Not implemented")
  }

  // Creates the dropdown menu items of shape {label, action}
  //   design: design of the chart
  //   schema: schema to use
  //   widgetDataSource: widget data source to use
  //   filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  // Returns an empty list by default
  createDropdownItems(design: any, schema: Schema, widgetDataSource: WidgetDataSource, filters: any): { label: ReactNode, icon?: string, onClick: () => void }[] {
    return []
  }

  // Creates a table form of the chart data. Array of arrays
  createDataTable(design: any, schema: Schema, dataSource: DataSource, data: any, locale: any): any[][] {
    throw new Error("Not implemented")
  }

  // Get a list of table ids that can be filtered on
  getFilterableTables(design: any, schema: Schema): string[] {
    throw new Error("Not implemented")
  }

  // Get the chart placeholder icon. fa-XYZ or glyphicon-XYZ
  getPlaceholderIcon() {
    return ""
  }
}
