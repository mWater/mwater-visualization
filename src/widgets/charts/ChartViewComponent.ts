import _ from "lodash"
import React, { CSSProperties } from "react"
const R = React.createElement
import asyncLatest from "async-latest"

interface ChartViewComponentProps {
  /** Chart object to use */
  chart: any
  /** Design of chart */
  design: any
  /** When design change */
  onDesignChange?: any
  schema: any
  /** Data source to use for chart */
  dataSource: any
  widgetDataSource: any
  width?: number
  height?: number
  /** scope of the widget (when the widget self-selects a particular scope) */
  scope?: any
  /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias }. Use injectAlias to correct */
  filters?: any
  /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
  onScopeChange?: any
  onRowClick?: any
}

interface ChartViewComponentState {
  cacheExpiry?: any
  dataLoading?: any
  validDesign?: any
  dataError?: any
  data?: any
}

// Inner view part of the chart widget. Uses a query data loading component
// to handle loading and continues to display old data if design becomes
// invalid
export default class ChartViewComponent extends React.Component<ChartViewComponentProps, ChartViewComponentState> {
  constructor(props: any) {
    super(props)

    this.state = {
      validDesign: null, // last valid design
      data: null, // data for chart
      dataLoading: false, // True when loading data
      dataError: null, // Set when data loading returned error
      cacheExpiry: props.dataSource.getCacheExpiry() // Save cache expiry to see if changes
    }

    // Ensure that only one load at a time
    this.loadData = asyncLatest(this.loadData, { serial: true })

    this.state = {}
  }

  componentDidMount() {
    this.updateData(this.props)
  }

  componentWillReceiveProps(nextProps: any) {
    if (
      !_.isEqual(nextProps.design, this.props.design) ||
      !_.isEqual(nextProps.filters, this.props.filters) ||
      nextProps.dataSource.getCacheExpiry() !== this.state.cacheExpiry
    ) {
      // Save new cache expiry
      this.setState({ cacheExpiry: nextProps.dataSource.getCacheExpiry() })

      this.updateData(nextProps)
    }
  }

  updateData(props: any) {
    // Clean design first (needed to validate properly)
    const design = props.chart.cleanDesign(props.design, props.schema)

    // If design is not valid, do nothing as can't query invalid design
    const errors = props.chart.validateDesign(design, props.schema)
    if (errors) {
      return
    }

    // Set loading data after interval to prevent unnecessary refresh
    const dataLoadingTimeout = setTimeout(() => {
      this.setState({ dataLoading: true })
    }, 100)

    this.loadData(props, (error: any, data: any) => {
      // Prevent setting data loading if ready
      clearTimeout(dataLoadingTimeout)
      this.setState({ dataLoading: false, dataError: error, data, validDesign: design })
    })
  }

  loadData(props: any, callback: any) {
    // Get data from widget data source
    props.widgetDataSource.getData(props.design, props.filters, callback)
  }

  renderSpinner() {
    return R(
      "div",
      { style: { position: "absolute", bottom: "50%", left: 0, right: 0, textAlign: "center", fontSize: 20 } },
      R("i", { className: "fa fa-spinner fa-spin" })
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
      return R(
        "div",
        { className: "alert alert-danger" },
        `Error loading data: ${this.state.dataError.message || this.state.dataError}`
      )
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
