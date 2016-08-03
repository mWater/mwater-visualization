_ = require 'lodash'
querystring = require 'querystring'
MapDataSource = require './MapDataSource'

# Get map urls for map stored on server
module.exports = class ServerMapDataSource extends MapDataSource
  # Create map url source that uses map design stored on server
  # options:
  #   apiUrl: API url to use for talking to mWater server
  #   client: client id to use for talking to mWater server
  #   share: share id to use for talking to mWater server
  #   mapId: map id to use on server
  constructor: (options) ->
    @apiUrl = options.apiUrl
    @client = options.client
    @share = options.share
    @mapId = options.mapId

  # Get the url for the image tiles with the specified filters applied
  # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
  getTileUrl: (layerId, filters) ->
    return @createUrl(layerId, filters, "png") 

  # Get the url for the interactivity tiles with the specified filters applied
  # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
  getUtfGridUrl: (layerId, filters) ->
    return @createUrl(layerId, filters, "grid.json") 

  createUrl: (layerId, filters, extension) ->
    query = {
      type: "maps"
      client: @client
      share: @share
      map: @mapId
      layer: layerId
      filters: JSON.stringify(filters or [])
    }

    url = "#{@apiUrl}maps/tiles/{z}/{x}/{y}.#{extension}?" + querystring.stringify(query)

    # Add subdomains: {s} will be substituted with "a", "b" or "c" in leaflet for api.mwater.co only.
    # Used to speed queries
    if url.match(/^https:\/\/api\.mwater\.co\//)
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/")

    return url
