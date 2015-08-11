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

  updateLayerView: (index, changes) =>
    # Make new layer view
    layerView = @props.design.layerViews[index]
    layerView = _.extend({}, layerView, changes)
    
    layerViews = @props.design.layerViews.slice()
    layerViews[index] = layerView
    @updateDesign(layerViews: layerViews)

  handleBaseLayerChange: (baseLayer) =>
    @updateDesign(baseLayer: baseLayer)

  handleRemoveLayerView: (index) =>
    layerViews = @props.design.layerViews.slice()
    layerViews.splice(index, 1)
    @updateDesign(layerViews: layerViews)

  handleAddLayerView: =>
    alert("TO DO")
    # layers = @props.design.layerViews.slice()
    # layers.push({})
    # @updateDesign(layers: layers)

  handleVisibleClick: (index) =>
    layerView = @props.design.layerViews[index]
    @updateLayerView(index, visible: not layerView.visible)

  renderLayerGearMenu: (layer, index) =>
    H.div className: "btn-group", style: { float: "right" },
      H.button type: "button", className: "btn btn-link dropdown-toggle", "data-toggle": "dropdown",
        H.span className: "glyphicon glyphicon-cog"
      H.ul className: "dropdown-menu dropdown-menu-right",
        H.li(null, H.a(null, "Edit Layer"))
        H.li(null, H.a(null, "Set Opacity"))
        H.li(null, H.a(onClick: @handleRemoveLayerView.bind(null, index), "Remove Layer"))

  renderLayerView: (layer, index) =>
    # Class of checkbox
    visibleClass = if layer.visible then "mwater-visualization-layer checked" else "mwater-visualization-layer"

    H.li className: "list-group-item",
      @renderLayerGearMenu(layer, index)
      H.div className: visibleClass, onClick: @handleVisibleClick.bind(null, index), 
        layer.name
        # H.br()
        # H.small null, desc

  renderBaseLayer: (id, name) ->
    className = "mwater-visualization-layer"
    if id == @props.design.baseLayer
      className += " checked"
    
    H.div 
      key: id
      className: className
      style: { display: "inline-block" },
      onClick: @handleBaseLayerChange.bind(null, id),
        name

  renderBaseLayers: ->
    H.div style: { margin: 5, marginBottom: 10 },
      @renderBaseLayer("bing_road", "Roads")
      @renderBaseLayer("bing_aerial", "Satellite")

  render: ->
    H.div style: { padding: 5 }, 
      @renderBaseLayers()

      H.ul className: "list-group", 
        _.map(@props.design.layerViews, @renderLayerView)

      H.div style: { margin: 5 }, 
        H.button type: "button", className: "btn btn-default", onClick: @handleAddLayerView,
          H.span className: "glyphicon glyphicon-plus"
          " Add Layer"
