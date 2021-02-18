import _ from 'lodash'
import $ from 'jquery'
import { DataSource, Expr, injectTableAlias } from "mwater-expressions"
import { JsonQLFilter } from "../JsonQLFilter"
import querystring from 'querystring'
import { QuickfiltersDataSource } from "../quickfilter/QuickfiltersDataSource"
import { MapDesign, MapLayerView } from '../maps/MapDesign'
import { MapDataSource } from '../maps/MapDataSource'
import { MapLayerDataSource } from '../maps/MapLayerDataSource'
import LayerFactory from '../maps/LayerFactory'
import { WidgetDataSource } from '../widgets/WidgetDataSource'
import compressJson from '../compressJson'

interface ServerDashboardDataSourceOptions {
  /** API url to use for talking to mWater server */
  apiUrl: string

  /** client id to use for talking to mWater server */
  client?: string

  /** share id to use for talking to mWater server */
  share?: string

  /** dashboard id to use on server */
  dashboardId: string

  /** data source that is used for determining cache expiry */
  dataSource: DataSource

  /** revision to use to allow caching */
  rev: string
}

interface ServerWidgetDataSourceOptions extends ServerDashboardDataSourceOptions {
  widgetId: string
}

interface ServerWidgetMapDataSourceOptions extends ServerDashboardDataSourceOptions {
  widgetId: string

  design: MapDesign
}

/** Uses mWater server to get widget data to allow sharing with unprivileged users */
export default class ServerDashboardDataSource {
  options: ServerDashboardDataSourceOptions

  constructor(options: ServerDashboardDataSourceOptions) {
    this.options = options
  }

  // Gets the widget data source for a specific widget
  getWidgetDataSource(widgetType: string, widgetId: string) {
    return new ServerWidgetDataSource({ ...this.options, widgetId })
  }

  getQuickfiltersDataSource() {
    return new ServerQuickfilterDataSource(this.options)
  }
}

class ServerQuickfilterDataSource implements QuickfiltersDataSource {
  options: ServerDashboardDataSourceOptions

  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  //   share: share id to use for talking to mWater server
  //   dashboardId: dashboard id to use on server
  //   dataSource: data source that is used for determining cache expiry
  //   rev: revision to use to allow caching
  constructor(options: ServerDashboardDataSourceOptions) {
    this.options = options
  }

  // Gets the values of the quickfilter at index
  getValues(index: number, expr: Expr, filters: JsonQLFilter[], offset: number, limit: number, callback: (error: any, values?: any[]) => void): void {
    const query = {
      client: this.options.client,
      share: this.options.share,
      filters: compressJson(filters),
      offset,
      limit,
      rev: this.options.rev
    }

    const url = this.options.apiUrl + `dashboards/${this.options.dashboardId}/quickfilters/${index}/values?` + querystring.stringify(query)

    const headers = {}
    const cacheExpiry = this.options.dataSource.getCacheExpiry()
    if (cacheExpiry) {
      const seconds = Math.floor((new Date().getTime() - cacheExpiry) / 1000)
      headers['Cache-Control'] = `max-age=${seconds}`
    }

    $.ajax({ 
      dataType: "json",
      method: "GET",
      url,
      headers
    }).done(data => {
      return callback(null, data)
  }).fail(xhr => {
      console.log(xhr.responseText)
      return callback(new Error(xhr.responseText))
    })
  }
}

class ServerWidgetDataSource {
  options: ServerWidgetDataSourceOptions

  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  //   share: share id to use for talking to mWater server
  //   dashboardId: dashboard id to use on server
  //   dataSource: data source that is used for determining cache expiry
  //   rev: revision to use to allow caching
  //   widgetId: widget id to use
  constructor(options: ServerWidgetDataSourceOptions) {
    this.options = options
  }

  // Get the data that the widget needs. The widget should implement getData method (see above) to get the data from the server
  //  design: design of the widget. Ignored in the case of server-side rendering
  //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  getData(design: any, filters: JsonQLFilter[], callback: (error: any, data?: any) => void) {
    const query = {
      client: this.options.client,
      share: this.options.share,
      filters: compressJson(filters),
      rev: this.options.rev
    }

    const url = this.options.apiUrl + `dashboards/${this.options.dashboardId}/widgets/${this.options.widgetId}/data?` + querystring.stringify(query)

    const headers = {}
    const cacheExpiry = this.options.dataSource.getCacheExpiry()
    if (cacheExpiry) {
      const seconds = Math.floor((new Date().getTime() - cacheExpiry) / 1000)
      headers['Cache-Control'] = `max-age=${seconds}`
    }

    return $.ajax({ 
      dataType: "json",
      method: "GET",
      url,
      headers
    }).done(data => {
      return callback(null, data)
  }).fail(xhr => {
      console.log(xhr.responseText)
      return callback(new Error(xhr.responseText))
    })
  }

  // For map widgets, the following is required
  getMapDataSource(design: any) {
    return new ServerWidgetMapDataSource({ ...this.options, design })
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

class ServerWidgetMapDataSource implements MapDataSource { 
  options: ServerWidgetMapDataSourceOptions

  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   design: design of the map widget
  //   client: client id to use for talking to mWater server
  //   share: share id to use for talking to mWater server
  //   dashboardId: dashboard id to use on server
  //   dataSource: data source that is used for determining cache expiry
  //   rev: revision to use to allow caching
  //   widgetId: widget id to use
  constructor(options: ServerWidgetMapDataSourceOptions) {
    this.options = options
  }

  // Gets the data source for a layer
  getLayerDataSource(layerId: string) {
    // Get layerView
    const layerView = _.findWhere(this.options.design.layerViews, { id: layerId })
    if (!layerView) {
      throw new Error("No such layer")
    }

    return new ServerWidgetLayerDataSource({ ...this.options, layerView })
  }

  // Gets the bounds for the map. Null for no opinion. Callback as { n:, s:, w:, e: }
  getBounds(design: MapDesign, filters: JsonQLFilter[], callback: (error: any, bounds?: { w: number, n: number, e: number, s: number } | null) => void) {
    const query = {
      client: this.options.client,
      share: this.options.share,
      filters: compressJson(filters),
      rev: this.options.rev
    }

    const url = this.options.apiUrl + `dashboards/${this.options.dashboardId}/widgets/${this.options.widgetId}/bounds?` + querystring.stringify(query)

    const headers = {}
    const cacheExpiry = this.options.dataSource.getCacheExpiry()
    if (cacheExpiry) {
      const seconds = Math.floor((new Date().getTime() - cacheExpiry) / 1000)
      headers['Cache-Control'] = `max-age=${seconds}`
    }

    $.ajax({ 
      dataType: "json",
      method: "GET",
      url,
      headers
    }).done(data => {
      return callback(null, data)
    }).fail(xhr => {
      console.log(xhr.responseText)
      return callback(new Error(xhr.responseText))
    })
  }
}

interface ServerWidgetLayerDataSourceOptions extends ServerDashboardDataSourceOptions {
  widgetId: string

  /** Layer view to use */
  layerView: MapLayerView
}

class ServerWidgetLayerDataSource implements MapLayerDataSource {
  options: ServerWidgetLayerDataSourceOptions

  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  //   share: share id to use for talking to mWater server
  //   dashboardId: dashboard id to use on server
  //   dataSource: data source that is used for determining cache expiry
  //   rev: revision to use to allow caching
  //   widgetId: widget id to use
  //   layerView: layer view of map inside widget
  constructor(options: ServerWidgetLayerDataSourceOptions) {
    this.options = options
  }
 
  // Get the url for the image tiles with the specified filters applied
  // Called with (design, filters) where design is the layer design and filters are filters to apply. Returns URL
  getTileUrl(design: any, filters: JsonQLFilter[]) { 
    // Handle special cases
    if (this.options.layerView.type === "MWaterServer") {
      return this.createLegacyUrl(this.options.layerView.design, "png", filters)
    }

    // Create layer
    const layer = LayerFactory.createLayer(this.options.layerView.type)

    // If layer has tiles url directly available
    if (layer.getLayerDefinitionType() === "TileUrl") {
      return layer.getTileUrl(this.options.layerView.design, filters)
    }

    return this.createUrl(filters, "png")
  }

  // Get the url for the interactivity tiles with the specified filters applied
  // Called with (design, filters) where design is the layer design and filters are filters to apply. Returns URL
  getUtfGridUrl(design: any, filters: JsonQLFilter[]) { 
    // Handle special cases
    if (this.options.layerView.type === "MWaterServer") {
      return this.createLegacyUrl(this.options.layerView.design, "grid.json", filters)
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
  async getVectorTileUrl(layerDesign: any, filters: JsonQLFilter[], createdAfter: string): Promise<{ url: string, expires: string }> {
    const qs = querystring.stringify({
      client: this.options.client,
      share: this.options.share
    })

    const url =  `${this.options.apiUrl}vector_tiles/create_token/dashboards/${this.options.dashboardId}/widgets/${this.options.widgetId}/layers/${this.options.layerView.id}?${qs}`

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
        'Accept': 'application/json',
        'Content-Type': 'application/json'
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
    return new ServerWidgetLayerPopupWidgetDataSource({ ...this.options, popupWidgetId: widgetId })
  }

  // Create url
  createUrl(filters: JsonQLFilter[], extension: string) {
    const query: any = {
      type: "dashboard_widget",
      client: this.options.client,
      share: this.options.share,
      dashboard: this.options.dashboardId,
      widget: this.options.widgetId,
      layer: this.options.layerView.id,
      rev: this.options.rev,
      filters: compressJson(filters || [])
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

    if (this.options.share) {
      url += `&share=${this.options.share}`
    }
      
    // Add where for any relevant filters
    const relevantFilters = _.where(filters, {table: design.table})

    // If any, create and
    const whereClauses = _.map(relevantFilters, f => injectTableAlias(f.jsonql, "main"))

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

interface ServerWidgetLayerPopupDataSourceOptions extends ServerDashboardDataSourceOptions {
  widgetId: string

  /** layer view of map inside widget */
  layerView: MapLayerView

  /** id of popup widget */
  popupWidgetId: string
}

class ServerWidgetLayerPopupWidgetDataSource implements WidgetDataSource {
  options: ServerWidgetLayerPopupDataSourceOptions

  // options:
  //   apiUrl: API url to use for talking to mWater server
  //   client: client id to use for talking to mWater server
  //   share: share id to use for talking to mWater server
  //   dashboardId: dashboard id to use on server
  //   dataSource: data source that is used for determining cache expiry
  //   rev: revision to use to allow caching
  //   widgetId: widget id to use
  //   layerView: layer view of map inside widget
  //   popupWidgetId: id of popup widget
  constructor(options: ServerWidgetLayerPopupDataSourceOptions) {
    this.options = options
  }

  // Get the data that the widget needs. The widget should implement getData method (see above) to get the actual data on the server
  //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
  //  callback: (error, data)
  getData(design: any, filters: JsonQLFilter[], callback: (error: any, data?: any) => void): void {
    const query = {
      client: this.options.client,
      share: this.options.share,
      filters: compressJson(filters),
      rev: this.options.rev
    }

    const url = this.options.apiUrl + `dashboards/${this.options.dashboardId}/widgets/${this.options.widgetId}/layers/${this.options.layerView.id}/widgets/${this.options.popupWidgetId}/data?` + querystring.stringify(query)

    const headers = {}
    const cacheExpiry = this.options.dataSource.getCacheExpiry()
    if (cacheExpiry) {
      const seconds = Math.floor((new Date().getTime() - cacheExpiry) / 1000)
      headers['Cache-Control'] = `max-age=${seconds}`
    }

    $.ajax({ 
      dataType: "json",
      method: "GET",
      url,
      headers
    }).done(data => {
      return callback(null, data)
  }).fail(xhr => {
      console.log(xhr.responseText)
      return callback(new Error(xhr.responseText))
    })
  }

  /** For map widgets, the following is required */
  getMapDataSource(design: MapDesign): MapDataSource {
    throw new Error("TODO!")
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
  