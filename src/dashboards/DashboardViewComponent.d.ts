import { DataSource, Schema } from "mwater-expressions";
import React from "react";
import { DashboardDataSource, JsonQLFilter } from "..";
import { DashboardDesign } from "./DashboardDesign";


/**
 * Displays a dashboard, handling removing of widgets. No title bar or other decorations.
 * Handles scoping and stores the state of scope
 */
export default class DashboardViewComponent extends React.Component<{
  /** schema to use */
  schema: Schema
  /** data source to use. Only used when designing, for display uses dashboardDataSource */
  dataSource: DataSource
  /** dashboard data source */
  dashboardDataSource: DashboardDataSource

  design: DashboardDesign

  /** Leave unset for readonly */
  onDesignChange?: (design: DashboardDesign) => void

  /** Called with (tableId, rowId) when item is clicked */
  onRowClick?: (tableId: string, rowId: any) => void

  /** Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget */
  namedStrings?: { [key: string]: string }
  
  /** Filters to add to the dashboard (includes extra filters and any quickfilters from the dashboard component. Does not include dashboard level filters) */
  filters?: JsonQLFilter[]

  /** Entry to scroll to initially when dashboard is loaded */
  initialTOCEntryScroll?: { widgetId: string, entryId: any }
}> {
}