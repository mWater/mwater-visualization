import PropTypes from "prop-types"
import _ from "lodash"
import React from "react"
const R = React.createElement

import Layer from "./Layer"
import { ExprCompiler } from "mwater-expressions"
import { ExprUtils } from "mwater-expressions"
import { injectTableAlias } from "mwater-expressions"
import { ExprCleaner } from "mwater-expressions"
import AxisBuilder from "../axes/AxisBuilder"
import LegendGroup from "./LegendGroup"

/*
Layer that is a custom Leaflet-style url tile layer
Design is:
  tileUrl: Url with {s}, {z}, {x}, {y}
  minZoom: optional min zoom level
  maxZoom: optional max zoom level
  readonly: if true, hides url and prevents editing
*/
export default class TileUrlLayer extends Layer {
  // Gets the type of layer definition ("JsonQLCss"/"TileUrl")
  getLayerDefinitionType() {
    return "TileUrl"
  }

  // Gets the tile url for definition type "TileUrl"
  getTileUrl(design: any, filters: any) {
    return design.tileUrl
  }

  // Gets the utf grid url for definition type "TileUrl"
  getUtfGridUrl(design: any, filters: any) {
    return null
  }

  // Get min and max zoom levels
  getMinZoom(design: any) {
    return design.minZoom
  }
  getMaxZoom(design: any) {
    return design.maxZoom
  }

  // True if layer can be edited
  isEditable() {
    return true
  }

  // True if layer is incomplete (e.g. brand new) and should be editable immediately
  isIncomplete(design: any, schema: any) {
    return this.validateDesign(this.cleanDesign(design, schema), schema) != null
  }

  // Creates a design element with specified options.
  // Design should be cleaned on the way in and on way out.
  // options:
  //   design: design of layer
  //   schema: schema to use
  //   dataSource: data source to use
  //   onDesignChange: function called when design changes
  createDesignerElement(options: any) {
    return R(TileUrlLayerDesignerComponent, { design: options.design, onDesignChange: options.onDesignChange })
  }

  // Returns a cleaned design
  cleanDesign(design: any, schema: any) {
    return design
  }

  // Validates design. Null if ok, message otherwise
  validateDesign(design: any, schema: any) {
    if (!design.tileUrl) {
      return "Missing Url"
    }
    return null
  }
}

interface TileUrlLayerDesignerComponentProps {
  /** Design of the marker layer */
  design: any
  onDesignChange: any
}

class TileUrlLayerDesignerComponent extends React.Component<TileUrlLayerDesignerComponentProps> {
  handleTileUrlChange = (ev: any) => {
    return this.props.onDesignChange(_.extend({}, this.props.design, { tileUrl: ev.target.value }))
  }

  render() {
    // Readonly is non-editable and shows only description
    if (this.props.design.readonly) {
      return null
    }

    return R(
      "div",
      { className: "form-group" },
      R("label", { className: "text-muted" }, "Url (containing {z}, {x} and {y})"),
      R("input", {
        type: "text",
        className: "form-control",
        value: this.props.design.tileUrl || "",
        onChange: this.handleTileUrlChange
      })
    )
  }
}
