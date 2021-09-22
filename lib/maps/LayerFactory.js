"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MWaterServerLayer_1 = __importDefault(require("./MWaterServerLayer"));
const MarkersLayer_1 = __importDefault(require("./MarkersLayer"));
const BufferLayer_1 = __importDefault(require("./BufferLayer"));
const ChoroplethLayer_1 = __importDefault(require("./ChoroplethLayer"));
const ClusterLayer_1 = __importDefault(require("./ClusterLayer"));
const TileUrlLayer_1 = __importDefault(require("./TileUrlLayer"));
const SwitchableTileUrlLayer_1 = __importDefault(require("./SwitchableTileUrlLayer"));
const GridLayer_1 = __importDefault(require("./GridLayer"));
/** Creates a layer */
class LayerFactory {
    static createLayer(type) {
        switch (type) {
            case "MWaterServer":
                return new MWaterServerLayer_1.default();
                break;
            case "Markers":
                return new MarkersLayer_1.default();
                break;
            case "Buffer":
                return new BufferLayer_1.default();
                break;
            // Uses a legacy type name
            case "AdminChoropleth":
                return new ChoroplethLayer_1.default();
                break;
            case "Cluster":
                return new ClusterLayer_1.default();
                break;
            case "TileUrl":
                return new TileUrlLayer_1.default();
                break;
            case "SwitchableTileUrl":
                return new SwitchableTileUrlLayer_1.default();
                break;
            case "Grid":
                return new GridLayer_1.default();
                break;
        }
        throw new Error(`Unknown type ${type}`);
    }
}
exports.default = LayerFactory;
