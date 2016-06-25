_ = require 'lodash'
LayerFactory = require './LayerFactory'

module.exports = class DirectMapUrlSource
  # Create map url source that uses legacy jsonql maps
  # options:
  #   schema: schema to use
  #   mapDesign: design of entire map
  #   apiUrl: API url to use for talking to mWater server
  #   client: client id to use for talking to mWater server
  constructor: (options) ->
    @apiUrl = options.apiUrl
    @client = options.client
    @mapDesign = options.mapDesign
    @schema = options.schema

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

    # Get JsonQLCss
    jsonqlCss = layer.getJsonQLCss(design, @schema, filters)

    # HACK FOR LEGACY MWATER SERVER LAYERS
    if _.isString(jsonqlCss)
      return @createLegacyUrl(design, "png", filters)

    return @createUrl("png", jsonqlCss) 

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

    # Get JsonQLCss
    jsonqlCss = layer.getJsonQLCss(design, @schema, filters)

    # HACK FOR LEGACY MWATER SERVER LAYERS
    if _.isString(jsonqlCss)
      return @createLegacyUrl(design, "grid.json", filters)

    return @createUrl("grid.json", jsonqlCss) 

  # Create query string
  createUrl: (extension, jsonqlCss) ->
    query = "type=jsonql"
    if @client
      query += "&client=" + @client

    query += "&design=" + encodeURIComponent(JSON.stringify(jsonqlCss))

    url = "#{@apiUrl}maps/tiles/{z}/{x}/{y}.#{extension}?" + query

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
