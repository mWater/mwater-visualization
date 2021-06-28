// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let MapControlComponent
import PropTypes from "prop-types"
import React from "react"
const R = React.createElement

import MapLayersDesignerComponent from "./MapLayersDesignerComponent"
import BaseLayerDesignerComponent from "./BaseLayerDesignerComponent"

// Allows controlling readonly map
export default MapControlComponent = (function () {
  MapControlComponent = class MapControlComponent extends React.Component {
    static initClass() {
      this.propTypes = {
        schema: PropTypes.object.isRequired, // Schema to use
        dataSource: PropTypes.object.isRequired,
        design: PropTypes.object.isRequired, // See Map Design.md
        onDesignChange: PropTypes.func.isRequired
      }
      // Called with new design
    }

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
          { className: "form-group" },
          R("label", { className: "text-muted" }, "Map Style"),

          R(BaseLayerDesignerComponent, {
            design: this.props.design,
            onDesignChange: this.props.onDesignChange
          })
        )
      )
    }
  }
  MapControlComponent.initClass()
  return MapControlComponent
})()
