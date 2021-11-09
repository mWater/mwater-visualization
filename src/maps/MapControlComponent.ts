import PropTypes from "prop-types"
import React from "react"
const R = React.createElement

import MapLayersDesignerComponent from "./MapLayersDesignerComponent"
import BaseLayerDesignerComponent from "./BaseLayerDesignerComponent"
import { DataSource, Schema } from "mwater-expressions"

interface MapControlComponentProps {
  /** Schema to use */
  schema: Schema
  dataSource: DataSource
  /** See Map Design.md */
  design: any
  onDesignChange: any
}

// Allows controlling readonly map
export default class MapControlComponent extends React.Component<MapControlComponentProps> {
  render() {
    return R(
      "div",
      { style: { padding: 5 } },
      R(MapLayersDesignerComponent, {
        schema: this.props.schema,
        dataSource: this.props.dataSource,
        design: this.props.design,
        onDesignChange: this.props.onDesignChange,
        allowEditingLayers: false
      }),

      R("br"),

      R(
        "div",
        { className: "mb-3" },
        R("label", { className: "text-muted" }, "Map Style"),

        R(BaseLayerDesignerComponent, {
          design: this.props.design,
          onDesignChange: this.props.onDesignChange
        })
      )
    )
  }
}
