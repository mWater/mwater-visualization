querystring = require 'querystring'
WidgetFactory = require '../widgets/WidgetFactory'
DirectMapDataSource = require '../maps/DirectMapDataSource'

# Uses mWater server to get widget data to allow sharing with unprivileged users
module.exports = class ServerDashboardDataSource
  # options:
  #   apiUrl: API url to use for talking to mWater server
  #   client: client id to use for talking to mWater server
  #   share: share id to use for talking to mWater server
  #   dashboardId: dashboard id to use on server
  constructor: (options) ->
    @options = options

  # Gets the widget data source for a specific widget
  getWidgetDataSource: (widgetId) ->
    return new ServerWidgetDataSource(_.extend({}, @options, widgetId: widgetId))

class ServerWidgetDataSource
  # options:
  #   apiUrl: API url to use for talking to mWater server
  #   client: client id to use for talking to mWater server
  #   share: share id to use for talking to mWater server
  #   dashboardId: dashboard id to use on server
  #   widgetId: widget id to use
  constructor: (options) ->
    @options = options

  # Get the data that the widget needs. The widget should implement getData method (see above) to get the data from the server
  #  design: design of the widget. Ignored in the case of server-side rendering
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  getData: (design, filters, callback) ->
    query = {
      client: @options.client
      share: @options.share
      filters: JSON.stringify(filters)
    }

    url = @options.apiUrl + "dashboards/#{@options.dashboardId}/widgets/#{@options.widgetId}/data?" + querystring.stringify(query)

    $.getJSON url, (data) =>
      callback(null, data)
    .fail (xhr) =>
      console.log xhr.responseText
      callback(new Error(xhr.responseText))

  # For map widgets, the following is required
  getMapDataSource: (design) ->
    return new ServerWidgetMapDataSource(@options)

  # Get the url to download an image (by id from an image or imagelist column)
  # Height, if specified, is minimum height needed. May return larger image
  getImageUrl: (imageId, height) ->
    url = @options.apiUrl + "images/#{imageId}"
    if height
      url += "?h=#{height}"

    return url

class ServerWidgetMapDataSource 
  # options:
  #   apiUrl: API url to use for talking to mWater server
  #   client: client id to use for talking to mWater server
  #   share: share id to use for talking to mWater server
  #   dashboardId: dashboard id to use on server
  #   widgetId: widget id to use
  constructor: (options) ->
    @options = options

  # Gets the data source for a layer
  getLayerDataSource: (layerId) ->
    return new ServerWidgetLayerDataSource(_.extend({}, @options, layerId: layerId))

class ServerWidgetLayerDataSource
  # options:
  #   apiUrl: API url to use for talking to mWater server
  #   client: client id to use for talking to mWater server
  #   share: share id to use for talking to mWater server
  #   dashboardId: dashboard id to use on server
  #   widgetId: widget id to use
  #   layerId: layer of map inside widget
  constructor: (options) ->
    @options = options

  # Get the url for the image tiles with the specified filters applied
  # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
  getTileUrl: (filters) -> 
    return @createUrl(filters, "png")

  # Get the url for the interactivity tiles with the specified filters applied
  # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
  getUtfGridUrl: (filters) ->
    return @createUrl(filters, "grid.json")

  # Gets widget data source for a popup widget
  getPopupWidgetDataSource: (widgetId) -> 
    return new ServerWidgetLayerPopupWidgetDataSource(_.extend({}, @options, popupWidgetId: widgetId))

  # Create url
  createUrl: (filters, extension) ->
    query = {
      type: "dashboard_widget"
      client: @options.client
      share: @options.share
      dashboard: @options.dashboardId
      widget: @options.widgetId
      layer: @options.layerId
      filters: JSON.stringify(filters or [])
    }

    url = "#{@options.apiUrl}maps/tiles/{z}/{x}/{y}.#{extension}?" + querystring.stringify(query)

    # Add subdomains: {s} will be substituted with "a", "b" or "c" in leaflet for api.mwater.co only.
    # Used to speed queries
    if url.match(/^https:\/\/api\.mwater\.co\//)
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/")

    return url

class ServerWidgetLayerPopupWidgetDataSource
  # options:
  #   apiUrl: API url to use for talking to mWater server
  #   client: client id to use for talking to mWater server
  #   share: share id to use for talking to mWater server
  #   dashboardId: dashboard id to use on server
  #   widgetId: widget id to use
  #   layerId: layer of map inside widget
  #   popupWidgetId: id of popup widget
  constructor: (options) ->
    @options = options

  # Get the data that the widget needs. The widget should implement getData method (see above) to get the actual data on the server
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  #  callback: (error, data)
  getData: (filters, callback) ->
    query = {
      client: @options.client
      share: @options.share
      filters: JSON.stringify(filters)
    }

    url = @options.apiUrl + "dashboards/#{@options.dashboardId}/widgets/#{@options.widgetId}/layers/#{@options.layerId}/widgets/#{@options.popupWidgetId}/data?" + querystring.stringify(query)

    $.getJSON url, (data) =>
      callback(null, data)
    .fail (xhr) =>
      console.log xhr.responseText
      callback(new Error(xhr.responseText))

  # Get the url to download an image (by id from an image or imagelist column)
  # Height, if specified, is minimum height needed. May return larger image
  getImageUrl: (imageId, height) ->
    url = @options.apiUrl + "images/#{imageId}"
    if height
      url += "?h=#{height}"

    return url
  