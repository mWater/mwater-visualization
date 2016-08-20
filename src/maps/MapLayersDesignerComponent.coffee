_ = require 'lodash'
React = require 'react'
H = React.DOM
R = React.createElement

LayerFactory = require './LayerFactory'
AddLayerComponent = require './AddLayerComponent'
MapLayerViewDesignerComponent = require './MapLayerViewDesignerComponent'
ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent")

# Designer for layer selection in the map
module.exports = class MapLayersDesignerComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design
    allowEditingLayers: React.PropTypes.bool.isRequired  # True to allow editing layers

  # Updates design with the specified changes
  updateDesign: (changes) ->
    design = _.extend({}, @props.design, changes)
    @props.onDesignChange(design)

  handleLayerViewChange: (index, layerView) =>
    layerViews = @props.design.layerViews.slice()

    # Update self
    layerViews[index] = layerView

    # Unselect any in same group if selected
    if layerView.group and layerView.visible
      _.each @props.design.layerViews, (lv, i) =>
        if lv.visible and i != index and lv.group == layerView.group
          layerViews[i] = _.extend({}, lv, { visible: false })

    @updateDesign(layerViews: layerViews)

  handleRemoveLayerView: (index) =>
    layerViews = @props.design.layerViews.slice()
    layerViews.splice(index, 1)
    @updateDesign(layerViews: layerViews)

  handleReorder: (layerList) =>
    @updateDesign(layerViews: layerList)

  renderLayerView: (layerView, index, connectDragSource, connectDragPreview, connectDropTarget) =>
    style =
      padding: "10px 15px"
      border: "1px solid #ddd"
      marginBottom: -1
      backgroundColor: "#fff"

    H.div style: style, 
      React.createElement(MapLayerViewDesignerComponent, 
        schema: @props.schema
        dataSource: @props.dataSource
        layerView: layerView
        onLayerViewChange: (lv) => @handleLayerViewChange(index, lv)
        onRemove: => @handleRemoveLayerView(index)
        connectDragSource: connectDragSource
        connectDragPreview: connectDragPreview
        connectDropTarget: connectDropTarget
        allowEditingLayer: @props.allowEditingLayers
      )

  render: ->
    H.div className: "form-group",
      if @props.design.layerViews.length > 0
        H.label className: "text-muted", key: "header",
          "Layers"

      if @props.design.layerViews.length > 0
        H.div style: { padding: 5 }, key: "layers",
          H.div className: "list-group", key: "layers",
            # _.map(@props.design.layerViews, @renderLayerView)
            React.createElement(ReorderableListComponent,
              items: @props.design.layerViews
              onReorder: @handleReorder
              renderItem: @renderLayerView
              getItemId: (layerView) => layerView.id
            )

      if @props.allowEditingLayers
        R AddLayerComponent, 
          key: "addlayer"
          firstLayer: @props.design.layerViews.length == 0
          schema: @props.schema
          dataSource: @props.dataSource
          design: @props.design
          onDesignChange: @props.onDesignChange


