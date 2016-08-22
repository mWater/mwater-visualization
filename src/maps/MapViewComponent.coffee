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
      # Gets the data source for a layer
      getLayerDataSource: React.PropTypes.func.isRequired
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

    # scope of the map (when a layer self-selects a particular scope)
    scope: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired
      filter: React.PropTypes.shape({ table: React.PropTypes.string.isRequired, jsonql: React.PropTypes.object.isRequired })
      data: React.PropTypes.shape({ layerViewId: React.PropTypes.string.isRequired, data: React.PropTypes.any }).isRequired  
      })
    onScopeChange: React.PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

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

    # Handle click of layer
    results = layer.onGridClick(ev, { 
      design: design
      schema: @props.schema
      dataSource: @props.dataSource
      layerDataSource: @props.mapDataSource.getLayerDataSource(layerViewId) 
      scopeData: if @props.scope?.data?.layerViewId == layerViewId then @props.scope.data.data
    })

    if not results
      return

    # Handle popup as first priority
    if results.popup
      @setState(popupContents: results.popup)
      return

    # Next try scoping
    if @props.onScopeChange and results.scope
      # Encode layer view id into scope
      scope = {
        name: results.scope.name
        filter: results.scope.filter
        data: { layerViewId: layerViewId, data: results.scope.data }
      }

      @props.onScopeChange(scope)
      return

    # Handle standard case
    if results.row
      @props.onRowClick?(results.row.tableId, results.row.primaryKey)

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
      position: 'absolute'
      right: 10
      bottom: 35
      maxHeight: '85%'
      overflowY: 'auto'
      zIndex: 9
      fontSize: 12
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

    # Determine scoped filters
    if @props.scope
      scopedCompiledFilters = compiledFilters.concat([@props.scope.filter])
    else
      scopedCompiledFilters = compiledFilters

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

      # Get layer data source
      layerDataSource = @props.mapDataSource.getLayerDataSource(layerView.id)

      # If layer is scoping, fade opacity and add extra filtered version
      isScoping = @props.scope and @props.scope.data.layerViewId == layerView.id 

      # Create leafletLayer
      leafletLayer = {
        tileUrl: layerDataSource.getTileUrl(if isScoping then compiledFilters else scopedCompiledFilters)
        utfGridUrl: layerDataSource.getUtfGridUrl(if isScoping then compiledFilters else scopedCompiledFilters)
        visible: layerView.visible
        opacity: if isScoping then layerView.opacity * 0.5 else layerView.opacity
        minZoom: layer.getMinZoom(design)
        maxZoom: layer.getMaxZoom(design)
        onGridClick: @handleGridClick.bind(null, layerView.id)
      }

      leafletLayers.push(leafletLayer)

      # Add scoped layer if scoping
      if isScoping
        
        leafletLayer = {
          tileUrl: layerDataSource.getTileUrl(scopedCompiledFilters)
          utfGridUrl: layerDataSource.getUtfGridUrl(scopedCompiledFilters)
          visible: layerView.visible
          opacity: layerView.opacity
          minZoom: layer.getMinZoom(design)
          maxZoom: layer.getMaxZoom(design)
          onGridClick: @handleGridClick.bind(null, layerView.id)
        }

        leafletLayers.push(leafletLayer)

    H.div style: { width: @props.width, height: @props.height, position: 'relative' },
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
        extraAttribution: @props.design.attribution
