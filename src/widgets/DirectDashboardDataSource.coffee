WidgetFactory = require './WidgetFactory'
DirectMapUrlSource = require '../maps/DirectMapUrlSource'

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
    return new DirectWidgetDataSource(@apiUrl, @client, widget, widgetDesign, @schema, @dataSource)

class DirectWidgetDataSource
  constructor: (apiUrl, client, widget, design, schema, dataSource) ->
    @apiUrl = apiUrl
    @widget = widget
    @design = design
    @schema = schema
    @dataSource = dataSource

  # Get the data that the widget needs. The widget should implement getData method (see above) to get the actual data on the server
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  getData: (filters, callback) ->
    @widget.getData(@design, @schema, @dataSource, filters, callback)

  # For map widgets, the following are required:

  # Get the url for the image tiles with the specified filters applied
  # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
  getTileUrl: (layerId, filters) ->
    new DirectMapUrlSource({ apiUrl: @apiUrl, client: @client, mapDesign: @design, schema: @schema }).getTileUrl(layerId, filters)

  # Get the url for the interactivity tiles with the specified filters applied
  # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
  getUtfGridUrl: (layerId, filters) ->
    new DirectMapUrlSource({ apiUrl: @apiUrl, client: @client, mapDesign: @design, schema: @schema }).getUtfGridUrl(layerId, filters)

