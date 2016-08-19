# Map data source gives data sources for layers
module.exports = class MapDataSource
  # Gets the data source for a layer
  getLayerDataSource: (layerId) ->
    throw new Error("Not implemented")
