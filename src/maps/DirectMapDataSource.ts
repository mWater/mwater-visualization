import _ from "lodash"
import { DataSource, injectTableAlias, Schema } from "mwater-expressions"
import { JsonQLFilter } from "../JsonQLFilter"
import BlocksLayoutManager from "../layouts/blocks/BlocksLayoutManager"
import WidgetFactory from "../widgets/WidgetFactory"
import LayerFactory from "./LayerFactory"
import MapBoundsCalculator from "./MapBoundsCalculator"
import { MapDesign, MapLayerView } from "./MapDesign"
import { MapDataSource } from "./MapDataSource"
import DirectWidgetDataSource from "../widgets/DirectWidgetDataSource"
import { JsonQLCssLayerDefinition, VectorTileCTE, VectorTileSourceLayer } from "./Layer"
import compressJson from "../compressJson"
import querystring from "querystring"
import { MapLayerDataSource } from "./MapLayerDataSource"

interface DirectMapDataSourceOptions {
  /** schema to use */
  schema: Schema

  /** general data source */
  dataSource: DataSource

  /** design of entire map */
  design: MapDesign

  /** API url to use for talking to mWater server */
  apiUrl: string

  /** client id to use for talking to mWater server */
  client?: string
}

export default class DirectMapDataSource implements MapDataSource {
  options: DirectMapDataSourceOptions

  // Create map url source that uses direct jsonql maps
  constructor(options: DirectMapDataSourceOptions) {
    this.options = options
  }

  // Gets the data source for a layer
  getLayerDataSource(layerId: string): MapLayerDataSource {
    // Get layerView
    const layerView = _.findWhere(this.options.design.layerViews, { id: layerId })
    if (!layerView) {
      throw new Error(`Layer ${layerId} not found`)
    }

    return new DirectLayerDataSource({ ...this.options, layerView })
  }

  // Gets the bounds for the map. Null for whole world. Callback as { n:, s:, w:, e: }
  getBounds(
    design: MapDesign,
    filters: JsonQLFilter[],
    callback: (error: any, bounds?: { w: number; n: number; e: number; s: number } | null) => void
  ): void {
    return new MapBoundsCalculator(this.options.schema, this.options.dataSource).getBounds(design, filters, callback)
  }
}

interface DirectLayerDataSourceOptions {
  /** schema to use */
  schema: Schema

  /** general data source */
  dataSource: DataSource

  /** Layer view to display */
  layerView: MapLayerView

  /** API url to use for talking to mWater server */
  apiUrl: string

  /** client id to use for talking to mWater server */
  client?: string
}

class DirectLayerDataSource implements MapLayerDataSource {
  options: DirectLayerDataSourceOptions

  // Create map url source that uses direct jsonql maps
  // options:
  //   schema: schema to use
  //   dataSource: general data source
  //   layerView: layerView to display
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  constructor(options: DirectLayerDataSourceOptions) {
    this.options = options
  }

  /** Get the url for vector tile source with an expiry time. Only for layers of type "VectorTile"
   * @param createdAfter ISO 8601 timestamp requiring that tile soruce on server is created after specified datetime
   */
  async getVectorTileUrl(
    layerDesign: any,
    filters: JsonQLFilter[],
    createdAfter: string
  ): Promise<{ url: string; expires: string }> {
    // Create layer
    const layer = LayerFactory.createLayer(this.options.layerView.type)

    // Put in opacity of 1 as it doesn't affect source data
    const vectorTile = layer.getVectorTile(layerDesign, this.options.layerView.id, this.options.schema, filters, 1)

    const request: {
      layers: VectorTileSourceLayer[]
      /** Common table expressions of the tiles */
      ctes: VectorTileCTE[]
      createdAfter?: string
      expiresAfter: string
      /** Enforced minimum zoom level */
      minZoom?: number

      /** Enforced maximum zoom level */
      maxZoom?: number
    } = {
      layers: vectorTile.sourceLayers,
      ctes: vectorTile.ctes,
      minZoom: vectorTile.minZoom,
      maxZoom: vectorTile.maxZoom,
      createdAfter: createdAfter,
      // 12 hours
      expiresAfter: new Date(Date.now() + 1000 * 3600 * 12).toISOString()
    }

    const response = await fetch(
      this.options.apiUrl + "vector_tiles/create_token/direct?client=" + (this.options.client || ""),
      {
        method: "POST",
        body: JSON.stringify(request),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      }
    )
    if (!response.ok) {
      throw new Error("Error getting tiles")
    }
    const { token, expires } = await response.json()

    return { url: this.options.apiUrl + `vector_tiles/tiles/{z}/{x}/{y}?token=${token}`, expires }
  }

  // Get the url for the image tiles with the specified filters applied
  // Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
  getTileUrl(design: any, filters: JsonQLFilter[]) {
    // Create layer
    const layer = LayerFactory.createLayer(this.options.layerView.type)

    // Handle special cases
    if (this.options.layerView.type === "MWaterServer") {
      return this.createLegacyUrl(design, "png", filters)
    }

    // If layer has tiles url directly available
    if (layer.getLayerDefinitionType() === "TileUrl") {
      return layer.getTileUrl(design, filters)
    }

    // Get JsonQLCss
    const jsonqlCss = layer.getJsonQLCss(design, this.options.schema, filters)

    return this.createUrl("png", jsonqlCss)
  }

  // Get the url for the interactivity tiles with the specified filters applied
  // Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
  getUtfGridUrl(design: any, filters: JsonQLFilter[]) {
    // Create layer
    const layer = LayerFactory.createLayer(this.options.layerView.type)

    // Handle special cases
    if (this.options.layerView.type === "MWaterServer") {
      return this.createLegacyUrl(design, "grid.json", filters)
    }

    // If layer has tiles url directly available
    if (layer.getLayerDefinitionType() === "TileUrl") {
      return layer.getUtfGridUrl(design, filters)
    }

    // Get JsonQLCss
    const jsonqlCss = layer.getJsonQLCss(design, this.options.schema, filters)

    return this.createUrl("grid.json", jsonqlCss)
  }

  // Gets widget data source for a popup widget
  getPopupWidgetDataSource(design: any, widgetId: string) {
    // Create layer
    let type
    const layer = LayerFactory.createLayer(this.options.layerView.type)

    // Get widget
    ;({ type, design } = new BlocksLayoutManager().getWidgetTypeAndDesign(design.popup.items, widgetId))

    // Create widget
    const widget = WidgetFactory.createWidget(type)

    return new DirectWidgetDataSource({
      widget,
      schema: this.options.schema,
      dataSource: this.options.dataSource,
      apiUrl: this.options.apiUrl,
      client: this.options.client
    })
  }

  // Create query string
  createUrl(extension: string, jsonqlCss: JsonQLCssLayerDefinition) {
    const query: any = {
      type: "jsonql",
      design: compressJson(jsonqlCss)
    }

    if (this.options.client) {
      query.client = this.options.client
    }

    // Make URL change when cache expired
    const cacheExpiry = this.options.dataSource.getCacheExpiry()
    if (cacheExpiry) {
      query.cacheExpiry = cacheExpiry
    }

    let url = `${this.options.apiUrl}maps/tiles/{z}/{x}/{y}.${extension}?` + querystring.stringify(query)

    // Add subdomains: {s} will be substituted with "a", "b" or "c" in leaflet for api.mwater.co only.
    // Used to speed queries
    if (url.match(/^https:\/\/api\.mwater\.co\//)) {
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/")
    }

    return url
  }

  // Create query string
  createLegacyUrl(design: any, extension: string, filters: JsonQLFilter[]) {
    let where
    let url = `${this.options.apiUrl}maps/tiles/{z}/{x}/{y}.${extension}?type=${design.type}&radius=1000`

    // Add subdomains: {s} will be substituted with "a", "b" or "c" in leaflet for api.mwater.co only.
    // Used to speed queries
    if (url.match(/^https:\/\/api\.mwater\.co\//)) {
      url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/")
    }

    if (this.options.client) {
      url += `&client=${this.options.client}`
    }

    // Add where for any relevant filters
    const relevantFilters = _.where(filters, { table: design.table })

    // If any, create and
    const whereClauses = _.map(relevantFilters, (f) => injectTableAlias(f.jsonql, "main"))

    // Wrap if multiple
    if (whereClauses.length > 1) {
      where = { type: "op", op: "and", exprs: whereClauses }
    } else {
      where = whereClauses[0]
    }

    if (where) {
      url += "&where=" + encodeURIComponent(compressJson(where))
    }

    return url
  }
}
