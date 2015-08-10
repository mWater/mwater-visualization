H = React.DOM
L = require 'leaflet'
BingLayer = require './BingLayer'
UtfGridLayer = require './UtfGridLayer'

# Leaflet map component that displays a base layer, a tile layer and an optional interactivity layer
module.exports = class LeafletMapComponent extends React.Component
  @propTypes:
    baseLayerId: React.PropTypes.string.isRequired # "bing_road", "bing_aerial"
    initialBounds: React.PropTypes.shape({
      w: React.PropTypes.number.isRequired
      n: React.PropTypes.number.isRequired
      e: React.PropTypes.number.isRequired
      s: React.PropTypes.number.isRequired
      }).isRequired

    width: React.PropTypes.number # Required width
    height: React.PropTypes.number # Required height

    onBoundsChange: React.PropTypes.func # Called with bounds in w, n, s, e format
    
    layers: React.PropTypes.arrayOf(React.PropTypes.shape({
      tileUrl: React.PropTypes.string.isRequired # Url in leaflet format
      utfGridUrl:  React.PropTypes.string # Url of interactivity grid
      visible: React.PropTypes.bool # Visibility
      opacity: React.PropTypes.number # 0-1
      })).isRequired # List of layers

    legend: React.PropTypes.node # Legend element

  componentDidMount: ->
    # Create map
    mapElem = React.findDOMNode(@refs.map)
    @map = L.map(mapElem)

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

    @map.fitBounds(new L.LatLngBounds([[@props.initialBounds.n, @props.initialBounds.w], [@props.initialBounds.s, @props.initialBounds.e]]))

    # Add legend
    @legendControl = L.control({position: 'bottomright'})
    @legendControl.onAdd = (map) =>
      @legendDiv = L.DomUtil.create('div', '')
      return @legendDiv
    @legendControl.addTo(@map)

    # Update map with no previous properties
    @updateMap()

  componentDidUpdate: (prevProps) ->
    @updateMap(prevProps)

  componentWillUnmount: ->
    if @legendDiv
      React.unmountComponentAtNode(@legendDiv)
      
    @map.remove()

  # Open a popup.
  # Options:
  #   contents: React element of contents
  #   location: lat/lng
  #   offset: x and y of offset
  openPopup: (options) ->
    popupDiv = L.DomUtil.create('div', '')
    React.render(options.contents, popupDiv, =>
      popup = L.popup({ minWidth: 100, offset: options.offset, autoPan: true })
        .setLatLng(options.location)
        .setContent(popupDiv)
        .openOn(@map)
    )

  updateMap: (prevProps) ->
    # Update size
    if prevProps and (prevProps.width != @props.width or prevProps.height != @props.height)
      @map.invalidateSize()

    # Update base layer
    if not prevProps or @props.baseLayerId != prevProps.baseLayerId
      if @baseLayer
        @map.removeLayer(@baseLayer)
        @baseLayer = null

      switch @props.baseLayerId
        when "bing_road"
          @baseLayer = new BingLayer("Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU", { type: "Road"})
        when "bing_aerial"
          @baseLayer = new BingLayer("Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU", { type: "AerialWithLabels"})
      @map.addLayer(@baseLayer)

      # Base layers are always at back
      @baseLayer.bringToBack()

    # Update layers
    if not prevProps or not _.isEqual(@props.layers != prevProps.layers)
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
          if not layer.visible
            continue

          tileLayer = L.tileLayer(layer.tileUrl)
          @tileLayers.push(tileLayer)

          # TODO Hack for animated zooming
          @map._zoomAnimated = false
          @map.addLayer(tileLayer)
          @map._zoomAnimated = true
          tileLayer._container.className += ' leaflet-zoom-hide'

        @utfGridLayers = []
        for layer in @props.layers
          if not layer.visible
            continue
            
          if layer.utfGridUrl
            utfGridLayer = new UtfGridLayer(layer.utfGridUrl, { useJsonP: false })
            
            @map.addLayer(utfGridLayer)
            @utfGridLayers.push(utfGridLayer)

    # Render legend
    if @props.legend
      React.render(@props.legend, @legendDiv)
    else if @legendDiv
      React.unmountComponentAtNode(@legendDiv)
    
  render: -> 
    H.div(ref: "map", style: { width: @props.width, height: @props.height })