# Data source for a layer of a map. Gives urls, popup data 
module.exports = class LayerDataSource
  # Get the url for the image tiles with the specified filters applied
  # Called with (filters) where filters are filters to apply. Returns URL
  # Only called on layers that are valid
  getTileUrl: (filters) -> null

  # Get the url for the interactivity tiles with the specified filters applied
  # Called with (filters) where filters are filters to apply. Returns URL
  # Only called on layers that are valid
  getUtfGridUrl: (filters) -> null

  # Gets widget data source for a popup widget
  getPopupWidgetDataSource: (widgetId) -> null