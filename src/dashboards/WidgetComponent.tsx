import { Schema, DataSource } from "mwater-expressions"
import { useMemo, useRef } from "react"
import { JsonQLFilter } from "../JsonQLFilter"
import WidgetFactory from "../widgets/WidgetFactory"
import { WidgetScope } from "../WidgetScope"
import DashboardDataSource from "./DashboardDataSource"

/**
 * Component which renders a widget and ensures that props do not change
 * unnecessarily.
 */
export function WidgetComponent(props: {
  /** Widget id */
  id: string
  /** Widget type */
  type: string

  /** Widget design */
  design: any

  /** Called with new widget design. null/undefined for readonly **/
  onDesignChange?: { (design: object): void } | null

  /** Data source for dashboard */
  dashboardDataSource: DashboardDataSource

  /** schema to use **/
  schema: Schema

  /** data source to use. Only used when designing, for display uses widgetDataSource **/
  dataSource: DataSource

  /** scope of the widget (when the widget self-selects a particular scope) **/
  scope?: WidgetScope | null

  /** array of filters to apply.**/
  filters: JsonQLFilter[]

  /** called with scope of widget **/
  onScopeChange: (scope: WidgetScope | null) => void

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

  /** Entries in the table of content */
  tocEntries?: string[]

  /** the widget callback ref */
  widgetRef: (widget: any) => void

  /** called with (widgetId, tocEntryId) to scroll to TOC entry */
  onScrollToTOCEntry?: (widgetId: string, tocEntryId: string) => void

  /** Change to force a refresh */
  refreshKey?: any
}) {
  // Get and stabilize widget data source
  // TODO!!! There is a global problem with DashboardDataSources being re-created on each render.
  // TODO!!! This now only uses the type of the dashboard data source. They should be more stable in the future.
  const widgetDataSource = useMemo(
    () => props.dashboardDataSource.getWidgetDataSource(props.type, props.id),
    [props.dashboardDataSource.constructor, props.type, props.id, props.schema, props.dataSource, props.refreshKey]
  )

  const widget = WidgetFactory.createWidget(props.type)

  // Stabilize functions
  const onDesignChange = useStabilizeFunction(props.onDesignChange)
  const onRowClick = useStabilizeFunction(props.onRowClick) || undefined
  const onScopeChange = useStabilizeFunction(props.onScopeChange)!
  const widgetRef = useStabilizeFunction(props.widgetRef)!

  // Stabilize values
  const filters = useStabilizeValue(props.filters)
  const scope = useStabilizeValue(props.scope)

  return widget.createViewElement({
    schema: props.schema,
    dataSource: props.dataSource,
    widgetDataSource,
    design: props.design,
    scope,
    filters,
    onScopeChange,
    onDesignChange,
    width: props.width,
    height: props.height,
    singleRowTable: props.singleRowTable,
    onRowClick,
    namedStrings: props.namedStrings,
    tocEntries: props.tocEntries,
    onScrollToTOCEntry: props.onScrollToTOCEntry,
    widgetRef
  })
}

/** Always returns the same function to prevent unnecessary re-rendering. Forwards to the real function */
function useStabilizeFunction<T extends Function>(func: T | undefined | null): T | undefined | null {
  // Create ref for changing func
  const variableRef = useRef<T | null>()
  variableRef.current = func

  // Create stable function to always use as callback
  function stableCallback(...args: any[]) {
    return variableRef.current!.apply(null, args)
  }
  const stableRef = useRef<T>(stableCallback as any)
  return func ? stableRef.current : undefined
}

/** Always returns the same value of stringifies the same to prevent unnecessary re-rendering */
function useStabilizeValue<T>(value: T): T {
  const stableRef = useRef<T>(value)

  if (JSON.stringify(value) != JSON.stringify(stableRef.current)) {
    stableRef.current = value
  }
  return stableRef.current
}
