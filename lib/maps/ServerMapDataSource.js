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
var mwater_expressions_1 = require("mwater-expressions");
var compressJson_1 = __importDefault(require("../compressJson"));
var querystring_1 = __importDefault(require("querystring"));
var jquery_1 = __importDefault(require("jquery"));
var lodash_1 = __importDefault(require("lodash"));
var LayerFactory_1 = __importDefault(require("./LayerFactory"));
/** Get map urls for map stored on server */
var ServerMapDataSource = /** @class */ (function () {
    // Create map url source that uses map design stored on server
    function ServerMapDataSource(options) {
        this.options = options;
    }
    // Gets the data source for a layer
    ServerMapDataSource.prototype.getLayerDataSource = function (layerId) {
        // Get layerView
        var layerView = lodash_1.default.findWhere(this.options.design.layerViews, { id: layerId });
        if (!layerView) {
            throw new Error("Layer not found");
        }
        return new ServerLayerDataSource(__assign(__assign({}, this.options), { layerView: layerView }));
    };
    // Gets the bounds for the map. Null for no opinion. Callback as { n:, s:, w:, e: }
    ServerMapDataSource.prototype.getBounds = function (design, filters, callback) {
        var query = {
            client: this.options.client,
            share: this.options.share,
            filters: compressJson_1.default(filters),
            rev: this.options.rev
        };
        var url = this.options.apiUrl + ("maps/" + this.options.mapId + "/bounds?") + querystring_1.default.stringify(query);
        jquery_1.default.getJSON(url, function (data) {
            return callback(null, data);
        }).fail(function (xhr) {
            console.log(xhr.responseText);
            return callback(new Error(xhr.responseText));
        });
    };
    return ServerMapDataSource;
}());
exports.default = ServerMapDataSource;
var ServerLayerDataSource = /** @class */ (function () {
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
    function ServerLayerDataSource(options) {
        this.options = options;
    }
    // Get the url for the image tiles with the specified filters applied
    // Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
    ServerLayerDataSource.prototype.getTileUrl = function (design, filters) {
        // Handle special cases
        if (this.options.layerView.type === "MWaterServer") {
            return this.createLegacyUrl(design, "png", filters);
        }
        // Create layer
        var layer = LayerFactory_1.default.createLayer(this.options.layerView.type);
        // If layer has tiles url directly available
        if (layer.getLayerDefinitionType() === "TileUrl") {
            return layer.getTileUrl(this.options.layerView.design, filters);
        }
        return this.createUrl(filters, "png");
    };
    // Get the url for the interactivity tiles with the specified filters applied
    // Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
    ServerLayerDataSource.prototype.getUtfGridUrl = function (design, filters) {
        // Handle special cases
        if (this.options.layerView.type === "MWaterServer") {
            return this.createLegacyUrl(design, "grid.json", filters);
        }
        // Create layer
        var layer = LayerFactory_1.default.createLayer(this.options.layerView.type);
        // If layer has tiles url directly available
        if (layer.getLayerDefinitionType() === "TileUrl") {
            return layer.getUtfGridUrl(this.options.layerView.design, filters);
        }
        return this.createUrl(filters, "grid.json");
    };
    /** Get the url for vector tile source with an expiry time. Only for layers of type "VectorTile"
     * @param createdAfter ISO 8601 timestamp requiring that tile source on server is created after specified datetime
     */
    ServerLayerDataSource.prototype.getVectorTileUrl = function (layerDesign, filters, createdAfter) {
        return __awaiter(this, void 0, void 0, function () {
            var qs, url, request, response, _a, token, expires;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        qs = querystring_1.default.stringify({
                            client: this.options.client,
                            share: this.options.share
                        });
                        url = this.options.apiUrl + "vector_tiles/create_token/maps/" + this.options.mapId + "/layers/" + this.options.layerView.id + "?" + qs;
                        request = {
                            createdAfter: createdAfter,
                            // 12 hours
                            expiresAfter: new Date(Date.now() + 1000 * 3600 * 12).toISOString(),
                            filters: compressJson_1.default(filters || [])
                        };
                        return [4 /*yield*/, fetch(url, {
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
                            throw new Error("Error getting tiles token");
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        _a = _b.sent(), token = _a.token, expires = _a.expires;
                        return [2 /*return*/, { url: this.options.apiUrl + ("vector_tiles/tiles/{z}/{x}/{y}?token=" + token), expires: expires }];
                }
            });
        });
    };
    // Gets widget data source for a popup widget
    ServerLayerDataSource.prototype.getPopupWidgetDataSource = function (design, widgetId) {
        return new ServerMapLayerPopupWidgetDataSource({
            apiUrl: this.options.apiUrl,
            client: this.options.client,
            share: this.options.share,
            mapId: this.options.mapId,
            rev: this.options.rev,
            layerId: this.options.layerView.id,
            popupWidgetId: widgetId
        });
    };
    ServerLayerDataSource.prototype.createUrl = function (filters, extension) {
        var query = {
            type: "maps",
            client: this.options.client,
            share: this.options.share,
            map: this.options.mapId,
            layer: this.options.layerView.id,
            filters: compressJson_1.default(filters || []),
            rev: this.options.rev
        };
        var url = this.options.apiUrl + "maps/tiles/{z}/{x}/{y}." + extension + "?" + querystring_1.default.stringify(query);
        // Add subdomains: {s} will be substituted with "a", "b" or "c" in leaflet for api.mwater.co only.
        // Used to speed queries
        if (url.match(/^https:\/\/api\.mwater\.co\//)) {
            url = url.replace(/^https:\/\/api\.mwater\.co\//, "https://{s}-api.mwater.co/");
        }
        return url;
    };
    // Create query string
    ServerLayerDataSource.prototype.createLegacyUrl = function (design, extension, filters) {
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
        if (this.options.share) {
            url += "&share=" + this.options.share;
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
    return ServerLayerDataSource;
}());
var ServerMapLayerPopupWidgetDataSource = /** @class */ (function () {
    // options:
    //   apiUrl: API url to use for talking to mWater server
    //   client: client id to use for talking to mWater server
    //   share: share id to use for talking to mWater server
    //   mapId: map id to use on server
    //   rev: revision to use to allow caching
    //   layerId: layer id to use
    //   popupWidgetId: id of popup widget
    function ServerMapLayerPopupWidgetDataSource(options) {
        this.options = options;
    }
    // Get the data that the widget needs. The widget should implement getData method (see above) to get the actual data on the server
    //  filters: array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct
    //  callback: (error, data)
    ServerMapLayerPopupWidgetDataSource.prototype.getData = function (design, filters, callback) {
        var query = {
            client: this.options.client,
            share: this.options.share,
            filters: compressJson_1.default(filters),
            rev: this.options.rev
        };
        var url = this.options.apiUrl + ("maps/" + this.options.mapId + "/layers/" + this.options.layerId + "/widgets/" + this.options.popupWidgetId + "/data?") + querystring_1.default.stringify(query);
        return jquery_1.default.getJSON(url, function (data) {
            return callback(null, data);
        }).fail(function (xhr) {
            console.log(xhr.responseText);
            return callback(new Error(xhr.responseText));
        });
    };
    // Get the url to download an image (by id from an image or imagelist column)
    // Height, if specified, is minimum height needed. May return larger image
    ServerMapLayerPopupWidgetDataSource.prototype.getImageUrl = function (imageId, height) {
        var url = this.options.apiUrl + ("images/" + imageId);
        if (height) {
            url += "?h=" + height;
        }
        return url;
    };
    return ServerMapLayerPopupWidgetDataSource;
}());
