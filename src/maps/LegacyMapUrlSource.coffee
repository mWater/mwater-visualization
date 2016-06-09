module.exports = class LegacyMapUrlSource
  # Create map url source that uses legacy jsonql maps
  # options:
  #   schema: schema to use
  #   mapDesign: design of entire map
  #   apiUrl: API url to use for talking to mWater server
  #   client: client id to use for talking to mWater server
  #   layerFactory: layer factory to use
  constructor: (options) ->
    @apiUrl = options.apiUrl
    @client = options.client
    @mapDesign = options.mapDesign
    @schema = options.schema
    @layerFactory = options.layerFactory

  # Get the url for the image tiles with the specified filters applied
  # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
  getTileUrl: (layerId, filters) ->
    # Get layerView
    layerView = _.findWhere(@mapDesign.layerViews, { id: layerId })
    if not layerView
      return null

    # Create layer
    layer = @layerFactory.createLayer(layerView.type, layerView.design)

    # Get JsonQLCss
    jsonqlCss = layer.getJsonQLCss(layerView.design, @schema, filters)

    return @createUrl("png", jsonqlCss, filters) 

  # Get the url for the interactivity tiles with the specified filters applied
  # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
  getUtfGridUrl: (layerId, filters) ->
    # Get layerView
    layerView = _.findWhere(@mapDesign.layerViews, { id: layerId })
    if not layerView
      return null

    # Create layer
    layerFactory = new LayerFactory()
    layer = layerFactory.createLayer(layerView.type, layerView.design)

    # Get JsonQLCss
    jsonqlCss = layer.getJsonQLCss(layerView.design, @schema, filters)

    return @createUrl("png", jsonqlCss, filters) 

  # Create query string
  createUrl: (extension, jsonqlCss, filters) ->
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

