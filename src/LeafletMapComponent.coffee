H = React.DOM
L = require 'leaflet'
BingLayer = require './BingLayer'

# Leaflet map component that displays a base layer, a tile layer and an optional interactivity layer
module.exports = class LeafletMapComponent extends React.Component
  @propTypes:
    baseLayerId: React.PropTypes.string.isRequired # "bing_road", "bing_aerial"
    initialCenter: React.PropTypes.object.isRequired # Leaflet-style { lat:, lng: }
    initialZoom: React.PropTypes.number.isRequired # Zoom level
    
    tileLayerUrl: React.PropTypes.string # URL of tile layer
    utfGridLayerUrl: React.PropTypes.string # URL of UTFGrid interactivity layer

    legend: React.PropTypes.node # Legend element

  componentDidMount: ->
    # Create map
    mapElem = React.findDOMNode(@refs.map)
    @map = L.map(mapElem).setView(@props.initialCenter, @props.initialZoom)

    # Add legend
    @legendControl = L.control({position: 'bottomright'})
    @legendControl.onAdd = (map) =>
      @legendDiv = L.DomUtil.create('div', '')
      return @legendDiv
    @legendControl.addTo(@map)

    # Update layers with no previous properties
    @updateLayers()

  componentDidUpdate: (prevProps) ->
    @updateLayers(prevProps)

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

  updateLayers: (prevProps) ->
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

    if not prevProps or @props.tileLayerUrl != prevProps.tileLayerUrl
      if @tileLayer
        @map.removeLayer(@tileLayer)
        @tileLayer = null

      if @props.tileLayerUrl
        @tileLayer = L.tileLayer(layer.tile)

        # TODO Hack for animated zooming
        @map._zoomAnimated = false
        @map.addLayer(@tileLayer)
        @map._zoomAnimated = true
        leafletDataLayer._container.className += ' leaflet-zoom-hide'

    if not prevProps or @props.utfGridLayerUrl != prevProps.utfGridLayerUrl
      if @utfGridLayer
        @map.removeLayer(@utfGridLayer)
        @utfGridLayer = null

      if @props.utfGridLayerUrl
        @utfGridLayer = new L.UtfGrid(@props.utfGridLayerUrl, { useJsonP: false })
        @map.addLayer(@utfGridLayer)

    # Render legend
    if @props.legend
      React.render(@props.legend, @legendDiv)
    else if @legendDiv
      React.unmountComponentAtNode(@legendDiv)
    
  render: -> 
    H.div(ref: "map", style: { height: "100%" })

