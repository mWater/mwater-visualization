PropTypes = require('prop-types')
_ = require 'lodash'
React = require 'react'
R = React.createElement

LayerFactory = require './LayerFactory'
AddLayerComponent = require './AddLayerComponent'
MapLayerViewDesignerComponent = require './MapLayerViewDesignerComponent'
ReorderableListComponent = require("react-library/lib/reorderable/ReorderableListComponent")
ExprCompiler = require('mwater-expressions').ExprCompiler

# Designer for layer selection in the map
module.exports = class MapLayersDesignerComponent extends React.Component
  @propTypes:
    schema: PropTypes.object.isRequired # Schema to use
    dataSource: PropTypes.object.isRequired
    design: PropTypes.object.isRequired  # See Map Design.md
    onDesignChange: PropTypes.func.isRequired # Called with new design
    allowEditingLayers: PropTypes.bool.isRequired  # True to allow editing layers
    filters: PropTypes.array   # array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct

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
    
    filters = _.clone(@props.filters) or []
    
    if layerView.design.filter?
      exprCompiler = new ExprCompiler(@props.schema)
      jsonql = exprCompiler.compileExpr(expr: layerView.design.filter, tableAlias: "{alias}")
      if jsonql
        filters.push({ table: layerView.design.filter.table, jsonql: jsonql })
    
    R 'div', style: style, 
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
        filters: _.compact(filters)
      )

  render: ->
    R 'div', className: "form-group",
      if @props.design.layerViews.length > 0
        R 'div', style: { padding: 5 }, key: "layers",
          R 'div', className: "list-group", key: "layers", style: { marginBottom: 10 },
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
          layerNumber: @props.design.layerViews.length
          schema: @props.schema
          dataSource: @props.dataSource
          design: @props.design
          onDesignChange: @props.onDesignChange


