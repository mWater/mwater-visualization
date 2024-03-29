import _ from "lodash"
import { DataSource, Schema } from "mwater-expressions"
import React, { CSSProperties } from "react"
import { JsonQLFilter } from "../../JsonQLFilter"
import { WidgetScope } from "../../WidgetScope"
import { WidgetDataSource } from "../WidgetDataSource"
import Chart from "./Chart"
const R = React.createElement

export interface ChartViewComponentProps {
  /** Chart object to use */
  chart: Chart

  /** Design of chart */
  design: any

  /** When design change */
  onDesignChange?: (design: any) => void

  schema: Schema
  /** Data source to use for chart */
  dataSource: DataSource

  widgetDataSource: WidgetDataSource
  width?: number
  height?: number

  /** scope of the widget (when the widget self-selects a particular scope) */
  scope?: WidgetScope

  /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias }. Use injectAlias to correct */
  filters?: JsonQLFilter[]

  /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
  onScopeChange?: (scope: WidgetScope | null) => void

  onRowClick?: (tableId: string, rowId: any) => void
}

interface ChartViewComponentState {
  cacheExpiry?: any
  dataLoading?: any
  validDesign?: any
  dataError?: any
  data?: any
  showErrorDetails: boolean
}

/** Inner view part of the chart widget. Uses a query data loading component
 * to handle loading and continues to display old data if design becomes
 * invalid
 */
export default class ChartViewComponent extends React.Component<ChartViewComponentProps, ChartViewComponentState> {
  /** Ordinal of update (0, 1, 2...) to ensure using latest */
  updateSeq: number

  constructor(props: ChartViewComponentProps) {
    super(props)

    this.updateSeq = 0

    this.state = {
      validDesign: null, // last valid design
      data: null, // data for chart
      dataLoading: false, // True when loading data
      dataError: null, // Set when data loading returned error
      cacheExpiry: props.dataSource.getCacheExpiry(), // Save cache expiry to see if changes
      showErrorDetails: false
    }
  }

  componentDidMount() {
    this.updateData()
  }

  componentDidUpdate(prevProps: ChartViewComponentProps) {
    if (
      !_.isEqual(prevProps.design, this.props.design) ||
      !_.isEqual(prevProps.filters, this.props.filters) ||
      this.props.dataSource.getCacheExpiry() !== this.state.cacheExpiry
    ) {
      // Save new cache expiry
      this.setState({ cacheExpiry: this.props.dataSource.getCacheExpiry() })

      this.updateData()
    }
  }

  updateData() {
    // Clean design first (needed to validate properly)
    const design = this.props.chart.cleanDesign(this.props.design, this.props.schema)

    // If design is not valid, do nothing as can't query invalid design
    const errors = this.props.chart.validateDesign(design, this.props.schema)
    if (errors) {
      return
    }

    this.updateSeq += 1

    // Set loading data after interval to prevent unnecessary refresh
    const dataLoadingTimeout = setTimeout(() => {
      this.setState({ dataLoading: true })
    }, 100)

    // Store updateSeq to check if latest
    const loadingUpdateSeq = this.updateSeq

    this.props.widgetDataSource.getData(design, this.props.filters || [], (error, data) => {
      // Prevent setting data loading if ready
      clearTimeout(dataLoadingTimeout)

      // Only update if latest
      if (loadingUpdateSeq == this.updateSeq) {
        this.setState({ dataLoading: false, dataError: error, data, validDesign: design })
      }
    })
  }

  renderSpinner() {
    return R(
      "div",
      { style: { position: "absolute", bottom: "50%", left: 0, right: 0, textAlign: "center", fontSize: 20 } },
      R("i", { className: "fa fa-spinner fa-spin" })
    )
  }

  renderError() {
    const errorText = (this.state.dataError.message || this.state.dataError || "") + ""

    const isTimeout = errorText.match(/timeout/) != null

    return R("div", { style: { marginTop: 20, textAlign: "center" } }, 
      R("div", { className: "text-danger" }, 
        isTimeout ?
          "This widget has timed out. Placing widgets across console tabs instead of having them all in one dashboard can improve performance."
          : "There was an error loading data for this widget."
        ),
      R("div", { className: "mt-3" },
        R("button", { 
          className: "btn btn-secondary btn-sm", 
          disabled: this.state.dataLoading,
          onClick: () => {
            this.updateData() 
          }
        }, 
          R("i", { className: "fas fa-redo" }),
          " Try again"
        ),
      ),
      R("button", { 
        className: "btn btn-link btn-sm mt-2",
        onClick: () => this.setState({ showErrorDetails: !this.state.showErrorDetails })
      },
         this.state.showErrorDetails ? "Hide details" : "Show details"
      ),
      this.state.showErrorDetails ?
        R("div", { style: { marginTop: 10, fontSize: 10 } },
          `Error: ${this.state.dataError.message || this.state.dataError}`
        ) : null
    )
  }

  render() {
    const style: CSSProperties = { width: this.props.width, height: this.props.height }

    // Faded if loading
    if (this.state.dataLoading) {
      style.opacity = 0.5
    }

    // If nothing to show, show grey
    if (!this.state.validDesign) {
      // Invalid. Show faded with background
      style.backgroundColor = "#E0E0E0"
      style.opacity = 0.35

      // Set height to 1.6 ratio if not set so the control is visible
      if (!this.props.height && this.props.width) {
        style.height = this.props.width / 1.6
      }
    }

    if (this.state.dataError) {
      return this.renderError()
    }

    return R(
      "div",
      { style },
      this.state.validDesign
        ? this.props.chart.createViewElement({
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            design: this.state.validDesign,
            onDesignChange: this.props.onDesignChange,
            data: this.state.data,
            scope: this.props.scope,
            onScopeChange: this.props.onScopeChange,
            width: this.props.width,
            height: this.props.height,
            onRowClick: this.props.onRowClick,
            filters: this.props.filters
          })
        : undefined,
      this.state.dataLoading ? this.renderSpinner() : undefined
    )
  }
}
