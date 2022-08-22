import _ from "lodash"
import React from "react"
const R = React.createElement

import LayerFactory from "./LayerFactory"
import AddLayerComponent from "./AddLayerComponent"
import MapLayerViewDesignerComponent from "./MapLayerViewDesignerComponent"
import ReorderableListComponent from "react-library/lib/reorderable/ReorderableListComponent"
import { DataSource, ExprCompiler, OpExpr, Schema } from "mwater-expressions"
import { ExprCleaner } from "mwater-expressions"
import { MapDesign, MapLayerView } from "./MapDesign"

export interface MapLayersDesignerComponentProps {
  /** Schema to use */
  schema: Schema
  dataSource: DataSource
  /** See Map Design.md */
  design: MapDesign
  /** Called with new design */
  onDesignChange: (design: MapDesign) => void
  /** True to allow editing layers */
  allowEditingLayers: boolean
  filters?: any
}

// Designer for layer selection in the map
export default class MapLayersDesignerComponent extends React.Component<MapLayersDesignerComponentProps> {
  // Updates design with the specified changes
  updateDesign(changes: any) {
    const design = _.extend({}, this.props.design, changes) as MapDesign
    return this.props.onDesignChange(design)
  }

  handleLayerViewChange = (index: any, layerView: MapLayerView) => {
    const layerViews = this.props.design.layerViews.slice()

    // Update self
    layerViews[index] = layerView

    // Unselect any in same group if selected
    if (layerView.group && layerView.visible) {
      _.each(this.props.design.layerViews, (lv, i) => {
        if (lv.visible && i !== index && lv.group === layerView.group) {
          layerViews[i] = _.extend({}, lv, { visible: false })
        }
      })
    }

    return this.updateDesign({ layerViews })
  }

  handleRemoveLayerView = (index: any) => {
    const layerViews = this.props.design.layerViews.slice()
    layerViews.splice(index, 1)
    return this.updateDesign({ layerViews })
  }

  handleReorder = (layerList: any) => {
    return this.updateDesign({ layerViews: layerList })
  }

  renderLayerView = (
    layerView: any,
    index: any,
    connectDragSource: any,
    connectDragPreview: any,
    connectDropTarget: any
  ) => {
    const style = {
      padding: "10px 15px",
      border: "1px solid #ddd",
      marginBottom: -1,
      backgroundColor: "#fff"
    }

    const filters = _.clone(this.props.filters) || []

    if (layerView.design.filter != null) {
      const exprCompiler = new ExprCompiler(this.props.schema)
      const exprCleaner = new ExprCleaner(this.props.schema)

      // Clean filter first
      const filter = exprCleaner.cleanExpr(layerView.design.filter, { types: ["boolean"] })
      if (filter) {
        const jsonql = exprCompiler.compileExpr({ expr: filter, tableAlias: "{alias}" })
        if (jsonql) {
          filters.push({ table: (filter as OpExpr).table, jsonql })
        }
      }
    }

    return R(
      "div",
      { style },
      React.createElement(MapLayerViewDesignerComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        layerView,
        onLayerViewChange: (lv: any) => this.handleLayerViewChange(index, lv),
        onRemove: () => this.handleRemoveLayerView(index),
        connectDragSource,
        connectDragPreview,
        connectDropTarget,
        allowEditingLayer: this.props.allowEditingLayers,
        filters: _.compact(filters)
      })
    )
  }

  render() {
    return R(
      "div",
      { className: "mb-3" },
      this.props.design.layerViews.length > 0
        ? R(
            "div",
            { style: { padding: 5 }, key: "layers" },
            R(
              "div",
              { className: "list-group", key: "layers", style: { marginBottom: 10 } },
              // _.map(@props.design.layerViews, @renderLayerView)
              React.createElement(ReorderableListComponent, {
                items: this.props.design.layerViews,
                onReorder: this.handleReorder,
                renderItem: this.renderLayerView,
                getItemId: (layerView: MapLayerView) => layerView.id
              })
            )
          )
        : undefined,

      this.props.allowEditingLayers
        ? R(AddLayerComponent, {
            key: "addlayer",
            layerNumber: this.props.design.layerViews.length,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            design: this.props.design,
            onDesignChange: this.props.onDesignChange
          })
        : undefined
    )
  }
}
