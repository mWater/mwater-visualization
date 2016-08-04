React = require 'react'
H = React.DOM
R = React.createElement
LeafletMapComponent = require './LeafletMapComponent'
ExprUtils = require('mwater-expressions').ExprUtils
ExprCompiler = require('mwater-expressions').ExprCompiler
LayerFactory = require './LayerFactory'
ModalPopupComponent = require('react-library/lib/ModalPopupComponent')

# Component that displays just the map
module.exports = class MapViewComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired # data source to use

    # Url source for the map
    mapDataSource: React.PropTypes.shape({
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

    onRowClick: React.PropTypes.func     # Called with (tableId, rowId) when item is clicked

    extraFilters: React.PropTypes.arrayOf(React.PropTypes.shape({
      table: React.PropTypes.string.isRequired
      jsonql: React.PropTypes.object.isRequired
    })) # Extra filters to apply to view

    dragging:  React.PropTypes.bool         # Whether the map be draggable with mouse/touch or not. Default true
    touchZoom: React.PropTypes.bool         # Whether the map can be zoomed by touch-dragging with two fingers. Default true
    scrollWheelZoom: React.PropTypes.bool   # Whether the map can be zoomed by using the mouse wheel. Default true

  constructor: (props) ->
    super

    @state = {
      popupContents: null   # Element in the popup
    }

  handleBoundsChange: (bounds) =>
    # Ignore if readonly
    if not @props.onDesignChange?
      return

    design = _.extend({}, @props.design, bounds: bounds)
    @props.onDesignChange(design)

  handleGridClick: (layerViewId, ev) =>
    layerView = _.findWhere(@props.design.layerViews, id: layerViewId)

    # Create layer
    layer = LayerFactory.createLayer(layerView.type)

    # Clean design (prevent ever displaying invalid/legacy designs)
    design = layer.cleanDesign(layerView.design, @props.schema)

    # Handle click of layerS
    results = layer.onGridClick(ev, { design: design, schema: @props.schema, dataSource: @props.dataSource })

    # Handle standard case
    if _.isArray(results)
      @props.onRowClick?(results[0], results[1])
    else if results
      # Handle popup
      @setState(popupContents: results)

  renderLegend:  ->
    legendItems = _.compact(
      _.map(@props.design.layerViews, (layerView) => 
        # Create layer
        layer = LayerFactory.createLayer(layerView.type)

        design = layer.cleanDesign(layerView.design, @props.schema)
        # Ignore if invalid
        if layer.validateDesign(design, @props.schema)
          return null

        if layerView.visible
          return { key: layerView.id, legend: layer.getLegend(design, @props.schema, layerView.name) }
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
#          if i > 0 then H.br()
          item.legend

  renderPopup: ->
    if not @state.popupContents
      return null

    return R ModalPopupComponent, 
      onClose: => @setState(popupContents: null)
      size: "large",
        @state.popupContents
        H.div style: { textAlign: "right", marginTop: 10 },
          H.button className: "btn btn-default", onClick: (=> @setState(popupContents: null)),
            "Close"

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
        tileUrl: @props.mapDataSource.getTileUrl(layerView.id, compiledFilters)
        utfGridUrl: @props.mapDataSource.getUtfGridUrl(layerView.id, compiledFilters)
        visible: layerView.visible
        opacity: layerView.opacity
        minZoom: layer.getMinZoom(design)
        maxZoom: layer.getMaxZoom(design)
        onGridClick: @handleGridClick.bind(null, layerView.id)
      }

      leafletLayers.push(leafletLayer)

    H.div style: { width: @props.width, height: @props.height },
      @renderPopup()
      R LeafletMapComponent,
        initialBounds: @props.design.bounds
        baseLayerId: @props.design.baseLayer
        layers: leafletLayers
        width: @props.width
        height: @props.height
        legend: @renderLegend()
        dragging: @props.dragging
        touchZoom: @props.touchZoom
        scrollWheelZoom: @props.scrollWheelZoom
        onBoundsChange: @handleBoundsChange
