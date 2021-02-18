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
  #   apiUrl: API url to use for talking to mWater server
  #   client: client id to use for talking to mWater server
  constructor: (options) ->
    @options = options

  # Gets the widget data source for a specific widget
  getWidgetDataSource: (widgetType, widgetId) ->
    widget = WidgetFactory.createWidget(widgetType)
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
