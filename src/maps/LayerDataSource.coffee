# Data source for a layer of a map. Gives urls, popup data 
module.exports = class LayerDataSource
  # Get the url for the image tiles with the specified filters applied
  # Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
  # Only called on layers that are valid
  getTileUrl: (design, filters) -> null

  # Get the url for the interactivity tiles with the specified filters applied
  # Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
  # Only called on layers that are valid
  getUtfGridUrl: (design, filters) -> null

  # Gets widget data source for a popup widget
  getPopupWidgetDataSource: (design, widgetId) -> null