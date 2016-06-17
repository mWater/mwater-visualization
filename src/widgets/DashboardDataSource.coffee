

# Data source for a dashboard that allows client-server model that supports sharing of dashboards
module.exports = class DashboardDataSource
  # Gets the widget data source for a specific widget
  getWidgetDataSource: (widgetId) ->
    throw new Error("Not implemented")
