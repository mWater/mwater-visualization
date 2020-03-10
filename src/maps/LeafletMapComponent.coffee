PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
ReactDOM = require 'react-dom'
R = React.createElement
L = require 'leaflet'
BingLayer = require './BingLayer'
UtfGridLayer = require './UtfGridLayer'

# Setup leaflet loading
window.L = L
require('leaflet-loading')

# See https://github.com/PaulLeCam/react-leaflet/issues/255#issuecomment-261904061 for issue with CSS + webpack
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

# Leaflet map component that displays a base layer, a tile layer and an optional interactivity layer
module.exports = class LeafletMapComponent extends React.Component
  @propTypes:
    baseLayerId: PropTypes.string.isRequired # "bing_road", "bing_aerial", "cartodb_positron", "cartodb_dark_matter", "white"
    baseLayerOpacity: PropTypes.number       # Optional opacity 0-1

    initialBounds: PropTypes.shape({
      w: PropTypes.number.isRequired
      n: PropTypes.number.isRequired
      e: PropTypes.number.isRequired
      s: PropTypes.number.isRequired
      }) # Initial bounds. Fit world if none

    width: PropTypes.any # Required width
    height: PropTypes.any # Required height

    onBoundsChange: PropTypes.func # Called with bounds in w, n, s, e format when bounds change
    
    # See .d.ts for docs on this
    layers: PropTypes.any # List of layers

    # Legend. Will have zoom injected
    legend: PropTypes.node # Legend element

    dragging:  PropTypes.bool         # Whether the map be draggable with mouse/touch or not. Default true
    touchZoom: PropTypes.bool         # Whether the map can be zoomed by touch-dragging with two fingers. Default true
    scrollWheelZoom: PropTypes.bool   # Whether the map can be zoomed by using the mouse wheel. Default true
    keyboard: PropTypes.bool          # Whether the map responds to keyboard. Default true

    minZoom: PropTypes.number         # Minimum zoom level
    maxZoom: PropTypes.number         # Maximum zoom level
    extraAttribution: PropTypes.string # User defined attributions

    loadingSpinner: PropTypes.bool       # True to add loading spinner

    scaleControl: PropTypes.bool      # True to show scale control

    popup: PropTypes.shape({          # Set to display a Leaflet popup control
      lat: PropTypes.number.isRequired
      lng: PropTypes.number.isRequired
      contents: PropTypes.node.isRequired
      })

  @defaultProps: 
    dragging: true
    touchZoom: true
    scrollWheelZoom: true
    scaleControl: true
    keyboard: true

  # Reload all tiles
  reload: ->
    # TODO reload JSON tiles
    for tileLayer in @tileLayers
      tileLayer.redraw()

  # Get underlying leaflet map
  getLeafletMap: -> @map

  # Get bounds. Bounds are in { w, n, s, e } format
  getBounds: ->
    curBounds = @map.getBounds()
    return {
      n: curBounds.getNorth()
      e: curBounds.getEast()
      s: curBounds.getSouth()
      w: curBounds.getWest()
    }

  # Set bounds. Bounds are in { w, n, s, e } format. Padding is optional
  setBounds: (bounds, pad) ->
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

      lBounds = new L.LatLngBounds([[s, w], [n, e]])
      if pad
        lBounds = lBounds.pad(pad)

      @map.fitBounds(lBounds, { animate: true })
    else
      # Fit world doesn't work sometimes. Make sure that entire left-right is included
      @map.fitBounds([[-1, -180], [1, 180]])

    @hasBounds = true

  componentDidMount: ->
    # Create map
    mapOptions = {
      fadeAnimation: false
      dragging: @props.dragging
      touchZoom: @props.touchZoom
      scrollWheelZoom: @props.scrollWheelZoom
      minZoom: 1  # Bing doesn't allow going to zero
      keyboard: @props.keyboard
    }

    # Must not be null, or will not zoom
    if @props.maxZoom?
      mapOptions.maxZoom = @props.maxZoom

    if @props.minZoom?
      mapOptions.minZoom = @props.minZoom

    @map = L.map(@mapElem, mapOptions)

    if @props.scaleControl
      L.control.scale().addTo(@map)

    # Update legend on zoom
    @map.on "zoomend", => @forceUpdate()

    # Update legend on first load
    @map.on "load", => 
      @loaded = true
      @forceUpdate()

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
    @map?.remove()

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

    # Update maxZoom
    if prevProps and prevProps.maxZoom != @props.maxZoom
      @map.options.maxZoom = @props.maxZoom
      if @map.getZoom() > @props.maxZoom
        @map.setZoom(@props.maxZoom)

    # Update attribution
    if not prevProps or @props.extraAttribution != prevProps.extraAttribution
      if @baseLayer
        @baseLayer._map.attributionControl.removeAttribution(prevProps.extraAttribution)
        @baseLayer._map.attributionControl.addAttribution(@props.extraAttribution)

    # Update popup
    if prevProps and prevProps.popup and not @props.popup
      # If existing popupDiv, unmount
      if @popupDiv
        ReactDOM.unmountComponentAtNode(@popupDiv)
        @popupDiv = null

      # Close popup
      @map.removeLayer(@popupLayer)
      @popupLayer = null
    else if prevProps and prevProps.popup and @props.popup
      # Move location
      if prevProps.popup.lat != @props.popup.lat or prevProps.popup.lng != @props.popup.lng
        @popupLayer.setLatLng(L.latLng(@props.popup.lat, @props.popup.lng))

      # Re-render contents
      ReactDOM.render(@props.popup.contents, @popupDiv)
    else if @props.popup
      # Create popup
      @popupDiv = L.DomUtil.create('div', '')
      ReactDOM.render(@props.popup.contents, @popupDiv)

      @popupLayer = L.popup({ minWidth: 100, autoPan: true, closeButton: false, closeOnClick: false })
        .setLatLng(L.latLng(@props.popup.lat, @props.popup.lng))
        .setContent(@popupDiv)
        .openOn(@map)

    # Update base layer
    if not prevProps or @props.baseLayerId != prevProps.baseLayerId or @props.baseLayerOpacity != prevProps.baseLayerOpacity
      if @baseLayer
        @map.removeLayer(@baseLayer)
        @baseLayer = null

      switch @props.baseLayerId
        when "bing_road"
          # @baseLayer = new BingLayer("Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU", {type: "Road"})
          @baseLayer = L.tileLayer('https://{s}.api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
            tileSize: 512,
            maxZoom: 18,
            subdomains: ["a", "b"],
            zoomOffset: -1,
            id: 'mapbox/streets-v11',
            accessToken: 'pk.eyJ1IjoiZ3Jhc3NpY2siLCJhIjoiY2ozMzU1N3ZoMDA3ZDJxbzh0aTRtOTRoeSJ9.fFWBZ88vbdezyhfw-I-fag'
          })
        when "bing_aerial"
          @baseLayer = new BingLayer("Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU", {type: "AerialWithLabels"})
        when "cartodb_positron"
          @baseLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
          })
        when "cartodb_dark_matter"
          @baseLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',{
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
          })

      if @baseLayer
        @map.addLayer(@baseLayer)
        if @props.baseLayerOpacity?
          @baseLayer.setOpacity(@props.baseLayerOpacity)

        if @props.extraAttribution
          @baseLayer._map.attributionControl.addAttribution(@props.extraAttribution)

        # Base layers are always at back
        @baseLayer.bringToBack()

    # Update layers
    if not prevProps or JSON.stringify(_.omit(@props.layers, "onGridClick", "onGridHover", "onClick")) != JSON.stringify(_.omit(prevProps.layers, "onGridClick", "onGridHover", "onClick")) # TODO naive
      # TODO This is naive. Could be more surgical about updates
      if @tileLayers
        for tileLayer in @tileLayers        
          @map.removeLayer(tileLayer)
        @tileLayers = null

      if @utfGridLayers
        for utfGridLayer in @utfGridLayers
          @map.removeLayer(utfGridLayer)
        @utfGridLayers = null

      # Remove Geojson layers
      if @geoJsonLayers
        for geoJsonLayer in @geoJsonLayers
          @map.removeLayer(geoJsonLayer)
        @geoJsonLayers = null

      if @props.layers
        @tileLayers = []
        @geoJsonLayers = []

        for layer in @props.layers
          # Handle Tile layer
          if layer.tileUrl
            # Do not display if not visible
            if not layer.visible
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
          else if layer.geometry
            geoJsonLayer = L.geoJSON(layer.geometry, {
              # Put in front
              pane: "markerPane",
              style: layer.style,
              interactive: (if layer.nonInteractive then false else true),
              pointToLayer: (geojson, latlng) =>
                if layer.pointStyle 
                  return L.circleMarker(latlng, _.extend({}, layer.pointStyle, { interactive: (if layer.nonInteractive then false else true) }))
                else 
                  return L.marker(latlng, { interactive: (if layer.nonInteractive then false else true) })
            })
            if layer.onClick
              geoJsonLayer.on("click", layer.onClick)
            @geoJsonLayers.push(geoJsonLayer)
            @map.addLayer(geoJsonLayer)

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

            if layer.onGridHover
              do (layer) =>
                utfGridLayer.on 'mouseout', (ev) =>
                  layer.onGridHover(_.omit(ev, "data"))
                utfGridLayer.on 'mouseover', (ev) =>
                  layer.onGridHover(ev)
                utfGridLayer.on 'mousemove', (ev) =>
                  layer.onGridHover(ev)

  render: ->
    R 'div', null,
      if @props.legend and @loaded
        # Inject zoom
        React.cloneElement(@props.legend, zoom: @map.getZoom())
      R 'div', 
        ref: (c) => @mapElem = c, 
        style: { width: @props.width, height: @props.height }