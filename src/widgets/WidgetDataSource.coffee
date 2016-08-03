# Interface for a widget data source that gives the widget access to the data it needs, even if that data is not directly available from the data source
# For example, Alice might share a widget with Bob. Bob can't access the data directly that Alice sees (since it's private), but he can use the widget 
# data source to get it, as the server will return the exact data he needs for the widget, since the server has a copy of the design of the widget.
module.exports = class WidgetDataSource
  # Get the data that the widget needs. The widget should implement getData method (see above) to get the actual data on the server
  #  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  #  callback: (error, data)
  getData: (filters, callback) ->
    throw new Error("Not implemented")

  # For map widgets, the following are required:

  # Get the url for the image tiles with the specified filters applied
  # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
  getTileUrl: (layerId, filters) ->
    throw new Error("Not implemented")

  # Get the url for the interactivity tiles with the specified filters applied
  # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
  getUtfGridUrl: (layerId, filters) ->
    throw new Error("Not implemented")
