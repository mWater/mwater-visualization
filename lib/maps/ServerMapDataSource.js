"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mwater_expressions_1 = require("mwater-expressions");
const compressJson_1 = __importDefault(require("../compressJson"));
const querystring_1 = __importDefault(require("querystring"));
const jquery_1 = __importDefault(require("jquery"));
const lodash_1 = __importDefault(require("lodash"));
const LayerFactory_1 = __importDefault(require("./LayerFactory"));
/** Get map urls for map stored on server */
class ServerMapDataSource {
    // Create map url source that uses map design stored on server
    constructor(options) {
        this.options = options;
    }
    // Gets the data source for a layer
    getLayerDataSource(layerId) {
        // Get layerView
        const layerView = lodash_1.default.findWhere(this.options.design.layerViews, { id: layerId });
        if (!layerView) {
            throw new Error("Layer not found");
        }
        return new ServerLayerDataSource(Object.assign(Object.assign({}, this.options), { layerView }));
    }
    // Gets the bounds for the map. Null for no opinion. Callback as { n:, s:, w:, e: }
    getBounds(design, filters, callback) {
        const query = {
            client: this.options.client,
            share: this.options.share,
            filters: (0, compressJson_1.default)(filters),
            rev: this.options.rev
        };
        const url = this.options.apiUrl + `maps/${this.options.mapId}/bounds?` + querystring_1.default.stringify(query);
        jquery_1.default.getJSON(url, (data) => {
            return callback(null, data);
        }).fail((xhr) => {
            console.log(xhr.responseText);
            return callback(new Error(xhr.responseText));
        });
    }
    getQuickfiltersDataSource() {
        return new ServerQuickfilterDataSource(this.options);
    }
}
exports.default = ServerMapDataSource;
class ServerLayerDataSource {
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
    constructor(options) {
        this.options = options;
    }
    // Get the url for the image tiles with the specified filters applied
    // Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
    getTileUrl(design, filters) {
        // Handle special cases
        if (this.options.layerView.type === "MWaterServer") {
            return this.createLegacyUrl(design, "png", filters);
        }
        // Create layer
        const layer = LayerFactory_1.default.createLayer(this.options.layerView.type);
        // If layer has tiles url directly available
        if (layer.getLayerDefinitionType() === "TileUrl") {
            return layer.getTileUrl(this.options.layerView.design, filters);
        }
        return this.createUrl(filters, "png");
    }
    // Get the url for the interactivity tiles with the specified filters applied
    // Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
    getUtfGridUrl(design, filters) {
        // Handle special cases
        if (this.options.layerView.type === "MWaterServer") {
            return this.createLegacyUrl(design, "grid.json", filters);
        }
        // Create layer
        const layer = LayerFactory_1.default.createLayer(this.options.layerView.type);
        // If layer has tiles url directly available
        if (layer.getLayerDefinitionType() === "TileUrl") {
            return layer.getUtfGridUrl(this.options.layerView.design, filters);
        }
        return this.createUrl(filters, "grid.json");
    }
    /** Get the url for vector tile source with an expiry time. Only for layers of type "VectorTile"
     * @param createdAfter ISO 8601 timestamp requiring that tile source on server is created after specified datetime
     */
    getVectorTileUrl(layerDesign, filters, createdAfter) {
        return __awaiter(this, void 0, void 0, function* () {
            const qs = querystring_1.default.stringify({
                client: this.options.client,
                share: this.options.share
            });
            const url = `${this.options.apiUrl}vector_tiles/create_token/maps/${this.options.mapId}/layers/${this.options.layerView.id}?${qs}`;
            const request = {
                createdAfter: createdAfter,
                // 12 hours
                expiresAfter: new Date(Date.now() + 1000 * 3600 * 12).toISOString(),
                filters: (0, compressJson_1.default)(filters || [])
            };
            const response = yield fetch(url, {
                method: "POST",
                body: JSON.stringify(request),
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                throw new Error("Error getting tiles token");
            }
            const { token, expires } = yield response.json();
            return { url: this.options.apiUrl + `vector_tiles/tiles/{z}/{x}/{y}?token=${token}`, expires };
        });
    }
    // Gets widget data source for a popup widget
    getPopupWidgetDataSource(design, widgetId) {
        return new ServerMapLayerPopupWidgetDataSource({
            apiUrl: this.options.apiUrl,
            client: this.options.client,
            share: this.options.share,
            mapId: this.options.mapId,
            rev: this.options.rev,
            layerId: this.options.layerView.id,
            popupWidgetId: widgetId
        });
    }
    createUrl(filters, extension) {
        const query = {
            type: "maps",
            client: this.options.client,
            share: this.options.share,
            map: this.options.mapId,
            layer: this.options.layerView.id,
            filters: (0, compressJson_1.default)(filters || []),
            rev: this.options.rev
        };
        let url = `${this.options.apiUrl}maps/tiles/{z}/{x}/{y}.${extension}?` + querystring_1.default.stringify(query);
        // Add subdomains: {s} will be substituted with "a", "b" or "c" in leaflet for api.mwater.co only.
        // Used to speed queries
        if (url.match(/^https:\/\/api\.mwater\.co\//)) {
            url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
        }
        return url;
    }
    // Create query string
    createLegacyUrl(design, extension, filters) {
        let where;
        let url = `${this.options.apiUrl}maps/tiles/{z}/{x}/{y}.${extension}?type=${design.type}&radius=1000`;
        // Add subdomains: {s} will be substituted with "a", "b" or "c" in leaflet for api.mwater.co only.
        // Used to speed queries
        if (url.match(/^https:\/\/api\.mwater\.co\//)) {
            url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
        }
        if (this.options.client) {
            url += `&client=${this.options.client}`;
        }
        if (this.options.share) {
            url += `&share=${this.options.share}`;
        }
        // Add where for any relevant filters
        const relevantFilters = lodash_1.default.where(filters, { table: design.table });
        // If any, create and
        const whereClauses = lodash_1.default.map(relevantFilters, (f) => (0, mwater_expressions_1.injectTableAlias)(f.jsonql, "main"));
        // Wrap if multiple
        if (whereClauses.length > 1) {
            where = { type: "op", op: "and", exprs: whereClauses };
        }
        else {
            where = whereClauses[0];
        }
        if (where) {
            url += "&where=" + encodeURIComponent((0, compressJson_1.default)(where));
        }
        return url;
    }
}
class ServerMapLayerPopupWidgetDataSource {
    // options:
    //   apiUrl: API url to use for talking to mWater server
    //   client: client id to use for talking to mWater server
    //   share: share id to use for talking to mWater server
    //   mapId: map id to use on server
    //   rev: revision to use to allow caching
    //   layerId: layer id to use
    //   popupWidgetId: id of popup widget
    constructor(options) {
        this.options = options;
    }
    // Get the data that the widget needs. The widget should implement getData method (see above) to get the actual data on the server
    //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    //  callback: (error, data)
    getData(design, filters, callback) {
        const query = {
            client: this.options.client,
            share: this.options.share,
            filters: (0, compressJson_1.default)(filters),
            rev: this.options.rev
        };
        const url = this.options.apiUrl +
            `maps/${this.options.mapId}/layers/${this.options.layerId}/widgets/${this.options.popupWidgetId}/data?` +
            querystring_1.default.stringify(query);
        return jquery_1.default.getJSON(url, (data) => {
            return callback(null, data);
        }).fail((xhr) => {
            console.log(xhr.responseText);
            return callback(new Error(xhr.responseText));
        });
    }
    // Get the url to download an image (by id from an image or imagelist column)
    // Height, if specified, is minimum height needed. May return larger image
    getImageUrl(imageId, height) {
        let url = this.options.apiUrl + `images/${imageId}`;
        if (height) {
            url += `?h=${height}`;
        }
        return url;
    }
}
class ServerQuickfilterDataSource {
    // options:
    //   apiUrl: API url to use for talking to mWater server
    //   client: client id to use for talking to mWater server
    //   share: share id to use for talking to mWater server
    //   dashboardId: dashboard id to use on server
    //   dataSource: data source that is used for determining cache expiry
    //   rev: revision to use to allow caching
    constructor(options) {
        this.options = options;
    }
    // Gets the values of the quickfilter at index
    getValues(index, expr, filters, offset, limit, callback) {
        const query = {
            client: this.options.client,
            share: this.options.share,
            filters: (0, compressJson_1.default)(filters),
            offset,
            limit,
            rev: this.options.rev
        };
        const url = this.options.apiUrl +
            `maps/${this.options.mapId}/quickfilters/${index}/values?` +
            querystring_1.default.stringify(query);
        const headers = {};
        const cacheExpiry = this.options.dataSource.getCacheExpiry();
        if (cacheExpiry) {
            const seconds = Math.floor((new Date().getTime() - cacheExpiry) / 1000);
            headers["Cache-Control"] = `max-age=${seconds}`;
        }
        jquery_1.default.ajax({
            dataType: "json",
            method: "GET",
            url,
            headers
        })
            .done((data) => {
            return callback(null, data);
        })
            .fail((xhr) => {
            console.log(xhr.responseText);
            return callback(new Error(xhr.responseText));
        });
    }
}
