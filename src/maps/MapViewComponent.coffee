PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
LeafletMapComponent = require './LeafletMapComponent'
ExprUtils = require('mwater-expressions').ExprUtils
ExprCompiler = require('mwater-expressions').ExprCompiler
LayerFactory = require './LayerFactory'
ModalPopupComponent = require('react-library/lib/ModalPopupComponent')
MapUtils = require './MapUtils'

LegendComponent = require './LegendComponent'

# Component that displays just the map
module.exports = class MapViewComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired # Schema to use
    dataSource: PropTypes.object.isRequired # data source to use

    # Url source for the map
    mapDataSource: PropTypes.shape({
      # Gets the data source for a layer
      getLayerDataSource: PropTypes.func.isRequired
      
      # Gets the bounds for the map. Null for no opinion. Callback as { n:, s:, w:, e: }
      getBounds: PropTypes.func.isRequired
    }).isRequired
    
    design: PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: PropTypes.func   # Called with new design. null/undefined to ignore bounds changes

    width: PropTypes.number        # Width in pixels
    height: PropTypes.number       # Height in pixels

    onRowClick: PropTypes.func     # Called with (tableId, rowId) when item is clicked

    extraFilters: PropTypes.arrayOf(PropTypes.shape({
      table: PropTypes.string.isRequired
      jsonql: PropTypes.object.isRequired
    })) # Extra filters to apply to view

    # scope of the map (when a layer self-selects a particular scope)
    scope: PropTypes.shape({
      name: PropTypes.string.isRequired
      filter: PropTypes.shape({ table: PropTypes.string.isRequired, jsonql: PropTypes.object.isRequired })
      data: PropTypes.shape({ layerViewId: PropTypes.string.isRequired, data: PropTypes.any }).isRequired  
      })
    onScopeChange: PropTypes.func # called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details

    dragging:  PropTypes.bool         # Whether the map be draggable with mouse/touch or not. Default true
    touchZoom: PropTypes.bool         # Whether the map can be zoomed by touch-dragging with two fingers. Default true
    scrollWheelZoom: PropTypes.bool   # Whether the map can be zoomed by using the mouse wheel. Default true
    zoomLocked: PropTypes.bool   # Whether changes to zoom level should be persisted. Default false

  constructor: (props) ->
    super

    @state = {
      popupContents: null   # Element in the popup
    }

  componentDidMount: ->
    # Autozoom
    if @props.design.autoBounds 
      @performAutoZoom()

  componentDidUpdate: (prevProps) ->
    if @props.design.autoBounds
      # Autozoom if filters or autozoom changed
      if not _.isEqual(@props.design.filters, prevProps.design.filters) or not _.isEqual(@props.design.globalFilters, prevProps.design.globalFilters) or not _.isEqual(@props.extraFilters, prevProps.extraFilters) or not prevProps.design.autoBounds 
        @performAutoZoom()
    else
      # Update bounds
      if not _.isEqual(@props.design.bounds, prevProps.design.bounds)
        @refs.leafletMap?.setBounds(@props.design.bounds)

  performAutoZoom: ->
    @props.mapDataSource.getBounds(@props.design, @getCompiledFilters(), (error, bounds) =>
      if bounds
        @refs.leafletMap?.setBounds(bounds, 0.2)

        # Also record if editable as part of bounds
        if @props.onDesignChange?
          @props.onDesignChange(_.extend({}, @props.design, bounds: bounds))
      )

  handleBoundsChange: (bounds) =>
    # Ignore if readonly
    if not @props.onDesignChange?
      return
    
    if @props.zoomLocked
      return

    # Ignore if autoBounds
    if @props.design.autoBounds
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
      filters: @getCompiledFilters()
    })

    if not results
      return

    # Handle popup first
    if results.popup
      @setState(popupContents: results.popup)

    # Handle onRowClick case
    if results.row and @props.onRowClick
      @props.onRowClick(results.row.tableId, results.row.primaryKey)

    # Handle scoping
    if @props.onScopeChange and _.has(results, "scope")
      if results.scope
        # Encode layer view id into scope
        scope = {
          name: results.scope.name
          filter: results.scope.filter
          data: { layerViewId: layerViewId, data: results.scope.data }
        }
      else
        scope = null

      @props.onScopeChange(scope)

  # Get filters from extraFilters combined with map filters
  getCompiledFilters: ->
    return (@props.extraFilters or []).concat(MapUtils.getCompiledFilters(@props.design, @props.schema, MapUtils.getFilterableTables(@props.design, @props.schema)))

  renderLegend: ->
    return R LegendComponent,
      schema: @props.schema
      layerViews: @props.design.layerViews
      filters: @getCompiledFilters()
      dataSource: @props.dataSource

  renderPopup: ->
    if not @state.popupContents
      return null

    return R ModalPopupComponent, 
      onClose: => @setState(popupContents: null)
      showCloseX: true
      size: "large",
        @state.popupContents
        H.div style: { textAlign: "right", marginTop: 10 },
          H.button className: "btn btn-default", onClick: (=> @setState(popupContents: null)),
            "Close"

  render: ->
    compiledFilters = @getCompiledFilters()

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
        tileUrl: layerDataSource.getTileUrl(design, if isScoping then compiledFilters else scopedCompiledFilters)
        utfGridUrl: layerDataSource.getUtfGridUrl(design, if isScoping then compiledFilters else scopedCompiledFilters)
        visible: layerView.visible
        opacity: if isScoping then layerView.opacity * 0.3 else layerView.opacity
        minZoom: layer.getMinZoom(design)
        maxZoom: layer.getMaxZoom(design)
        onGridClick: @handleGridClick.bind(null, layerView.id)
      }

      leafletLayers.push(leafletLayer)

      # Add scoped layer if scoping
      if isScoping
        leafletLayer = {
          tileUrl: layerDataSource.getTileUrl(design, scopedCompiledFilters)
          utfGridUrl: layerDataSource.getUtfGridUrl(design, scopedCompiledFilters)
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
        ref: "leafletMap"
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
        loadingSpinner: true
        maxZoom: @props.design.maxZoom