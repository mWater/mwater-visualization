_ = require 'lodash'
LayerFactory = require './LayerFactory'
injectTableAlias = require('mwater-expressions').injectTableAlias

# Map data source gives urls, popup data for maps
module.exports = class MapDataSource
  # Get the url for the image tiles with the specified filters applied
  # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
  getTileUrl: (layerId, filters) -> null

  # Get the url for the interactivity tiles with the specified filters applied
  # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
  getUtfGridUrl: (layerId, filters) -> null
