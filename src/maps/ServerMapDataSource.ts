import { DataSource, Expr, injectTableAlias, Schema } from "mwater-expressions"
import { JsonQLFilter } from "../JsonQLFilter"
import compressJson from "../compressJson"
import { MapDesign, MapLayerView } from "./MapDesign"
import querystring from "querystring"
import $ from "jquery"
import _ from "lodash"
import { MapDataSource } from "./MapDataSource"
import { MapLayerDataSource } from "./MapLayerDataSource"
import LayerFactory from "./LayerFactory"
import { WidgetDataSource } from "../widgets/WidgetDataSource"
import TileUrlLayer from "./TileUrlLayer"
import { QuickfiltersDataSource } from "../quickfilter/QuickfiltersDataSource"

interface ServerMapDataSourceOptions {
  /** schema to use */
  schema: Schema

  /** data source to use */
  dataSource: DataSource

  /** design of entire map */
  design: MapDesign

  /** share id to use for talking to mWater server */
  share?: string

  /** API url to use for talking to mWater server */
  apiUrl: string

  /** client id to use for talking to mWater server */
  client?: string

  /** map id to use on server */
  mapId: string

  /** revision to use to allow caching */
  rev: string
}

interface ServerMapLayerDataSourceOptions extends ServerMapDataSourceOptions {
  layerView: MapLayerView
}

/** Get map urls for map stored on server */
export default class ServerMapDataSource implements MapDataSource {
  options: ServerMapDataSourceOptions

  // Create map url source that uses map design stored on server
  constructor(options: ServerMapDataSourceOptions) {
    this.options = options
  }

  // Gets the data source for a layer
  getLayerDataSource(layerId: string) {
    // Get layerView
    const layerView = _.findWhere(this.options.design.layerViews, { id: layerId })
    if (!layerView) {
      throw new Error("Layer not found")
    }

    return new ServerLayerDataSource({ ...this.options, layerView })
  }

  // Gets the bounds for the map. Null for no opinion. Callback as { n:, s:, w:, e: }
  getBounds(
    design: MapDesign,
    filters: JsonQLFilter[],
    callback: (error: any, bounds?: { w: number; n: number; e: number; s: number } | null) => void
  ): void {
    const query = {
      client: this.options.client,
      share: this.options.share,
      filters: compressJson(filters),
      rev: this.options.rev
    }

    const url = this.options.apiUrl + `maps/${this.options.mapId}/bounds?` + querystring.stringify(query)

    $.getJSON(url, (data: any) => {
      return callback(null, data)
    }).fail((xhr) => {
      console.log(xhr.responseText)
      return callback(new Error(xhr.responseText))
    })
  }

  getQuickfiltersDataSource() {
    return new ServerQuickfilterDataSource(this.options)
  }
}

class ServerLayerDataSource implements MapLayerDataSource {
  options: ServerMapLayerDataSourceOptions

  // Create map url source that uses map design stored on server
  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  //   design: design of entire map
  //   schema: schema to use
  //   share: share id to use for talking to mWater server
  //   mapId: map id to use on server
  //   rev: revision to use to allow caching
  //   layerView: layer view
  constructor(options: ServerMapLayerDataSourceOptions) {
    this.options = options
  }

  // Get the url for the image tiles with the specified filters applied
  // Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
  getTileUrl(design: any, filters: JsonQLFilter[]) {
    // Handle special cases
    if (this.options.layerView.type === "MWaterServer") {
      return this.createLegacyUrl(design, "png", filters)
    }

    // Create layer
    const layer = LayerFactory.createLayer(this.options.layerView.type)

    // If layer has tiles url directly available
    if (layer.getLayerDefinitionType() === "TileUrl") {
      return (layer as TileUrlLayer).getTileUrl(this.options.layerView.design, filters)
    }

    return this.createUrl(filters, "png")
  }

  // Get the url for the interactivity tiles with the specified filters applied
  // Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
  getUtfGridUrl(design: any, filters: JsonQLFilter[]) {
    // Handle special cases
    if (this.options.layerView.type === "MWaterServer") {
      return this.createLegacyUrl(design, "grid.json", filters)
    }

    // Create layer
    const layer = LayerFactory.createLayer(this.options.layerView.type)

    // If layer has tiles url directly available
    if (layer.getLayerDefinitionType() === "TileUrl") {
      return layer.getUtfGridUrl(this.options.layerView.design, filters)
    }

    return this.createUrl(filters, "grid.json")
  }

  /** Get the url for vector tile source with an expiry time. Only for layers of type "VectorTile"
   * @param createdAfter ISO 8601 timestamp requiring that tile source on server is created after specified datetime
   */
  async getVectorTileUrl(
    layerDesign: any,
    filters: JsonQLFilter[],
    createdAfter: string
  ): Promise<{ url: string; expires: string }> {
    const qs = querystring.stringify({
      client: this.options.client,
      share: this.options.share
    })

    const url = `${this.options.apiUrl}vector_tiles/create_token/maps/${this.options.mapId}/layers/${this.options.layerView.id}?${qs}`

    const request: {
      createdAfter?: string
      expiresAfter: string
      filters: string
    } = {
      createdAfter: createdAfter,
      // 12 hours
      expiresAfter: new Date(Date.now() + 1000 * 3600 * 12).toISOString(),
      filters: compressJson(filters || [])
    }

    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })

    if (!response.ok) {
      throw new Error("Error getting tiles token")
    }
    const { token, expires } = await response.json()

    return { url: this.options.apiUrl + `vector_tiles/tiles/{z}/{x}/{y}?token=${token}`, expires }
  }

  // Gets widget data source for a popup widget
  getPopupWidgetDataSource(design: any, widgetId: string) {
    return new ServerMapLayerPopupWidgetDataSource({
      apiUrl: this.options.apiUrl,
      client: this.options.client,
      share: this.options.share,
      mapId: this.options.mapId,
      rev: this.options.rev,
      layerId: this.options.layerView.id,
      popupWidgetId: widgetId
    })
  }

  createUrl(filters: JsonQLFilter[], extension: string) {
    const query = {
      type: "maps",
      client: this.options.client,
      share: this.options.share,
      map: this.options.mapId,
      layer: this.options.layerView.id,
      filters: compressJson(filters || []),
      rev: this.options.rev
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

    if (this.options.share) {
      url += `&share=${this.options.share}`
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

interface ServerMapLayerPopupWidgetDataSourceOptions {
  /** API url to use for talking to mWater server */
  apiUrl: string

  /** client id to use for talking to mWater server */
  client?: string

  /** share id to use for talking to mWater server */
  share?: string

  /** map id to use on server */
  mapId: string

  /** revision to use to allow caching */
  rev: string

  /** Layer id to use */
  layerId: string

  /** Popup widget id to use */
  popupWidgetId: string
}

class ServerMapLayerPopupWidgetDataSource implements WidgetDataSource {
  options: ServerMapLayerPopupWidgetDataSourceOptions

  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  //   share: share id to use for talking to mWater server
  //   mapId: map id to use on server
  //   rev: revision to use to allow caching
  //   layerId: layer id to use
  //   popupWidgetId: id of popup widget
  constructor(options: ServerMapLayerPopupWidgetDataSourceOptions) {
    this.options = options
  }

  // Get the data that the widget needs. The widget should implement getData method (see above) to get the actual data on the server
  //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  //  callback: (error, data)
  getData(design: any, filters: JsonQLFilter[], callback: (error: any, data?: any) => void) {
    const query = {
      client: this.options.client,
      share: this.options.share,
      filters: compressJson(filters),
      rev: this.options.rev
    }

    const url =
      this.options.apiUrl +
      `maps/${this.options.mapId}/layers/${this.options.layerId}/widgets/${this.options.popupWidgetId}/data?` +
      querystring.stringify(query)

    return $.getJSON(url, (data) => {
      return callback(null, data)
    }).fail((xhr) => {
      console.log(xhr.responseText)
      return callback(new Error(xhr.responseText))
    })
  }

  // Get the url to download an image (by id from an image or imagelist column)
  // Height, if specified, is minimum height needed. May return larger image
  getImageUrl(imageId: string, height?: number) {
    let url = this.options.apiUrl + `images/${imageId}`
    if (height) {
      url += `?h=${height}`
    }

    return url
  }
}

class ServerQuickfilterDataSource implements QuickfiltersDataSource {
  options: ServerMapDataSourceOptions

  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  //   share: share id to use for talking to mWater server
  //   dashboardId: dashboard id to use on server
  //   dataSource: data source that is used for determining cache expiry
  //   rev: revision to use to allow caching
  constructor(options: ServerMapDataSourceOptions) {
    this.options = options
  }

  // Gets the values of the quickfilter at index
  getValues(
    index: number,
    expr: Expr,
    filters: JsonQLFilter[],
    offset: number,
    limit: number,
    callback: (error: any, values?: any[]) => void
  ): void {
    const query = {
      client: this.options.client,
      share: this.options.share,
      filters: compressJson(filters),
      offset,
      limit,
      rev: this.options.rev
    }

    const url =
      this.options.apiUrl +
      `maps/${this.options.mapId}/quickfilters/${index}/values?` +
      querystring.stringify(query)

    const headers = {}
    const cacheExpiry = this.options.dataSource.getCacheExpiry()
    if (cacheExpiry) {
      const seconds = Math.floor((new Date().getTime() - cacheExpiry) / 1000)
      headers["Cache-Control"] = `max-age=${seconds}`
    }

    $.ajax({
      dataType: "json",
      method: "GET",
      url,
      headers
    })
      .done((data) => {
        return callback(null, data)
      })
      .fail((xhr) => {
        console.log(xhr.responseText)
        return callback(new Error(xhr.responseText))
      })
  }
}

