WidgetFactory = require '../widgets/WidgetFactory'
DirectWidgetDataSource = require '../widgets/DirectWidgetDataSource'
LayoutManager = require '../layouts/LayoutManager'
QuickfilterUtils = require '../quickfilter/QuickfilterUtils'

# Uses direct DataSource queries
module.exports = class DirectDashboardDataSource
  # Create dashboard data source that uses direct jsonql calls
  # options:
  #   schema: schema to use
  #   dataSource: data source to use
  #   design: design of entire dashboard
  #   apiUrl: API url to use for talking to mWater server
  #   client: client id to use for talking to mWater server
  constructor: (options) ->
    @options = options

  # Gets the widget data source for a specific widget
  getWidgetDataSource: (widgetId) ->
    # Get widget type and design from layout manager
    { type, design } = LayoutManager.createLayoutManager(@options.design.layout).getWidgetTypeAndDesign(@options.design.items, widgetId)

    widget = WidgetFactory.createWidget(type)
    return new DirectWidgetDataSource({
      apiUrl: @options.apiUrl
      client: @options.client
      widget: widget
      schema: @options.schema
      dataSource: @options.dataSource
    })

  # Gets the quickfilters data source
  getQuickfiltersDataSource: ->
    return {
      getValues: (index, expr, filters, offset, limit, callback) =>
        # Perform query
        QuickfilterUtils.findExprValues(expr, @options.schema, @options.dataSource, filters, offset, limit, callback)
    }

  # Clears any cached data
  clearCache: -> 
    @options.dataSource.clearCache()

  # Returns a different timestamp when cache is cleared, meaning that widgets should reload
  getCacheExpiry: -> @options.dataSource.getCacheExpiry?()
