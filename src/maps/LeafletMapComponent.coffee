React = require 'react'
ReactDOM = require 'react-dom'
H = React.DOM
L = require 'leaflet'
BingLayer = require './BingLayer'
UtfGridLayer = require './UtfGridLayer'

# Setup leaflet loading
window.L = L
require('leaflet-loading')

# Leaflet map component that displays a base layer, a tile layer and an optional interactivity layer
module.exports = class LeafletMapComponent extends React.Component
  @propTypes:
    baseLayerId: React.PropTypes.string.isRequired # "bing_road", "bing_aerial", "cartodb_positron", "cartodb_dark_matter"
    initialBounds: React.PropTypes.shape({
      w: React.PropTypes.number.isRequired
      n: React.PropTypes.number.isRequired
      e: React.PropTypes.number.isRequired
      s: React.PropTypes.number.isRequired
      }) # Initial bounds. Fit world if none

    width: React.PropTypes.any # Required width
    height: React.PropTypes.any # Required height

    onBoundsChange: React.PropTypes.func # Called with bounds in w, n, s, e format when bounds change
    
    layers: React.PropTypes.arrayOf(React.PropTypes.shape({
      tileUrl: React.PropTypes.string # Url in leaflet format
      utfGridUrl:  React.PropTypes.string # Url of interactivity grid
      visible: React.PropTypes.bool # Visibility
      opacity: React.PropTypes.number # 0-1
      onGridClick: React.PropTypes.func # Function that is called when grid layer is clicked. Passed { data }
      minZoom: React.PropTypes.number # Minimum zoom level
      maxZoom: React.PropTypes.number # Maximum zoom level
      })).isRequired # List of layers

    legend: React.PropTypes.node # Legend element

    dragging:  React.PropTypes.bool         # Whether the map be draggable with mouse/touch or not. Default true
    touchZoom: React.PropTypes.bool         # Whether the map can be zoomed by touch-dragging with two fingers. Default true
    scrollWheelZoom: React.PropTypes.bool   # Whether the map can be zoomed by using the mouse wheel. Default true

    maxZoom: React.PropTypes.number         # Maximum zoom level
    extraAttribution: React.PropTypes.string # User defined attributions

    loadingSpinner: React.PropTypes.bool       # True to add loading spinner

  @defaultProps: 
    dragging: true
    touchZoom: true
    scrollWheelZoom: true

  # Reload all tiles
  reload: ->
    # TODO reload JSON tiles
    for tileLayer in @tileLayers
      tileLayer.redraw()

  # Set bounds. Bounds are in { w, n, s, e } format
  setBounds: (bounds) ->
    if bounds
      # Ignore if same as current
      if @hasBounds
        curBounds = @map.getBounds()
        if curBounds and curBounds.getWest() == bounds.w and curBounds.getEast() == bounds.e and curBounds.getNorth() == bounds.n and curBounds.getSouth() == bounds.s
          return

      # Check that bounds contain some actual area (hangs leaflet if not https://github.com/mWater/mwater-visualization/issues/127)
      n = bounds.n 
      w = bounds.w
      s = bounds.s
      e = bounds.e
      if n == s
        n += 0.001
      if e == w
        e += 0.001

      @map.fitBounds(new L.LatLngBounds([[s, w], [n, e]]))
    else
      # Fit world doesn't work sometimes. Make sure that entire left-right is included
      @map.fitBounds([[-1, -180], [1, 180]])

    @hasBounds = true

  componentDidMount: ->
    # Create map
    mapElem = ReactDOM.findDOMNode(@refs.map)
    @map = L.map(mapElem, {
      fadeAnimation: false
      dragging: @props.dragging
      touchZoom: @props.touchZoom
      scrollWheelZoom: @props.scrollWheelZoom
      maxZoom: @props.maxZoom
      minZoom: 1  # Bing doesn't allow going to zero
    })

    # Fire onBoundsChange
    @map.on "moveend", => 
      if @props.onBoundsChange
        bounds = @map.getBounds()
        @props.onBoundsChange({ 
          w: bounds.getWest() 
          n: bounds.getNorth() 
          e: bounds.getEast() 
          s: bounds.getSouth() 
        })

    @setBounds(@props.initialBounds)

    if @props.loadingSpinner
      loadingControl = L.Control.loading({
        separate: true
      })
      @map.addControl(loadingControl)

    # Update map with no previous properties
    @updateMap()

  componentDidUpdate: (prevProps) ->
    @updateMap(prevProps)

  componentWillUnmount: ->
    @map.remove()

  # Open a popup.
  # Options:
  #   contents: React element of contents
  #   location: lat/lng
  #   offset: x and y of offset
  openPopup: (options) ->
    popupDiv = L.DomUtil.create('div', '')
    ReactDOM.render(options.contents, popupDiv, =>
      popup = L.popup({ minWidth: 100, offset: options.offset, autoPan: true })
        .setLatLng(options.location)
        .setContent(popupDiv)
        .openOn(@map)
    )

  updateMap: (prevProps) ->
    # Update size
    if prevProps and (prevProps.width != @props.width or prevProps.height != @props.height)
      @map.invalidateSize()

    #update attribution
    if not prevProps or @props.extraAttribution != prevProps.extraAttribution
      if @baseLayer
        @baseLayer._map.attributionControl.removeAttribution(prevProps.extraAttribution)
        @baseLayer._map.attributionControl.addAttribution(@props.extraAttribution)

    # Update base layer
    if not prevProps or @props.baseLayerId != prevProps.baseLayerId
      if @baseLayer
        @map.removeLayer(@baseLayer)
        @baseLayer = null

      switch @props.baseLayerId
        when "bing_road"
          @baseLayer = new BingLayer("Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU", {type: "Road"})
        when "bing_aerial"
          @baseLayer = new BingLayer("Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU", {type: "AerialWithLabels"})
        when "cartodb_positron"
          @baseLayer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
          })
        when "cartodb_dark_matter"
          @baseLayer = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
          })

      @map.addLayer(@baseLayer)

      if @props.extraAttribution
        @baseLayer._map.attributionControl.addAttribution(@props.extraAttribution)

      # Base layers are always at back
      @baseLayer.bringToBack()

    # Update layers
    if not prevProps or JSON.stringify(_.omit(@props.layers, "onGridClick")) != JSON.stringify(_.omit(prevProps.layers, "onGridClick")) # TODO naive
      # TODO This is naive. Could be more surgical about updates
      if @tileLayers
        for tileLayer in @tileLayers        
          @map.removeLayer(tileLayer)
        @tileLayer = null

      if @utfGridLayers
        for utfGridLayer in @utfGridLayers
          @map.removeLayer(utfGridLayer)
        @utfGridLayers = null

      if @props.layers
        @tileLayers = []
        for layer in @props.layers
          # Do not display if not visible or no tile url
          if not layer.visible or not layer.tileUrl
            continue

          options = { opacity: layer.opacity }
          
          # Putting null seems to make layer vanish
          if layer.minZoom
            options.minZoom = layer.minZoom
          if layer.maxZoom
            options.maxZoom = layer.maxZoom

          tileLayer = L.tileLayer(layer.tileUrl, options)
          @tileLayers.push(tileLayer)

          # TODO Hack for animated zooming
          @map._zoomAnimated = false
          @map.addLayer(tileLayer)
          @map._zoomAnimated = true
          tileLayer._container.className += ' leaflet-zoom-hide'

        @utfGridLayers = []
        # Add grid layers in reverse order
        for layer in @props.layers.slice().reverse()
          if not layer.visible
            continue
            
          if layer.utfGridUrl
            utfGridLayer = new UtfGridLayer(layer.utfGridUrl, { 
              useJsonP: false 
              minZoom: layer.minZoom or undefined
              maxZoom: layer.maxZoom or undefined
            })
            
            @map.addLayer(utfGridLayer)
            @utfGridLayers.push(utfGridLayer)

            if layer.onGridClick
              do (layer) =>
                utfGridLayer.on 'click', (ev) =>
                  layer.onGridClick(ev)

    # Render legend
#    if @props.legend
#      ReactDOM.render(@props.legend, @legendDiv)
#    else if @legendDiv
#      ReactDOM.unmountComponentAtNode(@legendDiv)
    
  render: ->
    H.div null,
      if @props.legend
        @props.legend
      H.div(ref: "map", style: { width: @props.width, height: @props.height })