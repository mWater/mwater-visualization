_ = require 'lodash'
querystring = require 'querystring'
MapDataSource = require './MapDataSource'
LayerFactory = require './LayerFactory'
injectTableAlias = require('mwater-expressions').injectTableAlias

# Get map urls for map stored on server
module.exports = class ServerMapDataSource extends MapDataSource
  # Create map url source that uses map design stored on server
  # options:
  #   apiUrl: API url to use for talking to mWater server
  #   client: client id to use for talking to mWater server
  #   mapDesign: design of entire map
  #   schema: schema to use
  #   share: share id to use for talking to mWater server
  #   mapId: map id to use on server
  constructor: (options) ->
    @apiUrl = options.apiUrl
    @client = options.client
    @mapDesign = options.mapDesign
    @schema = options.schema
    @share = options.share
    @mapId = options.mapId

  # Get the url for the image tiles with the specified filters applied
  # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
  getTileUrl: (layerId, filters) ->
    # Get layerView
    layerView = _.findWhere(@mapDesign.layerViews, { id: layerId })
    if not layerView
      return null

    # Create layer
    layer = LayerFactory.createLayer(layerView.type)

    # Clean design (prevent ever displaying invalid/legacy designs)
    design = layer.cleanDesign(layerView.design, @schema)

    # Ignore if invalid
    if layer.validateDesign(design, @schema)
      return null

    # Handle special cases
    if layerView.type == "MWaterServer"
      return @createLegacyUrl(design, "png", filters)
    if layerView.type == "TileUrl"
      return design.tileUrl

    return @createUrl(layerId, filters, "png") 

  # Get the url for the interactivity tiles with the specified filters applied
  # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
  getUtfGridUrl: (layerId, filters) ->
    # Get layerView
    layerView = _.findWhere(@mapDesign.layerViews, { id: layerId })
    if not layerView
      return null

    # Create layer
    layer = LayerFactory.createLayer(layerView.type)

    # Clean design (prevent ever displaying invalid/legacy designs)
    design = layer.cleanDesign(layerView.design, @schema)

    # Ignore if invalid
    if layer.validateDesign(design, @schema)
      return null

    # Handle special cases
    if layerView.type == "MWaterServer"
      return @createLegacyUrl(design, "grid.json", filters)
    if layerView.type == "TileUrl"
      return null

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

  # Create query string
  createLegacyUrl: (design, extension, filters) ->
    url = "#{@apiUrl}maps/tiles/{z}/{x}/{y}.#{extension}?type=#{design.type}&radius=1000"

    # Add subdomains: {s} will be substituted with "a", "b" or "c" in leaflet for api.mwater.co only.
    # Used to speed queries
    if url.match(/^https:\/\/api\.mwater\.co\//)
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/")

    if @client
      url += "&client=#{@client}"

    if @share
      url += "&share=#{@share}"
      
    # Add where for any relevant filters
    relevantFilters = _.where(filters, table: design.table)

    # If any, create and
    whereClauses = _.map(relevantFilters, (f) => injectTableAlias(f.jsonql, "main"))

    # Wrap if multiple
    if whereClauses.length > 1
      where = { type: "op", op: "and", exprs: whereClauses }
    else
      where = whereClauses[0]

    if where 
      url += "&where=" + encodeURIComponent(JSON.stringify(where))

    return url
