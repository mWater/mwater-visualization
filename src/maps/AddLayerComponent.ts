import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import uuid from "uuid"
import LayerFactory from "./LayerFactory"

interface AddLayerComponentProps {
  /** Number of layers that already exist */
  layerNumber: number
  /** See Map Design.md */
  design: any
  /** Called with new design */
  onDesignChange: any
  /** Schema to use */
  schema: any
  dataSource: any
}

// Dropdown to add a new layer.
// Can be overridden by context of addLayerElementFactory which is called with all props
export default class AddLayerComponent extends React.Component<AddLayerComponentProps> {
  static contextTypes = { addLayerElementFactory: PropTypes.func }

  handleAddLayer = (newLayer: any) => {
    const layerView = {
      id: uuid(),
      name: newLayer.name,
      desc: "",
      type: newLayer.type,
      visible: true,
      opacity: 1
    }

    // Clean design to make valid
    const layer = LayerFactory.createLayer(layerView.type)
    layerView.design = layer.cleanDesign(newLayer.design, this.props.schema)

    return this.handleAddLayerView(layerView)
  }

  handleAddLayerView = (layerView: any) => {
    // Add to list
    const layerViews = this.props.design.layerViews.slice()
    layerViews.push(layerView)

    const design = _.extend({}, this.props.design, { layerViews })
    return this.props.onDesignChange(design)
  }

  render() {
    if (this.context.addLayerElementFactory) {
      return this.context.addLayerElementFactory(this.props)
    }

    const newLayers = [
      {
        label: "Marker Layer",
        name: "Untitled Layer",
        type: "Markers",
        design: {}
      },
      {
        label: "Radius (circles) Layer",
        name: "Untitled Layer",
        type: "Buffer",
        design: {}
      },
      {
        label: "Choropleth Layer",
        name: "Untitled Layer",
        type: "AdminChoropleth",
        design: {}
      },
      {
        label: "Cluster Layer",
        name: "Untitled Layer",
        type: "Cluster",
        design: {}
      },
      {
        label: "Grid Layer",
        name: "Untitled Layer",
        type: "Grid",
        design: {}
      },
      {
        label: "Custom Tile Url (advanced)",
        name: "Untitled Layer",
        type: "TileUrl",
        design: {}
      }
    ]

    return R(
      "div",
      { style: { margin: 5 }, key: "addLayer", className: "btn-group" },
      R(
        "button",
        { type: "button", "data-toggle": "dropdown", className: "btn btn-primary dropdown-toggle" },
        R("span", { className: "glyphicon glyphicon-plus" }),
        " Add Layer ",
        R("span", { className: "caret" })
      ),
      R(
        "ul",
        { className: "dropdown-menu" },
        _.map(newLayers, (layer, i) => {
          return R(
            "li",
            { key: "" + i },
            R("a", { onClick: this.handleAddLayer.bind(null, layer) }, layer.label || layer.name)
          )
        })
      )
    )
  }
}
