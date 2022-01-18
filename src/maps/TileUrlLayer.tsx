import _ from "lodash"
import React from "react"
const R = React.createElement

import Layer from "./Layer"
import { DataSource, ExprCompiler, Schema } from "mwater-expressions"
import { JsonQLFilter } from "../JsonQLFilter"
import { HtmlUrlLegend } from "./HtmlUrlLegend"
import { FormGroup, TextInput } from "react-library/lib/bootstrap"

export interface TileUrlLayerDesign {
  /** Url with {s}, {z}, {x}, {y} */
  tileUrl: string
  /** optional min zoom level */
  minZoom?: number
  /** optional max zoom level */
  maxZoom?: number
  /** if true, hides url and prevents editing */
  readonly?: boolean
  /** Url to get legend html from. */
  legendUrl?: string
}

/*
Layer that is a custom Leaflet-style url tile layer
Design is:
  tileUrl: 
  minZoom: 
  maxZoom: optional max zoom level
  readonly: 
  legendUrl: 
*/
export default class TileUrlLayer extends Layer<TileUrlLayerDesign> {
  // Gets the type of layer definition ("JsonQLCss"/"TileUrl")
  getLayerDefinitionType(): "TileUrl" {
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
  isIncomplete(design: any, schema: Schema) {
    return this.validateDesign(this.cleanDesign(design, schema), schema) != null
  }

  getLegend(
    design: TileUrlLayerDesign,
    schema: Schema,
    name: string,
    dataSource: DataSource,
    locale: string,
    filters: JsonQLFilter[]
  ) {
    // Find active option
    if (!design.legendUrl) {
      return null
    }

    return <HtmlUrlLegend url={design.legendUrl} />
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
  cleanDesign(design: any, schema: Schema) {
    return design
  }

  // Validates design. Null if ok, message otherwise
  validateDesign(design: any, schema: Schema) {
    if (!design.tileUrl) {
      return "Missing Url"
    }
    return null
  }
}

interface TileUrlLayerDesignerComponentProps {
  /** Design of the marker layer */
  design: TileUrlLayerDesign
  onDesignChange: (design: TileUrlLayerDesign) => void
}

class TileUrlLayerDesignerComponent extends React.Component<TileUrlLayerDesignerComponentProps> {
  handleTileUrlChange = (tileUrl: string) => {
    return this.props.onDesignChange({ ...this.props.design, tileUrl })
  }

  handleLegendUrlChange = (legendUrl: string) => {
    return this.props.onDesignChange({ ...this.props.design, legendUrl })
  }

  render() {
    // Readonly is non-editable and shows only description
    if (this.props.design.readonly) {
      return null
    }

    return <div className="mb-3">
      <FormGroup label="Url (containing {z}, {x} and {y})" labelMuted>
        <TextInput
          value={this.props.design.tileUrl}
          onChange={this.handleTileUrlChange} />
      </FormGroup>
      <FormGroup label="Optional URL of Legend" labelMuted>
        <TextInput
          value={this.props.design.legendUrl || ""}
          onChange={this.handleLegendUrlChange} />
      </FormGroup>
    </div>
  }
}
