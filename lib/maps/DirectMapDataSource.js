"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var mwater_expressions_1 = require("mwater-expressions");
var BlocksLayoutManager_1 = __importDefault(require("../layouts/blocks/BlocksLayoutManager"));
var WidgetFactory_1 = __importDefault(require("../widgets/WidgetFactory"));
var LayerFactory_1 = __importDefault(require("./LayerFactory"));
var MapBoundsCalculator_1 = __importDefault(require("./MapBoundsCalculator"));
var DirectWidgetDataSource_1 = __importDefault(require("../widgets/DirectWidgetDataSource"));
var compressJson_1 = __importDefault(require("../compressJson"));
var querystring_1 = __importDefault(require("querystring"));
var DirectMapDataSource = /** @class */ (function () {
    // Create map url source that uses direct jsonql maps
    function DirectMapDataSource(options) {
        this.options = options;
    }
    // Gets the data source for a layer
    DirectMapDataSource.prototype.getLayerDataSource = function (layerId) {
        // Get layerView
        var layerView = lodash_1.default.findWhere(this.options.design.layerViews, { id: layerId });
        if (!layerView) {
            throw new Error("Layer " + layerId + " not found");
        }
        return new DirectLayerDataSource(__assign(__assign({}, this.options), { layerView: layerView }));
    };
    // Gets the bounds for the map. Null for whole world. Callback as { n:, s:, w:, e: }
    DirectMapDataSource.prototype.getBounds = function (design, filters, callback) {
        return new MapBoundsCalculator_1.default(this.options.schema, this.options.dataSource).getBounds(design, filters, callback);
    };
    return DirectMapDataSource;
}());
exports.default = DirectMapDataSource;
var DirectLayerDataSource = /** @class */ (function () {
    // Create map url source that uses direct jsonql maps
    // options:
    //   schema: schema to use
    //   dataSource: general data source
    //   layerView: layerView to display
    //   apiUrl: API url to use for talking to mWater server
    //   client: client id to use for talking to mWater server
    function DirectLayerDataSource(options) {
        this.options = options;
    }
    /** Get the url for vector tile source with an expiry time. Only for layers of type "VectorTile"
    * @param createdAfter ISO 8601 timestamp requiring that tile soruce on server is created after specified datetime
    */
    DirectLayerDataSource.prototype.getVectorTileUrl = function (layerDesign, filters, createdAfter) {
        return __awaiter(this, void 0, void 0, function () {
            var layer, vectorTile, request, response, _a, token, expires;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        layer = LayerFactory_1.default.createLayer(this.options.layerView.type);
                        vectorTile = layer.getVectorTile(layerDesign, this.options.layerView.id, this.options.schema, filters, 1);
                        request = {
                            layers: vectorTile.sourceLayers,
                            ctes: vectorTile.ctes,
                            minZoom: vectorTile.minZoom,
                            maxZoom: vectorTile.maxZoom,
                            createdAfter: createdAfter,
                            // 12 hours
                            expiresAfter: new Date(Date.now() + 1000 * 3600 * 12).toISOString(),
                        };
                        return [4 /*yield*/, fetch(this.options.apiUrl + "vector_tiles/create_token/direct?client=" + (this.options.client || ""), {
                                method: "POST",
                                body: JSON.stringify(request),
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                }
                            })];
                    case 1:
                        response = _b.sent();
                        if (!response.ok) {
                            throw new Error("Error getting tiles");
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        _a = _b.sent(), token = _a.token, expires = _a.expires;
                        return [2 /*return*/, { url: this.options.apiUrl + ("vector_tiles/tiles/{z}/{x}/{y}?token=" + token), expires: expires }];
                }
            });
        });
    };
    // Get the url for the image tiles with the specified filters applied
    // Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
    DirectLayerDataSource.prototype.getTileUrl = function (design, filters) {
        // Create layer
        var layer = LayerFactory_1.default.createLayer(this.options.layerView.type);
        // Handle special cases
        if (this.options.layerView.type === "MWaterServer") {
            return this.createLegacyUrl(design, "png", filters);
        }
        // If layer has tiles url directly available
        if (layer.getLayerDefinitionType() === "TileUrl") {
            return layer.getTileUrl(design, filters);
        }
        // Get JsonQLCss
        var jsonqlCss = layer.getJsonQLCss(design, this.options.schema, filters);
        return this.createUrl("png", jsonqlCss);
    };
    // Get the url for the interactivity tiles with the specified filters applied
    // Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
    DirectLayerDataSource.prototype.getUtfGridUrl = function (design, filters) {
        // Create layer
        var layer = LayerFactory_1.default.createLayer(this.options.layerView.type);
        // Handle special cases
        if (this.options.layerView.type === "MWaterServer") {
            return this.createLegacyUrl(design, "grid.json", filters);
        }
        // If layer has tiles url directly available
        if (layer.getLayerDefinitionType() === "TileUrl") {
            return layer.getUtfGridUrl(design, filters);
        }
        // Get JsonQLCss
        var jsonqlCss = layer.getJsonQLCss(design, this.options.schema, filters);
        return this.createUrl("grid.json", jsonqlCss);
    };
    // Gets widget data source for a popup widget
    DirectLayerDataSource.prototype.getPopupWidgetDataSource = function (design, widgetId) {
        var _a;
        // Create layer
        var type;
        var layer = LayerFactory_1.default.createLayer(this.options.layerView.type);
        // Get widget
        (_a = new BlocksLayoutManager_1.default().getWidgetTypeAndDesign(design.popup.items, widgetId), type = _a.type, design = _a.design);
        // Create widget
        var widget = WidgetFactory_1.default.createWidget(type);
        return new DirectWidgetDataSource_1.default({
            widget: widget,
            schema: this.options.schema,
            dataSource: this.options.dataSource,
            apiUrl: this.options.apiUrl,
            client: this.options.client
        });
    };
    // Create query string
    DirectLayerDataSource.prototype.createUrl = function (extension, jsonqlCss) {
        var query = {
            type: "jsonql",
            design: compressJson_1.default(jsonqlCss)
        };
        if (this.options.client) {
            query.client = this.options.client;
        }
        // Make URL change when cache expired
        var cacheExpiry = this.options.dataSource.getCacheExpiry();
        if (cacheExpiry) {
            query.cacheExpiry = cacheExpiry;
        }
        var url = this.options.apiUrl + "maps/tiles/{z}/{x}/{y}." + extension + "?" + querystring_1.default.stringify(query);
        // Add subdomains: {s} will be substituted with "a", "b" or "c" in leaflet for api.mwater.co only.
        // Used to speed queries
        if (url.match(/^https:\/\/api\.mwater\.co\//)) {
            url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
        }
        return url;
    };
    // Create query string
    DirectLayerDataSource.prototype.createLegacyUrl = function (design, extension, filters) {
        var where;
        var url = this.options.apiUrl + "maps/tiles/{z}/{x}/{y}." + extension + "?type=" + design.type + "&radius=1000";
        // Add subdomains: {s} will be substituted with "a", "b" or "c" in leaflet for api.mwater.co only.
        // Used to speed queries
        if (url.match(/^https:\/\/api\.mwater\.co\//)) {
            url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
        }
        if (this.options.client) {
            url += "&client=" + this.options.client;
        }
        // Add where for any relevant filters
        var relevantFilters = lodash_1.default.where(filters, { table: design.table });
        // If any, create and
        var whereClauses = lodash_1.default.map(relevantFilters, function (f) { return mwater_expressions_1.injectTableAlias(f.jsonql, "main"); });
        // Wrap if multiple
        if (whereClauses.length > 1) {
            where = { type: "op", op: "and", exprs: whereClauses };
        }
        else {
            where = whereClauses[0];
        }
        if (where) {
            url += "&where=" + encodeURIComponent(compressJson_1.default(where));
        }
        return url;
    };
    return DirectLayerDataSource;
}());
