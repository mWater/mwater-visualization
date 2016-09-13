_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
LeafletMapComponent = require './LeafletMapComponent'
ExprUtils = require('mwater-expressions').ExprUtils
ExprCompiler = require('mwater-expressions').ExprCompiler
LayerFactory = require './LayerFactory'
ModalPopupComponent = require('react-library/lib/ModalPopupComponent')
ReactElementPrinter = require 'react-library/lib/ReactElementPrinter'

LegendComponent = require './LegendComponent'

# Component that displays just the map
module.exports = class MapViewComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired # data source to use

    # Url source for the map
    mapDataSource: React.PropTypes.shape({
      # Gets the data source for a layer
      getLayerDataSource: React.PropTypes.func.isRequired
      
      # Gets the bounds for the map. Null for no opinion. Callback as { n:, s:, w:, e: }
      getBounds: React.PropTypes.func.isRequired
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

  # Call to print the map. Prints landscape. Scale is the scaling factor to apply to increase resolution
  print: (scale) =>
    # Create new design with current bounds
    design = _.extend({}, @props.design, { bounds: @refs.leafletMap.getBounds() })

    # Create element at 96 dpi (usual for browsers) and 7.5" across (letter - 0.5" each side). 1440 is double, so scale down
    elem = H.div style: { transform: "rotate(90deg) translateY(-720px)", width: 0, height: 0 },
      H.div style: { transform: "scale(#{1/scale})", transformOrigin: "top left" },
        # Hide zoom control and display background colors
        H.style null, '''
        .leaflet-control-zoom { display: none; }
        @media print {
          body { -webkit-print-color-adjust: exact; }
        }      
        '''
        R(MapViewComponent, _.extend({}, @props, { width: 960 * scale, height: 720 * scale, design: design, onDesignChange: null }))
    
    printer = new ReactElementPrinter()
    printer.print(elem, { delay: 8000 })

  componentDidMount: ->
    # Autozoom
    if @props.design.autoBounds 
      @performAutoZoom()

  componentDidUpdate: (prevProps) ->
    if @props.design.autoBounds
      # Autozoom
      if not _.isEqual(_.omit(@props.design, "bounds"), _.omit(prevProps.design, "bounds")) or not _.isEqual(@props.extraFilters, prevProps.extraFilters)
        @performAutoZoom()
    else
      # Update bounds
      if not _.isEqual(@props.design.bounds, prevProps.design.bounds)
        @refs.leafletMap?.setBounds(@props.design.bounds, 0.2)

  performAutoZoom: ->
    @props.mapDataSource.getBounds(@props.design, @getCompiledFilters(), (error, bounds) =>
      if bounds
        @refs.leafletMap?.setBounds(bounds)

        # Also record if editable as part of bounds
        if not @props.onDesignChange?
          @props.onDesignChange(_.extend({}, @props.design, bounds: bounds))
      )

  handleBoundsChange: (bounds) =>
    # Ignore if readonly
    if not @props.onDesignChange?
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
    exprUtils = new ExprUtils(@props.schema)

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

    return compiledFilters

  renderLegend: ->
    return R LegendComponent,
      schema: @props.schema
      layerViews: @props.design.layerViews

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