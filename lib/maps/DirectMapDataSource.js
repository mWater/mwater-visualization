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
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_1 = require("mwater-expressions");
const BlocksLayoutManager_1 = __importDefault(require("../layouts/blocks/BlocksLayoutManager"));
const WidgetFactory_1 = __importDefault(require("../widgets/WidgetFactory"));
const LayerFactory_1 = __importDefault(require("./LayerFactory"));
const MapBoundsCalculator_1 = __importDefault(require("./MapBoundsCalculator"));
const DirectWidgetDataSource_1 = __importDefault(require("../widgets/DirectWidgetDataSource"));
const compressJson_1 = __importDefault(require("../compressJson"));
const querystring_1 = __importDefault(require("querystring"));
class DirectMapDataSource {
    // Create map url source that uses direct jsonql maps
    constructor(options) {
        this.options = options;
    }
    // Gets the data source for a layer
    getLayerDataSource(layerId) {
        // Get layerView
        const layerView = lodash_1.default.findWhere(this.options.design.layerViews, { id: layerId });
        if (!layerView) {
            throw new Error(`Layer ${layerId} not found`);
        }
        return new DirectLayerDataSource(Object.assign(Object.assign({}, this.options), { layerView }));
    }
    // Gets the bounds for the map. Null for whole world. Callback as { n:, s:, w:, e: }
    getBounds(design, filters, callback) {
        return new MapBoundsCalculator_1.default(this.options.schema, this.options.dataSource).getBounds(design, filters, callback);
    }
}
exports.default = DirectMapDataSource;
class DirectLayerDataSource {
    // Create map url source that uses direct jsonql maps
    // options:
    //   schema: schema to use
    //   dataSource: general data source
    //   layerView: layerView to display
    //   apiUrl: API url to use for talking to mWater server
    //   client: client id to use for talking to mWater server
    constructor(options) {
        this.options = options;
    }
    /** Get the url for vector tile source with an expiry time. Only for layers of type "VectorTile"
     * @param createdAfter ISO 8601 timestamp requiring that tile soruce on server is created after specified datetime
     */
    getVectorTileUrl(layerDesign, filters, createdAfter) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create layer
            const layer = LayerFactory_1.default.createLayer(this.options.layerView.type);
            // Put in opacity of 1 as it doesn't affect source data
            const vectorTile = layer.getVectorTile(layerDesign, this.options.layerView.id, this.options.schema, filters, 1);
            const request = {
                layers: vectorTile.sourceLayers,
                ctes: vectorTile.ctes,
                minZoom: vectorTile.minZoom,
                maxZoom: vectorTile.maxZoom,
                createdAfter: createdAfter,
                // 12 hours
                expiresAfter: new Date(Date.now() + 1000 * 3600 * 12).toISOString()
            };
            const response = yield fetch(this.options.apiUrl + "vector_tiles/create_token/direct?client=" + (this.options.client || ""), {
                method: "POST",
                body: JSON.stringify(request),
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                throw new Error("Error getting tiles");
            }
            const { token, expires } = yield response.json();
            return { url: this.options.apiUrl + `vector_tiles/tiles/{z}/{x}/{y}?token=${token}`, expires };
        });
    }
    // Get the url for the image tiles with the specified filters applied
    // Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
    getTileUrl(design, filters) {
        // Create layer
        const layer = LayerFactory_1.default.createLayer(this.options.layerView.type);
        // Handle special cases
        if (this.options.layerView.type === "MWaterServer") {
            return this.createLegacyUrl(design, "png", filters);
        }
        // If layer has tiles url directly available
        if (layer.getLayerDefinitionType() === "TileUrl") {
            return layer.getTileUrl(design, filters);
        }
        // Get JsonQLCss
        const jsonqlCss = layer.getJsonQLCss(design, this.options.schema, filters);
        return this.createUrl("png", jsonqlCss);
    }
    // Get the url for the interactivity tiles with the specified filters applied
    // Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
    getUtfGridUrl(design, filters) {
        // Create layer
        const layer = LayerFactory_1.default.createLayer(this.options.layerView.type);
        // Handle special cases
        if (this.options.layerView.type === "MWaterServer") {
            return this.createLegacyUrl(design, "grid.json", filters);
        }
        // If layer has tiles url directly available
        if (layer.getLayerDefinitionType() === "TileUrl") {
            return layer.getUtfGridUrl(design, filters);
        }
        // Get JsonQLCss
        const jsonqlCss = layer.getJsonQLCss(design, this.options.schema, filters);
        return this.createUrl("grid.json", jsonqlCss);
    }
    // Gets widget data source for a popup widget
    getPopupWidgetDataSource(design, widgetId) {
        // Create layer
        let type;
        const layer = LayerFactory_1.default.createLayer(this.options.layerView.type);
        ({ type, design } = new BlocksLayoutManager_1.default().getWidgetTypeAndDesign(design.popup.items, widgetId));
        // Create widget
        const widget = WidgetFactory_1.default.createWidget(type);
        return new DirectWidgetDataSource_1.default({
            widget,
            schema: this.options.schema,
            dataSource: this.options.dataSource,
            apiUrl: this.options.apiUrl,
            client: this.options.client
        });
    }
    // Create query string
    createUrl(extension, jsonqlCss) {
        const query = {
            type: "jsonql",
            design: (0, compressJson_1.default)(jsonqlCss)
        };
        if (this.options.client) {
            query.client = this.options.client;
        }
        // Make URL change when cache expired
        const cacheExpiry = this.options.dataSource.getCacheExpiry();
        if (cacheExpiry) {
            query.cacheExpiry = cacheExpiry;
        }
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
