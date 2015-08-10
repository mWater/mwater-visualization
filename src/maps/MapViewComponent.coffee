React = require 'react'
LeafletMapComponent = require './LeafletMapComponent'

module.exports = class MapViewComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design
    tileSourceFactory: React.PropTypes.object.isRequired

  render: ->
    # Create layers
    layers = _.map(@props.design.layers, (layer) =>
      tileSource = @props.tileSourceFactory.createTileSource(layer.tileSource.type, layer.tileSource.design)
      return {
        tileUrl: tileSource.getTileUrl()
        utfGridUrl: tileSource.getUtfGridUrl()
        visible: layer.visible
        opacity: layer.opacity
        })

    React.createElement(LeafletMapComponent,
      initialCenter: [0,0], 
      initialZoom: 5, 
      baseLayerId: @props.design.baseLayer
      layers: layers
      width: @props.width
      height: @props.height)
