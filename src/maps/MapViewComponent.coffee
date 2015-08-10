React = require 'react'
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
      initialBounds: @props.design.bounds
      baseLayerId: @props.design.baseLayer
      layers: layers
      width: @props.width
      height: @props.height
      onBoundsChange: @handleBoundsChange)
