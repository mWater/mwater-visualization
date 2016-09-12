_ = require 'lodash'
async = require 'async'
LayerFactory = require './LayerFactory'
injectTableAlias = require('mwater-expressions').injectTableAlias
MapDataSource = require './MapDataSource'
DirectWidgetDataSource = require '../widgets/DirectWidgetDataSource'
BlocksLayoutManager = require '../layouts/blocks/BlocksLayoutManager'
WidgetFactory = require '../widgets/WidgetFactory'

module.exports = class DirectMapDataSource extends MapDataSource
  # Create map url source that uses direct jsonql maps
  # options:
  #   schema: schema to use
  #   dataSource: general data source
  #   design: design of entire map
  #   apiUrl: API url to use for talking to mWater server
  #   client: client id to use for talking to mWater server
  constructor: (options) ->
    @options = options

  # Gets the data source for a layer
  getLayerDataSource: (layerId) ->
    # Get layerView
    layerView = _.findWhere(@options.design.layerViews, { id: layerId })
    if not layerView
      return null

    new DirectLayerDataSource(_.extend({}, @options, layerView: layerView))

  # Gets the bounds for the map. Null for whole world. Callback as { n:, s:, w:, e: }
  getBounds: (design, filters, callback) ->
    allBounds = []

    # For each layer
    async.each design.layerViews, (layerView, cb) =>
      if not layerView.visible
        return cb(null)
        
      # Create layer
      layer = LayerFactory.createLayer(layerView.type)
      
      # Get bounds, including filters from map  
      layer.getBounds(layerView.design, @options.schema, @options.dataSource, _.union(filters, design.filters), (error, bounds) =>
        if error
          return cb(error)

        if bounds
          allBounds.push(bounds)
        cb(null)
        )
    , (error) =>
      if error
        return callback(error)

      # Union bounds
      if allBounds.length == 0
        return callback(null)

      callback(null, {
        n: _.max(allBounds, "n").n
        e: _.max(allBounds, "e").e
        s: _.min(allBounds, "s").s
        w: _.min(allBounds, "w").w
        })


class DirectLayerDataSource
  # Create map url source that uses direct jsonql maps
  # options:
  #   schema: schema to use
  #   dataSource: general data source
  #   layerView: layerView to display
  #   apiUrl: API url to use for talking to mWater server
  #   client: client id to use for talking to mWater server
  constructor: (options) ->
    @options = options

  # Get the url for the image tiles with the specified filters applied
  # Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
  getTileUrl: (design, filters) -> 
    # Create layer
    layer = LayerFactory.createLayer(@options.layerView.type)

    # Handle special cases
    if @options.layerView.type == "MWaterServer"
      return @createLegacyUrl(design, "png", filters)
    if @options.layerView.type == "TileUrl"
      return design.tileUrl

    # Get JsonQLCss
    jsonqlCss = layer.getJsonQLCss(design, @options.schema, filters)

    return @createUrl("png", jsonqlCss) 

  # Get the url for the interactivity tiles with the specified filters applied
  # Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
  getUtfGridUrl: (design, filters) -> 
    # Create layer
    layer = LayerFactory.createLayer(@options.layerView.type)

    # Handle special cases
    if @options.layerView.type == "MWaterServer"
      return @createLegacyUrl(design, "grid.json", filters)
    if @options.layerView.type == "TileUrl"
      return null

    # Get JsonQLCss
    jsonqlCss = layer.getJsonQLCss(design, @options.schema, filters)

    return @createUrl("grid.json", jsonqlCss) 

  # Gets widget data source for a popup widget
  getPopupWidgetDataSource: (design, widgetId) -> 
    # Create layer
    layer = LayerFactory.createLayer(@options.layerView.type)

    # Get widget
    { type, design } = new BlocksLayoutManager().getWidgetTypeAndDesign(design.popup.items, widgetId)

    # Create widget
    widget = WidgetFactory.createWidget(type)

    return new DirectWidgetDataSource({
      widget: widget
      schema: @options.schema
      dataSource: @options.dataSource
      apiUrl: @options.apiUrl
      client: @options.client
    })

  # Create query string
  createUrl: (extension, jsonqlCss) ->
    query = "type=jsonql"
    if @options.client
      query += "&client=" + @options.client

    query += "&design=" + encodeURIComponent(JSON.stringify(jsonqlCss))

    url = "#{@options.apiUrl}maps/tiles/{z}/{x}/{y}.#{extension}?" + query

    # Add subdomains: {s} will be substituted with "a", "b" or "c" in leaflet for api.mwater.co only.
    # Used to speed queries
    if url.match(/^https:\/\/api\.mwater\.co\//)
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/")

    return url

  # Create query string
  createLegacyUrl: (design, extension, filters) ->
    url = "#{@options.apiUrl}maps/tiles/{z}/{x}/{y}.#{extension}?type=#{design.type}&radius=1000"

    # Add subdomains: {s} will be substituted with "a", "b" or "c" in leaflet for api.mwater.co only.
    # Used to speed queries
    if url.match(/^https:\/\/api\.mwater\.co\//)
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/")

    if @client
      url += "&client=#{@options.client}"
      
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
