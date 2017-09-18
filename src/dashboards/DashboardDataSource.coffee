

# Data source for a dashboard that allows client-server model that supports sharing of dashboards
module.exports = class DashboardDataSource
  # Gets the widget data source for a specific widget
  getWidgetDataSource: (widgetId) ->
    throw new Error("Not implemented")

  # Gets the quickfilters data source
  getQuickfiltersDataSource: ->
    throw new Error("Not implemented")

  # Clears any cached data
  clearCache: -> return

  # Returns a different timestamp when cache is cleared, meaning that widgets should reload
  getCacheExpiry: -> return 0
