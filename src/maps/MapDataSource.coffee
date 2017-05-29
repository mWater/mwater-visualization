# Map data source gives data sources for layers
module.exports = class MapDataSource
  # Gets the data source for a layer
  getLayerDataSource: (layerId) ->
    throw new Error("Not implemented")

  # Gets the bounds for the map. Null for no opinion. Callback as { n:, s:, w:, e: }
  getBounds: (design, filters, callback) ->
    callback(null)

  # Gets the URL to call to print the map. 
  # scale is 2 (normal) or 3 (high-resolution)
  getPrintUrl: (design, scale) ->
    throw new Error("Not implemented")
