"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const async_1 = __importDefault(require("async"));
const LayerFactory_1 = __importDefault(require("./LayerFactory"));
const MapUtils = __importStar(require("./MapUtils"));
// Calculates map bounds given layers by unioning together
class MapBoundsCalculator {
    constructor(schema, dataSource) {
        this.schema = schema;
        this.dataSource = dataSource;
    }
    // Gets the bounds for the map. Null for whole world. Callback as { n:, s:, w:, e: }
    getBounds(design, filters, callback) {
        const allBounds = [];
        // For each layer
        return async_1.default.each(design.layerViews, (layerView, cb) => {
            if (!layerView.visible) {
                return cb(null);
            }
            // Create layer
            const layer = LayerFactory_1.default.createLayer(layerView.type);
            // Ensure that valid
            const layerDesign = layer.cleanDesign(layerView.design, this.schema);
            if (layer.validateDesign(layerDesign, this.schema)) {
                return cb(null);
            }
            // Compile map filters
            const allFilters = (filters || []).concat(MapUtils.getCompiledFilters(design, this.schema, MapUtils.getFilterableTables(design, this.schema)));
            // Get bounds, including filters from map
            return layer.getBounds(layerDesign, this.schema, this.dataSource, allFilters, (error, bounds) => {
                if (error) {
                    return cb(error);
                }
                if (bounds) {
                    allBounds.push(bounds);
                }
                return cb(null);
            });
        }, (error) => {
            if (error) {
                return callback(error);
            }
            // Union bounds
            if (allBounds.length === 0) {
                return callback(null);
            }
            return callback(null, {
                n: lodash_1.default.max(allBounds, "n").n,
                e: lodash_1.default.max(allBounds, "e").e,
                s: lodash_1.default.min(allBounds, "s").s,
                w: lodash_1.default.min(allBounds, "w").w
            });
        });
    }
}
exports.default = MapBoundsCalculator;
