React = require 'react'
H = React.DOM
uuid = require 'node-uuid'

MapLayerViewDesignerComponent = require './MapLayerViewDesignerComponent'
ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent")

# Designer for layer selection in the map
module.exports = class MapLayersDesignerComponent extends React.Component
  @propTypes:
    schema: React.PropTypes.object.isRequired # Schema to use
    dataSource: React.PropTypes.object.isRequired
    design: React.PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: React.PropTypes.func.isRequired # Called with new design
    layerFactory: React.PropTypes.object.isRequired # Layer factory to use

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

  handleAddLayerView: (newLayer) =>
    layerView = {
      id: uuid.v4()
      name: newLayer.name
      desc: ""
      type: newLayer.type
      visible: true
      opacity: 1
    }

    # Clean design to make valid
    layer = @props.layerFactory.createLayer(newLayer.type, newLayer.design)
    layerView.design = layer.cleanDesign(newLayer.design, @props.schema)

    # Add to list
    layerViews = @props.design.layerViews.slice()
    layerViews.push(layerView)
    @updateDesign(layerViews: layerViews)

  handleReorder: (layerList) =>
    @updateDesign(layerViews: layerList)

  renderAddLayer: ->
    H.div style: { margin: 5 }, key: "addLayer", className: "btn-group",
      H.button type: "button", "data-toggle": "dropdown", className: "btn btn-default dropdown-toggle",
        H.span className: "glyphicon glyphicon-plus"
        " Add Layer "
        H.span className: "caret"
      H.ul className: "dropdown-menu",
        _.map(@props.layerFactory.getNewLayers(), (layer, i) =>
          H.li key: "" + i,
            H.a onClick: @handleAddLayerView.bind(null, layer), layer.label or layer.name
          )

  renderLayerView: (layerView, index, connectDragSource) =>
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
        layerFactory: @props.layerFactory
        connectDragSource: connectDragSource
      )

  render: ->
    H.div style: { padding: 5 }, 
      H.div className: "list-group",
        React.createElement(ReorderableListComponent,
          items: @props.design.layerViews
          onReorder: @handleReorder
          renderItem: @renderLayerView
          getItemId: (layerView) => layerView.id
        )

      @renderAddLayer()

