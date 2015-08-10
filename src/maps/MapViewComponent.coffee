React = require 'react'
LeafletMapComponent = require './LeafletMapComponent'
ExpressionBuilder = require '../expressions/ExpressionBuilder'

module.exports = class MapViewComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    layerFactory: React.PropTypes.object.isRequired
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

  render: ->
    exprBuilder = new ExpressionBuilder(@props.schema)

    # Use only valid ones
    filters = _.values(@props.design.filters)
    filters = _.filter(filters, (expr) => not exprBuilder.validateExpr(expr))


    # Create layers
    layers = _.map(@props.design.layerViews, (layerView) =>
      layer = @props.layerFactory.createLayer(layerView.layer.type, layerView.layer.design)
      return {
        tileUrl: layer.getTileUrl(filters)
        utfGridUrl: layer.getUtfGridUrl(filters)
        visible: layerView.visible
        opacity: layerView.opacity
        })

    React.createElement(LeafletMapComponent,
      initialCenter: [0,20], 
      initialZoom: 5, 
      baseLayerId: @props.design.baseLayer
      layers: layers
      width: @props.width
      height: @props.height)
