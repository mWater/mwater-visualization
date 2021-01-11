import React, { ReactNode } from "react"
import { DashboardDesign } from "./DashboardDesign"
import { Schema, DataSource } from "mwater-expressions"
import { JsonQLFilter } from "../JsonQLFilter"
import DashboardDataSource from './DashboardDataSource'

/** Dashboard component that includes an action bar at the top
 * Manages undo stack and quickfilter value
 */
export default class DashboardComponent extends React.Component<{
  design: DashboardDesign
  /** If not set, readonly */
  onDesignChange?: (design: DashboardDesign) => void

  schema: Schema
  dataSource: DataSource
  /** dashboard data source */
  dashboardDataSource: DashboardDataSource  

  /** Extra element to include in title at left */
  titleElem?: ReactNode

  /** Extra elements to add to right */
  extraTitleButtonsElem?: ReactNode

  /** Key that changes when the undo stack should be reset. Usually a document id or suchlike */
  undoStackKey?: any

  /** True to scale for printing */
  printScaling?: boolean

  /** Called with (tableId, rowId) when item is clicked */
  onRowClick?: (tableId: string, rowId: any) => void

  /** Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget */
  namedStrings?: { [key: string]: string }

  /** Locked quickfilter values. See README in quickfilters */
  quickfilterLocks?: any[]

  /** Initial quickfilter values */
  quickfiltersValues?: any[]

  /** Filters to add to the dashboard */
  filters?: JsonQLFilter[]

  /** True to hide title bar and related controls */
  hideTitleBar?: boolean
}> {}
