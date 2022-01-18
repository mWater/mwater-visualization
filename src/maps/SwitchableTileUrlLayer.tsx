import _ from "lodash"
import Layer from "./Layer"
import { LocalizedString, Schema, DataSource } from "mwater-expressions"
import { JsonQLFilter } from "../index"
import React from "react"
import { HtmlUrlLegend } from "./HtmlUrlLegend"

/**
 * Layer that is composed of multiple tile urls that can be switched between
 * Loads legend from the server as well
 */
export interface SwitchableTileUrlLayerDesign {
  options: SwitchableOption[]

  /** id of active option */
  activeOption: string

  /** Minimum zoom level allowed */
  minZoom?: number

  /** Maximum zoom level allowed */
  maxZoom?: number

  /** Optional note to display */
  note?: string
}

/** One option that can be selected with its own urls */
interface SwitchableOption {
  /** Unique id of the option */
  id: string

  /** Name of the option */
  name: string

  /** Url with {z}, {x}, {y} included to get tiles */
  tileUrl?: string

  /** Url with {z}, {x}, {y} included to get utf grid tiles */
  utfGridUrl?: string

  /** Url to get legend html from. {name} will be replaced with url-encoded name of layer */
  legendUrl?: string
}

/** Layer that has multiple tile urls that it can display. Switchable but not editable */
export default class SwitchableTileUrlLayer extends Layer<SwitchableTileUrlLayerDesign> {
  getLayerDefinitionType(): "TileUrl" {
    return "TileUrl"
  }

  getMinZoom(design: SwitchableTileUrlLayerDesign) {
    return design.minZoom || null
  }

  getMaxZoom(design: SwitchableTileUrlLayerDesign) {
    return design.maxZoom || 21
  }

  /** Gets the tile url for definition type "TileUrl" */
  getTileUrl(design: SwitchableTileUrlLayerDesign, filters: JsonQLFilter[]): string | null {
    // Find active option
    const option = design.options.find((d) => d.id === design.activeOption)
    if (!option) {
      return null
    }

    return option.tileUrl || null
  }

  /** Gets the utf grid url for definition type "TileUrl" */
  getUtfGridUrl(design: SwitchableTileUrlLayerDesign, filters: JsonQLFilter[]): string | null {
    // Find active option
    const option = design.options.find((d) => d.id === design.activeOption)
    if (!option) {
      return null
    }

    return option.utfGridUrl || null
  }

  getLegend(
    design: SwitchableTileUrlLayerDesign,
    schema: Schema,
    name: string,
    dataSource: DataSource,
    locale: string,
    filters: JsonQLFilter[]
  ) {
    // Find active option
    const option = design.options.find((d) => d.id === design.activeOption)
    if (!option || !option.legendUrl) {
      return null
    }

    const url = option.legendUrl.replace(/\{name\}/, encodeURIComponent(name))
    return <HtmlUrlLegend url={url} />
  }

  /** True if layer can be edited */
  isEditable() {
    return true
  }

  // Creates a design element with specified options
  // options:
  //   design: design of layer
  //   schema: schema to use
  //   dataSource: data source to use
  //   onDesignChange: function called when design changes
  //   filters: array of filters
  createDesignerElement(options: {
    design: SwitchableTileUrlLayerDesign
    schema: Schema
    dataSource: DataSource
    onDesignChange: (design: SwitchableTileUrlLayerDesign) => void
    filters: JsonQLFilter[]
  }): React.ReactElement<{}> {
    // Require here to prevent server require problems
    const SwitchableTileUrlLayerDesigner = require("./SwitchableTileUrlLayerDesigner").default

    return React.createElement(SwitchableTileUrlLayerDesigner, {
      design: options.design,
      onDesignChange: (design: SwitchableTileUrlLayerDesign) => {
        return options.onDesignChange(design)
      }
    })
  }
}

