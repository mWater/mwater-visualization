DirectMapDataSource = require '../maps/DirectMapDataSource'

# Get widget data directly from the dataSource
module.exports = class DirectWidgetDataSource
  constructor: (options) ->
    @apiUrl = options.apiUrl
    @widget = options.widget
    @design = options.design
    @schema = options.schema
    @dataSource = options.dataSource
    @client = options.client

  # Get the data that the widget needs. The widget should implement getData method (see above) to get the actual data on the server
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  getData: (filters, callback) ->
    @widget.getData(@design, @schema, @dataSource, filters, callback)

  # For map widgets, the following are required:

  # Get the url for the image tiles with the specified filters applied
  # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
  getTileUrl: (layerId, filters) ->
    new DirectMapDataSource({ apiUrl: @apiUrl, client: @client, mapDesign: @design, schema: @schema }).getTileUrl(layerId, filters)

  # Get the url for the interactivity tiles with the specified filters applied
  # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
  getUtfGridUrl: (layerId, filters) ->
    new DirectMapDataSource({ apiUrl: @apiUrl, client: @client, mapDesign: @design, schema: @schema }).getUtfGridUrl(layerId, filters)

