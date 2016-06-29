React = require 'react'
H = React.DOM
LeafletMapComponent = require './LeafletMapComponent'
ExprUtils = require('mwater-expressions').ExprUtils
ExprCompiler = require('mwater-expressions').ExprCompiler
LayerFactory = require './LayerFactory'

# Component that displays just the map
module.exports = class MapViewComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use

    # Url source for the map
    mapUrlSource: React.PropTypes.shape({
        # Get the url for the image tiles with the specified filters applied
        # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
        getTileUrl: React.PropTypes.func.isRequired

        # Get the url for the interactivity tiles with the specified filters applied
        # Called with (layerId, filters) where layerId is the layer id and filters are filters to apply. Returns URL
        getUtfGridUrl: React.PropTypes.func.isRequired
      }).isRequired
    
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func   # Called with new design. null/undefined to ignore bounds changes

    width: React.PropTypes.number        # Width in pixels
    height: React.PropTypes.number       # Height in pixels

    extraFilters: React.PropTypes.arrayOf(React.PropTypes.shape({
      table: React.PropTypes.string.isRequired
      jsonql: React.PropTypes.object.isRequired
      })) # Extra filters to apply to view

    dragging:  React.PropTypes.bool         # Whether the map be draggable with mouse/touch or not. Default true
    touchZoom: React.PropTypes.bool         # Whether the map can be zoomed by touch-dragging with two fingers. Default true
    scrollWheelZoom: React.PropTypes.bool   # Whether the map can be zoomed by using the mouse wheel. Default true

  handleBoundsChange: (bounds) =>
    # Ignore if readonly
    if not @props.onDesignChange?
      return

    design = _.extend({}, @props.design, bounds: bounds)
    @props.onDesignChange(design)

  handleGridClick: (layer, design, ev) =>
    # TODO

  renderLegend:  ->
    legendItems = _.compact(
      _.map(@props.design.layerViews, (layerView) => 
        # Create layer
        layer = LayerFactory.createLayer(layerView.type)

        # Ignore if invalid
        if layer.validateDesign(layerView.design, @props.schema)
          return null

        if layerView.visible
          return { key: layerView.id, legend: layer.getLegend(layerView.design, @props.schema) }
      )
    )

    if legendItems.length == 0
      return

    style = {
      padding: 7
      background: "rgba(255,255,255,0.8)"
      boxShadow: "0 0 15px rgba(0,0,0,0.2)"
      borderRadius: 5
    }

    H.div style: style,
      _.map legendItems, (item, i) =>
        H.div key: item.key,
          if i > 0 then H.br()
          item.legend

  render: ->
    exprUtils = new ExprUtils(@props.schema)

    # Use only valid ones
    filters = _.values(@props.design.filters)

    # Compile filters to JsonQL expected by layers
    exprCompiler = new ExprCompiler(@props.schema)
    compiledFilters = _.map filters, (expr) =>
      table = exprUtils.getExprTable(expr)
      jsonql = exprCompiler.compileExpr(expr: expr, tableAlias: "{alias}")
      return { table: table, jsonql: jsonql }

    # Add extra filters
    if @props.extraFilters
      compiledFilters = compiledFilters.concat(@props.extraFilters)

    # Convert to leaflet layers, if layers are valid
    leafletLayers = []
    for layerView, index in @props.design.layerViews
      # Create layer
      layer = LayerFactory.createLayer(layerView.type)

      # Clean design (prevent ever displaying invalid/legacy designs)
      design = layer.cleanDesign(layerView.design, @props.schema)

      # Ignore if invalid
      if layer.validateDesign(design, @props.schema)
        continue

      # Create leafletLayer
      leafletLayer = {
        tileUrl: @props.mapUrlSource.getTileUrl(layerView.id, compiledFilters)
        utfGridUrl: @props.mapUrlSource.getUtfGridUrl(layerView.id, compiledFilters)
        visible: layerView.visible
        opacity: layerView.opacity
        minZoom: layer.getMinZoom(design)
        maxZoom: layer.getMaxZoom(design)
        onGridClick: @handleGridClick.bind(null, layer, design)
      }

      leafletLayers.push(leafletLayer)

    React.createElement(LeafletMapComponent,
      initialBounds: @props.design.bounds
      baseLayerId: @props.design.baseLayer
      layers: leafletLayers
      width: @props.width
      height: @props.height
      legend: @renderLegend()
      dragging: @props.dragging
      touchZoom: @props.touchZoom
      scrollWheelZoom: @props.scrollWheelZoom
      onBoundsChange: @handleBoundsChange)
