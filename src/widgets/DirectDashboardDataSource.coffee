WidgetFactory = require './WidgetFactory'
DirectMapUrlSource = require '../maps/DirectMapUrlSource'

# Uses direct DataSource queries
module.exports = class DirectDashboardDataSource
  constructor: (apiUrl, client, design, schema, dataSource) ->
    @apiUrl = apiUrl
    @client = client
    @design = design
    @schema = schema
    @dataSource = dataSource

  # Gets the widget data source for a specific widget
  getWidgetDataSource: (widgetId) ->
    widget = WidgetFactory.createWidget(@design.items[widgetId].widget.type)
    widgetDesign = @design.items[widgetId].widget.design
    return new LegacyWidgetDataSource(@apiUrl, @client, widget, widgetDesign, @schema, @dataSource)

class LegacyWidgetDataSource
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

