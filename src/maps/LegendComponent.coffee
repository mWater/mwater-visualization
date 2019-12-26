PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

LayerFactory = require './LayerFactory'

# Displays legends
module.exports = class LegendComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired # Schema to use
    layerViews: PropTypes.array.isRequired # Layer views
    zoom: PropTypes.number     # Current zoom level
    filters: PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

  render: ->
    legendItems = _.compact(
      _.map(@props.layerViews, (layerView) => 
        # Ignore if legend hidden
        if layerView.hideLegend
          return

        # Create layer
        layer = LayerFactory.createLayer(layerView.type)

        design = layer.cleanDesign(layerView.design, @props.schema)

        # Ignore if invalid
        if layer.validateDesign(design, @props.schema)
          return null

        # Ignore if not visible
        if not layerView.visible
          return null

        # Ignore if zoom out of range
        minZoom = layer.getMinZoom(design)
        maxZoom = layer.getMaxZoom(design)
        if minZoom? and @props.zoom? and @props.zoom < minZoom
          return null

        if maxZoom? and @props.zoom? and @props.zoom > maxZoom
          return null

        return { key: layerView.id, legend: layer.getLegend(design, @props.schema, layerView.name, @props.dataSource, @props.filters) }
      )
    )

    if legendItems.length == 0
      return null

    style = {
      padding: 7
      background: "rgba(255,255,255,0.8)"
      boxShadow: "0 0 15px rgba(0,0,0,0.2)"
      borderRadius: 5
      position: 'absolute'
      right: 10
      bottom: 35
      maxHeight: '85%'
      overflowY: 'auto'
      zIndex: 1000
      fontSize: 12
    }

    return R 'div', style: style,
      _.map legendItems, (item, i) =>
        [
          R 'div', key: item.key,
            item.legend
        ]

