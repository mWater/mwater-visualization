React = require 'react'
H = React.DOM
LeafletMapComponent = require './LeafletMapComponent'
ExpressionBuilder = require '../expressions/ExpressionBuilder'

module.exports = class MapViewComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    layerFactory: React.PropTypes.object.isRequired
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

  handleBoundsChange: (bounds) =>
    design = _.extend({}, @props.design, bounds: bounds)
    @props.onDesignChange(design)

  shouldComponentUpdate: (prevProps) ->
    # Don't update if only initial bounds changed
    if _.isEqual(_.omit(@props.design, "bounds"), _.omit(prevProps.design, "bounds"))
      return false

    return true

  renderLegend: (layers) ->
    legends = _.compact(
      _.map(layers, (layer, i) => 
        layerView = @props.design.layerViews[i]
        if layerView.visible
          return layer.getLegend()
        )
      )

    if legends.length == 0
      return

    style = {
      padding: 7
      background: "rgba(255,255,255,0.8)"
      boxShadow: "0 0 15px rgba(0,0,0,0.2)"
      borderRadius: 5
    }

    H.div style: style,
      _.map legends, (legend, i) =>
        H.div key: "#{i}", 
          if i > 0 then H.br()
          legend

  render: ->
    exprBuilder = new ExpressionBuilder(@props.schema)

    # Use only valid ones
    filters = _.values(@props.design.filters)
    filters = _.filter(filters, (expr) => not exprBuilder.validateExpr(expr))

    # Create layers
    layers = _.map @props.design.layerViews, (layerView) =>
      return @props.layerFactory.createLayer(layerView.layer.type, layerView.layer.design)

    # Convert to leaflet layers
    leafletLayers = _.map(layers, (layer, i) =>
      {
        tileUrl: layer.getTileUrl(filters)
        utfGridUrl: layer.getUtfGridUrl(filters)
        visible: @props.design.layerViews[i].visible
        opacity: @props.design.layerViews[i].opacity
      }
    )

    React.createElement(LeafletMapComponent,
      initialBounds: @props.design.bounds
      baseLayerId: @props.design.baseLayer
      layers: leafletLayers
      width: @props.width
      height: @props.height
      legend: @renderLegend(layers)
      onBoundsChange: @handleBoundsChange)
