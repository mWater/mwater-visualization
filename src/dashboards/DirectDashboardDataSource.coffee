WidgetFactory = require '../widgets/WidgetFactory'
DirectWidgetDataSource = require '../widgets/DirectWidgetDataSource'
LayoutManager = require '../layouts/LayoutManager'

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
    @schema = options.schema
    @dataSource = options.dataSource
    @design = options.design
    @apiUrl = options.apiUrl
    @client = options.client

  # Gets the widget data source for a specific widget
  getWidgetDataSource: (widgetId) ->
    # Get widget type and design from layout manager
    { type, design } = LayoutManager.createLayoutManager(@design.layout).getWidgetTypeAndDesign(@design.items, widgetId)

    widget = WidgetFactory.createWidget(type)
    return new DirectWidgetDataSource({
      apiUrl: @apiUrl
      client: @client
      widget: widget
      design: design
      schema: @schema
      dataSource: @dataSource
    })

