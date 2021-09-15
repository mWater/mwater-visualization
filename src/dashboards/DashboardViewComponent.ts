import _ from "lodash"
import PropTypes from "prop-types"
import React, { CSSProperties } from "react"
const R = React.createElement

import ImplicitFilterBuilder from "../ImplicitFilterBuilder"
import * as DashboardUtils from "./DashboardUtils"
import { DataSource, Schema } from "mwater-expressions"
import WidgetFactory from "../widgets/WidgetFactory"
import WidgetScoper from "../widgets/WidgetScoper"
import ReactElementPrinter from "react-library/lib/ReactElementPrinter"
import LayoutManager from "../layouts/LayoutManager"
import WidgetScopesViewComponent from "../widgets/WidgetScopesViewComponent"
import { getLayoutOptions } from "./layoutOptions"
import { WidgetComponent } from "./WidgetComponent"
import { DashboardDataSource, DashboardDesign, JsonQLFilter } from ".."

export interface DashboardViewComponentProps {
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
  initialTOCEntryScroll?: { widgetId: string; entryId: any }

  /** True to hide scope display */
  hideScopes?: boolean

  /** True to render in print mode (prevents odd clipping issue) */
  printMode?: boolean

  /** Change to force a refresh */
  refreshKey?: any
}

/**
 * Displays a dashboard, handling removing of widgets. No title bar or other decorations.
 * Handles scoping and stores the state of scope
 */
export default class DashboardViewComponent extends React.Component<
  DashboardViewComponentProps,
  { widgetScoper: WidgetScoper }
> {
  static childContextTypes = { locale: PropTypes.string }
  widgetComps: { [widgetId: string]: any }

  // Pass locale down. Both here and DashboardViewComponent to ensure that quickfilters also get context
  getChildContext() {
    return { locale: this.props.design.locale }
  }

  constructor(props: any) {
    super(props)
    this.state = {
      widgetScoper: new WidgetScoper() // Empty scoping
    }

    this.widgetComps = {} // Lookup of widget components by id
  }

  componentDidMount() {
    if (this.props.initialTOCEntryScroll) {
      // Getting heights of widgets properly requires a 0 length timeout
      setTimeout(() => {
        return this.handleScrollToTOCEntry(
          this.props.initialTOCEntryScroll!.widgetId,
          this.props.initialTOCEntryScroll!.entryId
        )
      }, 0)
    }

    // Add listener to localstorage to update clipboard display
    return window.addEventListener("storage", this.handleStorageChange)
  }

  componentWillUnmount() {
    // Remove listener
    return window.addEventListener("storage", this.handleStorageChange)
  }

  handleStorageChange = () => {
    return this.forceUpdate()
  }

  handleScopeChange = (id: any, scope: any) => {
    return this.setState({ widgetScoper: this.state.widgetScoper.applyScope(id, scope) })
  }

  handleRemoveScope = (id: any) => {
    return this.setState({ widgetScoper: this.state.widgetScoper.applyScope(id, null) })
  }

  handleItemsChange = (items: any) => {
    const design = _.extend({}, this.props.design, { items }) as DashboardDesign
    return this.props.onDesignChange!(design)
  }

  // Handle a change of the clipboard and determine which tables the clipboard block uses
  handleClipboardChange = (block: any) => {
    try {
      // If empty, just set it
      if (!block) {
        window.localStorage.removeItem("DashboardViewComponent.clipboard")
        this.forceUpdate()
        return
      }

      // Determine which tables are used (just peek for any uses of the table name. Not ideal, but easy)
      const tables = _.pluck(
        _.filter(this.props.schema.getTables(), (table) => JSON.stringify(block).includes(JSON.stringify(table.id))),
        "id"
      )

      // Store in clipboard
      window.localStorage.setItem("DashboardViewComponent.clipboard", JSON.stringify({ block, tables }))
      return this.forceUpdate()
    } catch (err) {
      return alert("Clipboard not available")
    }
  }

  getClipboardContents() {
    try {
      return JSON.parse(window.localStorage.getItem("DashboardViewComponent.clipboard") || "null")
    } catch (err) {
      return null
    }
  }

  // Call to print the dashboard
  print = () => {
    // Create element at 1080 wide (use as standard printing width)
    const elem = R(
      "div",
      { style: { width: 1080 } },
      R(DashboardViewComponent, _.extend({}, this.props, { onDesignChange: null, printMode: true }))
    )

    const printer = new ReactElementPrinter()
    return printer.print(elem, { delay: 5000 })
  }

  // Get filters from props filters combined with dashboard filters
  getCompiledFilters() {
    let compiledFilters = DashboardUtils.getCompiledFilters(
      this.props.design,
      this.props.schema,
      DashboardUtils.getFilterableTables(this.props.design, this.props.schema)
    )
    compiledFilters = compiledFilters.concat(this.props.filters || [])
    return compiledFilters
  }

  // Get list of TOC entries
  getTOCEntries(layoutManager: any) {
    const entries = []

    for (let { id, type, design } of layoutManager.getAllWidgets(this.props.design.items)) {
      const widget = WidgetFactory.createWidget(type)
      // Add widgetId to each one
      for (let entry of widget.getTOCEntries(design, this.props.namedStrings)) {
        entries.push(_.extend({}, entry, { widgetId: id }))
      }
    }

    return entries
  }

  handleScrollToTOCEntry = (widgetId: any, entryId: any) => {
    const widgetComp = this.widgetComps[widgetId]
    if (!widgetComp) {
      return
    }

    // Call scrollToTOCEntry if present
    return widgetComp.scrollToTOCEntry?.(entryId)
  }

  renderScopes() {
    return R(WidgetScopesViewComponent, {
      scopes: this.state.widgetScoper.getScopes(),
      onRemoveScope: this.handleRemoveScope
    })
  }

  compRef = (widgetId: any, comp: any) => {
    return (this.widgetComps[widgetId] = comp)
  }

  render() {
    let cantPasteMessage
    const layoutManager = LayoutManager.createLayoutManager(this.props.design.layout)

    const compiledFilters = this.getCompiledFilters()

    // Get filterable tables
    const filterableTables = DashboardUtils.getFilterableTables(this.props.design, this.props.schema)

    // Determine toc entries
    const tocEntries = this.getTOCEntries(layoutManager)

    // Get clipboard contents
    const clipboardContents = this.getClipboardContents()

    // Check if can't paste because of missing table
    if (clipboardContents && !_.all(clipboardContents.tables, (table: string) => this.props.schema.getTable(table))) {
      cantPasteMessage = "Dashboard is missing one or more data sources needed for the copied item."
    }

    const renderWidget = (options: any) => {
      const widget = WidgetFactory.createWidget(options.type)

      // Get filters (passed in plus dashboard widget scoper filters)
      let filters = compiledFilters.concat(this.state.widgetScoper.getFilters(options.id))

      // Extend the filters to include implicit filters (filter children in 1-n relationships)
      if (this.props.design.implicitFiltersEnabled || this.props.design.implicitFiltersEnabled == null) {
        // Default is true
        const implicitFilterBuilder = new ImplicitFilterBuilder(this.props.schema)
        filters = implicitFilterBuilder.extendFilters(filterableTables, filters)
      }

      const widgetElem = R(WidgetComponent, {
        key: options.id,
        id: options.id,
        type: options.type,
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        dashboardDataSource: this.props.dashboardDataSource,
        design: options.design,
        scope: this.state.widgetScoper.getScope(options.id),
        filters,
        onScopeChange: this.handleScopeChange.bind(null, options.id),
        onDesignChange: options.onDesignChange,
        width: options.width,
        height: options.height,
        onRowClick: this.props.onRowClick,
        namedStrings: this.props.namedStrings,
        tocEntries,
        onScrollToTOCEntry: this.handleScrollToTOCEntry,
        // Keep references to widget elements
        widgetRef: this.compRef.bind(null, options.id),
        refreshKey: this.props.refreshKey
      })

      return widgetElem
    }

    const style: CSSProperties = {
      height: "100%",
      position: "relative"
    }

    if (!this.props.printMode) {
      // Prevent this block from taking up too much space. Scrolling handled by layout manager.
      // Setting overflow-x stops the inner div from becoming too tall
      style.overflowX = "auto"
    }

    // Render widget container
    return R(
      "div",
      { style },
      !this.props.hideScopes ? this.renderScopes() : undefined,

      layoutManager.renderLayout({
        items: this.props.design.items,
        onItemsChange: this.props.onDesignChange != null ? this.handleItemsChange : undefined,
        style: this.props.design.style,
        layoutOptions: getLayoutOptions(this.props.design),
        renderWidget,
        clipboard: clipboardContents?.block,
        onClipboardChange: this.handleClipboardChange,
        cantPasteMessage
      })
    )
  }
}
