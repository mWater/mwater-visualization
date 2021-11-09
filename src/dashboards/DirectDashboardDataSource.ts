import WidgetFactory from "../widgets/WidgetFactory"
import DirectWidgetDataSource from "../widgets/DirectWidgetDataSource"
import LayoutManager from "../layouts/LayoutManager"
import * as QuickfilterUtils from "../quickfilter/QuickfilterUtils"
import DashboardDataSource from "./DashboardDataSource"
import { Schema, DataSource } from "mwater-expressions"

/** Uses direct DataSource queries */
export default class DirectDashboardDataSource extends DashboardDataSource {
  options: {
    /** schema to use */
    schema: Schema

    /** data source to use */
    dataSource: DataSource

    /** API url to use for talking to mWater server */
    apiUrl: string

    /** client id to use for talking to mWater server */
    client?: string | undefined
  }
  /** Create dashboard data source that uses direct jsonql calls */
  constructor(options: {
    /** schema to use */
    schema: Schema

    /** data source to use */
    dataSource: DataSource

    /** API url to use for talking to mWater server */
    apiUrl: string

    /** client id to use for talking to mWater server */
    client?: string
  }) {
    super()
    this.options = options
  }

  // Gets the widget data source for a specific widget
  getWidgetDataSource(widgetType: any, widgetId: any) {
    const widget = WidgetFactory.createWidget(widgetType)
    return new DirectWidgetDataSource({
      apiUrl: this.options.apiUrl,
      client: this.options.client,
      widget,
      schema: this.options.schema,
      dataSource: this.options.dataSource
    })
  }

  // Gets the quickfilters data source
  getQuickfiltersDataSource() {
    return {
      getValues: (index: any, expr: any, filters: any, offset: any, limit: any, callback: any) => {
        // Perform query
        return QuickfilterUtils.findExprValues(
          expr,
          this.options.schema,
          this.options.dataSource,
          filters,
          offset,
          limit,
          callback
        )
      }
    }
  }
}
