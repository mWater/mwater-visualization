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
DashboardPopupComponent = require '../dashboards/DashboardPopupComponent'

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

    onSystemAction: React.PropTypes.func # Called with (actionId, tableId, rowIds) when an action is performed on rows. actionId is id of action e.g. "open"

    # Gets available system actions for a table. Called with (tableId). 
    # Returns [{ id: id of action, name: name of action, multiple: true if for multiple rows support, false for single }]
    getSystemActions: React.PropTypes.func 
    namedStrings: React.PropTypes.object # Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget

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

    # All dashboard popups
    popups: React.PropTypes.arrayOf(React.PropTypes.shape({ id: React.PropTypes.string.isRequired, design: React.PropTypes.object.isRequired }))
    onPopupsChange: React.PropTypes.func # Sets popups 

  constructor: (props) ->
    super

    @state = {
      popupContents: null   # Element in the popup DEPRECATED
    }

  # Call to print the map. Prints landscape. Scale is the scaling factor to apply to increase resolution
  print: (scale) =>
    # Create new design with current bounds
    design = _.extend({}, @props.design, { bounds: @refs.leafletMap.getBounds(), autoBounds: false })

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
      # Autozoom if filters or autozoom changed
      if not _.isEqual(@props.design.filters, prevProps.design.filters) or not _.isEqual(@props.extraFilters, prevProps.extraFilters) or not prevProps.design.autoBounds 
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
      showDashboardPopup: @dashboardPopupComponent.show
      onSystemAction: @props.onSystemAction
      onScopeChange: (scope) =>
        if scope
          # Encode layer id into scope as layer itself doesn't know its ID
          scope = {
            name: scope.name
            filter: scope.filter
            data: { layerViewId: layerViewId, data: scope.data }
          }
        @props.onScopeChange?(scope)
    })

    # if not results
    #   return

    # # Handle popup first
    # if results.popup
    #   @setState(popupContents: results.popup)

    # # Handle onSystemAction case
    # if results.row and @props.onSystemAction
    #   # TODO use clickAction
    #   @props.onSystemAction("open", results.row.tableId, [results.row.primaryKey])

    # # Handle scoping
    # if @props.onScopeChange and _.has(results, "scope")
    #   if results.scope
    #     # Encode layer view id into scope
    #     scope = {
    #       name: results.scope.name
    #       filter: results.scope.filter
    #       data: { layerViewId: layerViewId, data: results.scope.data }
    #     }
    #   else
    #     scope = null

    #   @props.onScopeChange(scope)

  # Get filters from extraFilters combined with map filters
  getCompiledFilters: ->
    exprCompiler = new ExprCompiler(@props.schema)

    compiledFilters = []

    # Compile filters to JsonQL expected by layers
    for table, expr of (@props.design.filters or {})
      jsonql = exprCompiler.compileExpr(expr: expr, tableAlias: "{alias}")
      if jsonql
        compiledFilters.push({ table: table, jsonql: jsonql })

    # Add extra filters
    if @props.extraFilters
      compiledFilters = compiledFilters.concat(@props.extraFilters)

    return compiledFilters

  renderLegend: ->
    return R LegendComponent,
      schema: @props.schema
      layerViews: @props.design.layerViews

  # TODO DEPRECATED
  renderLegacyPopup: ->
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

  # Render the popup dashboard which can display
  renderPopup: ->
    R DashboardPopupComponent,
      ref: (c) => @dashboardPopupComponent = c
      popups: @props.popups
      onPopupsChange: @props.onPopupsChange
      schema: @props.schema
      dataSource: @props.dataSource
      getPopupDashboardDataSource: @props.mapDataSource.getPopupDashboardDataSource
      onSystemAction: @props.onSystemAction
      getSystemActions: @props.getSystemActions
      namedStrings: @props.namedStrings
      filters: @getCompiledFilters()

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
      @renderLegacyPopup()
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