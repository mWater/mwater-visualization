_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement
uuid = require 'node-uuid'

LayerFactory = require './LayerFactory'

# Dropdown to add a new layer. Can be overridden by context of addLayerElementFactory which is called with { schema, dataSource } # TODO
module.exports = class AddLayerComponent extends React.Component
  @propTypes:
    firstLayer: React.PropTypes.bool  # True if for first layer
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired

  handleAddLayer: (newLayer) =>
    layerView = {
      id: uuid.v4()
      name: newLayer.name
      desc: ""
      type: newLayer.type
      visible: true
      opacity: 1
    }

    # Clean design to make valid
    layer = LayerFactory.createLayer(layerView.type)
    layerView.design = layer.cleanDesign(newLayer.design, @props.schema)

    @handleAddLayerView(layerView)

  handleAddLayerView: (layerView) =>
    # Add to list
    layerViews = @props.design.layerViews.slice()
    layerViews.push(layerView)

    design = _.extend({}, @props.design, layerViews: layerViews)
    @props.onDesignChange(design)

  render: ->
    newLayers = [
      {
        label: "Marker Layer"
        name: "Untitled Layer"
        type: "Markers"
        design: { }
      }
      {
        label: "Radius (circles) Layer"
        name: "Untitled Layer"
        type: "Buffer"
        design: { }
      }
      {
        label: "Choropleth Layer"
        name: "Untitled Layer"
        type: "AdminChoropleth"
        design: { }
      }
      {
        label: "Custom Tile Url (advanced)"
        name: "Untitled Layer"
        type: "TileUrl"
        design: { }
      }
    ]

    return H.div style: { margin: 5 }, key: "addLayer", className: "btn-group",
      H.button type: "button", "data-toggle": "dropdown", className: "btn btn-primary dropdown-toggle",
        H.span className: "glyphicon glyphicon-plus"
        " Add Layer "
        H.span className: "caret"
      H.ul className: "dropdown-menu",
        _.map(newLayers, (layer, i) =>
          H.li key: "" + i,
            H.a onClick: @handleAddLayer.bind(null, layer), layer.label or layer.name
          )
