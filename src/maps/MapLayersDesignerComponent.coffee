React = require 'react'
H = React.DOM

# Designer for layer selection in the map
module.exports = class MapLayersDesignerComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design

  # Updates design with the specified changes
  updateDesign: (changes) ->
    design = _.extend({}, @props.design, changes)
    @props.onDesignChange(design)

  updateLayer: (index, changes) =>
    # Make new layer
    layer = @props.design.layers[index]
    layer = _.extend({}, layer, changes)
    
    layers = @props.design.layers.slice()
    layers[index] = layer
    @updateDesign(layers: layers)

  handleBaseLayerChange: (baseLayer) =>
    @updateDesign(baseLayer: baseLayer)

  handleRemoveLayer: (index) =>
    layers = @props.design.layers.slice()
    layers.splice(index, 1)
    @updateDesign(layers: layers)

  handleAddLayer: =>
    alert("TO DO")
    # layers = @props.design.layers.slice()
    # layers.push({})
    # @updateDesign(layers: layers)

  handleVisibleClick: (index) =>
    layer = @props.design.layers[index]
    @updateLayer(index, visible: not layer.visible)

  renderLayerGearMenu: (layer, index) =>
    H.div className: "btn-group", style: { float: "right" },
      H.button type: "button", className: "btn btn-link dropdown-toggle", "data-toggle": "dropdown",
        H.span className: "glyphicon glyphicon-cog"
      H.ul className: "dropdown-menu dropdown-menu-right",
        H.li(null, H.a(null, "Edit Layer"))
        H.li(null, H.a(null, "Set Opacity"))
        H.li(null, H.a(onClick: @handleRemoveLayer.bind(null, index), "Remove Layer"))

  renderLayer: (layer, index) =>
    # Class of checkbox
    visibleClass = if layer.visible then "mwater-visualization-layer checked" else "mwater-visualization-layer"

    H.li className: "list-group-item",
      @renderLayerGearMenu(layer, index)
      H.div className: visibleClass, onClick: @handleVisibleClick.bind(null, index), 
        layer.name
        # H.br()
        # H.small null, desc

  renderBaseLayer: ->
    H.div style: { margin: 5, marginBottom: 10 },
      H.label className: "radio-inline",
        H.input 
          type: "radio"
          checked: (@props.design.baseLayer == "bing_road")
          onClick: @handleBaseLayerChange.bind(null, "bing_road"),
            "Roads"
      H.label className: "radio-inline",
        H.input 
          type: "radio"
          checked: (@props.design.baseLayer == "bing_aerial")
          onClick: @handleBaseLayerChange.bind(null, "bing_aerial"),
            "Satellite"

  render: ->
    H.div style: { padding: 5 }, 
      @renderBaseLayer()

      H.ul className: "list-group", 
        _.map(@props.design.layers, @renderLayer)

      H.div style: { margin: 5 }, 
        H.button type: "button", className: "btn btn-default", onClick: @handleAddLayer,
          H.span className: "glyphicon glyphicon-plus"
          " Add Layer"
