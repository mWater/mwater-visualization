WidgetFactory = require '../widgets/WidgetFactory'
DirectWidgetDataSource = require '../widgets/DirectWidgetDataSource'

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
    widget = WidgetFactory.createWidget(@design.items[widgetId].widget.type)
    widgetDesign = @design.items[widgetId].widget.design
    return new DirectWidgetDataSource({
      apiUrl: @apiUrl
      client: @client
      widget: widget
      design: widgetDesign
      schema: @schema
      dataSource: @dataSource
    })

