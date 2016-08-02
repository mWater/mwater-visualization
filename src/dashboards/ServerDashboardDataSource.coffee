querystring = require 'querystring'
WidgetFactory = require '../widgets/WidgetFactory'
DirectMapUrlSource = require '../maps/DirectMapUrlSource'

# Uses mWater server to get widget data to allow sharing with unprivileged users
module.exports = class ServerDashboardDataSource
  # options:
  #   apiUrl: API url to use for talking to mWater server
  #   client: client id to use for talking to mWater server
  #   share: share id to use for talking to mWater server
  #   dashboardId: dashboard id to use on server
  constructor: (options) ->
    @apiUrl = options.apiUrl
    @client = options.client
    @share = options.share
    @dashboardId = options.dashboardId

  # Gets the widget data source for a specific widget
  getWidgetDataSource: (widgetId) ->
    return new ServerWidgetDataSource(@apiUrl, @client, @share, @dashboardId, widgetId)

class ServerWidgetDataSource
  constructor: (apiUrl, client, share, dashboardId, widgetId) ->
    @apiUrl = apiUrl
    @client = client
    @share = share
    @dashboardId = dashboardId
    @widgetId = widgetId

  # Get the data that the widget needs. The widget should implement getData method (see above) to get the data from the server
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  getData: (filters, callback) ->
    query = {
      client: @client
      share: @share
      filters: JSON.stringify(filters)
    }

    url = @apiUrl + "dashboards/#{@dashboardId}/widget_data/#{@widgetId}?" + querystring.stringify(query)

    $.getJSON url, (data) =>
      callback(null, data)
    .fail (xhr) =>
      console.log xhr.responseText
      callback(new Error(xhr.responseText))

  # For map widgets, the following are required:

  # Get the url for the image tiles with the specified filters applied
  # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
  getTileUrl: (layerId, filters) ->
    return @createUrl(layerId, filters, "png")

  # Get the url for the interactivity tiles with the specified filters applied
  # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
  getUtfGridUrl: (layerId, filters) ->
    return @createUrl(layerId, filters, "grid.json")

  # Create url
  createUrl: (layerId, filters, extension) ->
    query = {
      type: "dashboard_widget"
      client: @client
      share: @share
      dashboard: @dashboardId
      widget: @widgetId
      layer: layerId
      filters: JSON.stringify(filters or [])
    }

    url = "#{@apiUrl}maps/tiles/{z}/{x}/{y}.#{extension}?" + querystring.stringify(query)

    # Add subdomains: {s} will be substituted with "a", "b" or "c" in leaflet for api.mwater.co only.
    # Used to speed queries
    if url.match(/^https:\/\/api\.mwater\.co\//)
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/")

    return url