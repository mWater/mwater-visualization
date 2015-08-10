React = require 'react'
LeafletMapComponent = require './LeafletMapComponent'

module.exports = class MapViewComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design
    layerFactory: React.PropTypes.object.isRequired

  render: ->
    # Create layers
    layers = _.map(@props.design.layerViews, (layerView) =>
      layer = @props.layerFactory.createLayer(layerView.layer.type, layerView.layer.design)
      return {
        tileUrl: layer.getTileUrl()
        utfGridUrl: layer.getUtfGridUrl()
        visible: layerView.visible
        opacity: layerView.opacity
        })

    React.createElement(LeafletMapComponent,
      initialCenter: [0,0], 
      initialZoom: 5, 
      baseLayerId: @props.design.baseLayer
      layers: layers
      width: @props.width
      height: @props.height)
