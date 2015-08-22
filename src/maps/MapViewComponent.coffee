React = require 'react'
H = React.DOM
LeafletMapComponent = require './LeafletMapComponent'
ExpressionBuilder = require '../expressions/ExpressionBuilder'
ExpressionCompiler = require '../expressions/ExpressionCompiler'

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
    legendItems = _.compact(
      _.map(layers, (layer, i) => 
        layerView = @props.design.layerViews[i]
        if layerView.visible
          return { key: layerView.id, legend: layer.getLegend() }
        )
      )

    if legendItems.length == 0
      return

    style = {
      padding: 7
      background: "rgba(255,255,255,0.8)"
      boxShadow: "0 0 15px rgba(0,0,0,0.2)"
      borderRadius: 5
    }

    H.div style: style,
      _.map legendItems, (item, i) =>
        H.div key: item.key,
          if i > 0 then H.br()
          item.legend

  render: ->
    exprBuilder = new ExpressionBuilder(@props.schema)

    # Use only valid ones
    filters = _.values(@props.design.filters)
    filters = _.filter(filters, (expr) => not exprBuilder.validateExpr(expr))

    # Compile filters to JsonQL expected by layers
    exprCompiler = new ExpressionCompiler(@props.schema)
    compiledFilters = _.map filters, (expr) =>
      table = exprBuilder.getExprTable(expr)
      jsonql = exprCompiler.compileExpr(expr: expr, tableAlias: "{alias}")
      return { table: table, jsonql: jsonql }

    # Create layers
    layers = _.map @props.design.layerViews, (layerView) =>
      return @props.layerFactory.createLayer(layerView.type, layerView.design)

    # Convert to leaflet layers
    leafletLayers = _.map(layers, (layer, i) =>
      {
        tileUrl: layer.getTileUrl(compiledFilters)
        utfGridUrl: layer.getUtfGridUrl(compiledFilters)
        visible: @props.design.layerViews[i].visible
        opacity: @props.design.layerViews[i].opacity
        minZoom: layer.getMinZoom()
        maxZoom: layer.getMaxZoom()
        onGridClick: layer.onGridClick.bind(layer)
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
