// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let DirectDashboardDataSource
import WidgetFactory from "../widgets/WidgetFactory"
import DirectWidgetDataSource from "../widgets/DirectWidgetDataSource"
import LayoutManager from "../layouts/LayoutManager"
import * as QuickfilterUtils from "../quickfilter/QuickfilterUtils"

// Uses direct DataSource queries
export default DirectDashboardDataSource = class DirectDashboardDataSource {
  // Create dashboard data source that uses direct jsonql calls
  // options:
  //   schema: schema to use
  //   dataSource: data source to use
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  constructor(options: any) {
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
