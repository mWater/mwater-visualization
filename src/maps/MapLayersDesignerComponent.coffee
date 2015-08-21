React = require 'react'
H = React.DOM
uuid = require 'node-uuid'
ActionCancelModalComponent = require '../ActionCancelModalComponent'

# Designer for layer selection in the map
module.exports = class MapLayersDesignerComponent extends React.Component
  @propTypes:
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design
    schema: React.PropTypes.object.isRequired # Schema to use
    layerFactory: React.PropTypes.object.isRequired # Layer factory to use

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

  handleAddLayerView: (layer) =>
    layerView = {
      id: uuid.v4()
      name: layer.name
      desc: ""
      type: layer.type
      design: layer.design
      visible: true
      opacity: 1
    }

    layerViews = @props.design.layerViews.slice()
    layerViews.push(layerView)
    @updateDesign(layerViews: layerViews)


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
    H.div style: { margin: 5, marginBottom: 10 }, key: "baseLayers",
      @renderBaseLayer("bing_road", "Roads")
      @renderBaseLayer("bing_aerial", "Satellite")

  renderAddLayer: ->
    H.div style: { margin: 5 }, key: "addLayer", className: "btn-group",
      H.button type: "button", "data-toggle": "dropdown", className: "btn btn-default dropdown-toggle",
        H.span className: "glyphicon glyphicon-plus"
        " Add Layer "
        H.span className: "caret"
      H.ul className: "dropdown-menu",
        _.map(@props.layerFactory.getNewLayers(), (layer, i) =>
          H.li key: "" + i,
            H.a onClick: @handleAddLayerView.bind(null, layer), layer.name
          )

  renderLayerView: (layerView, index) =>
    H.li className: "list-group-item", key: layerView.id,
      React.createElement(MapLayerViewDesignerComponent, 
        layerView: layerView
        onLayerViewChange: (lv) => @updateLayerView(index, lv)
        onRemove: => @handleRemoveLayerView(index)
        schema: @props.schema
        layerFactory: @props.layerFactory
      )

  render: ->
    H.div style: { padding: 5 }, 
      @renderBaseLayers()

      H.ul className: "list-group", 
        _.map(@props.design.layerViews, @renderLayerView)

      @renderAddLayer()

# A single row in the table of layer views. Handles the editor state
class MapLayerViewDesignerComponent extends React.Component
  @propTypes:
    layerView: React.PropTypes.object.isRequired  # See Map Design.md
    onLayerViewChange: React.PropTypes.func.isRequired # Called with new layer view
    onRemove: React.PropTypes.func.isRequired # Called to remove
    schema: React.PropTypes.object.isRequired # Schema to use
    layerFactory: React.PropTypes.object.isRequired # Layer factory to use

  constructor: ->
    super
    # editingDesign is not null if editing. If present, is the tentative design of the layer
    @state = { editingDesign: null }

  update: (updates) ->
    @props.onLayerViewChange(_.extend({}, @props.layerView, updates))

  handleVisibleClick: (index) =>
    @update(visible: not layerView.visible)

  handleSaveEditing: =>
    @update(design: @state.editingDesign)
    @setState(editingDesign: null)

  handleCancelEditing: => @setState(editingDesign: null)
  handleStartEditing: => @setState(editingDesign: @props.layerView.design)
  handleEditingChange: (design) =>  @setState(editingDesign: layerView.design)

  renderEditor: ->
    if not @state.editingDesign?
      return

    layer = @props.layerFactory.createLayer(@props.layerView.type, @state.editingDesign)
    return React.createElement(ActionCancelModalComponent,
      title: "Edit Layer"
      onAction: @handleSaveEditing
      onCancel: @handleCancelEditing,
        layer.createDesignerElement(onDesignChange: @handleEditingChange)
    )

  renderLayerGearMenu: ->
    layer = @props.layerFactory.createLayer(@props.layerView.type, @props.layerView.design)

    H.div className: "btn-group", style: { float: "right" }, key: "gear",
      H.button type: "button", className: "btn btn-link dropdown-toggle", "data-toggle": "dropdown",
        H.span className: "glyphicon glyphicon-cog"
      H.ul className: "dropdown-menu dropdown-menu-right",
        if layer.isEditable()
          H.li(key: "edit", H.a(onClick: @handleStartEditing, "Edit Layer"))
        # H.li(key: "opacity", H.a(null, "Set Opacity"))
        H.li(key: "remove", H.a(onClick: @props.onRemove, "Remove Layer"))

  render: ->
    # Class of checkbox
    visibleClass = if @props.layerView.visible then "mwater-visualization-layer checked" else "mwater-visualization-layer"
    H.div null, 
      @renderLayerGearMenu()
      H.div className: visibleClass, onClick: @handleVisibleClick, key: "layerView",
        @props.layerView.name
        # H.br()
        # H.small null, desc
      @renderEditor()
