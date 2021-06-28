// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let AddLayerComponent
import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import uuid from "uuid"
import LayerFactory from "./LayerFactory"

// Dropdown to add a new layer.
// Can be overridden by context of addLayerElementFactory which is called with all props
export default AddLayerComponent = (function () {
  AddLayerComponent = class AddLayerComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        layerNumber: PropTypes.number.isRequired, // Number of layers that already exist
        design: PropTypes.object.isRequired, // See Map Design.md
        onDesignChange: PropTypes.func.isRequired, // Called with new design

        schema: PropTypes.object.isRequired, // Schema to use
        dataSource: PropTypes.object.isRequired
      }

      this.contextTypes = { addLayerElementFactory: PropTypes.func }
      // Can be overridden by setting addLayerElementFactory in context that takes ({schema: , dataSource, design, onDesignChange, layerNumber})
    }

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
  AddLayerComponent.initClass()
  return AddLayerComponent
})()
