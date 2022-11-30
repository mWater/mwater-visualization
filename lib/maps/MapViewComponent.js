"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapViewComponent = void 0;
const react_1 = __importDefault(require("react"));
const VectorMapViewComponent_1 = require("./VectorMapViewComponent");
const RasterMapViewComponent_1 = __importDefault(require("./RasterMapViewComponent"));
const vectorMaps_1 = require("./vectorMaps");
/** Component that displays just the map */
function MapViewComponent(props) {
    if ((0, vectorMaps_1.areVectorMapsEnabled)()) {
        return react_1.default.createElement(VectorMapViewComponent_1.VectorMapViewComponent, Object.assign({}, props));
    }
    else {
        return react_1.default.createElement(RasterMapViewComponent_1.default, Object.assign({}, props));
    }
}
exports.MapViewComponent = MapViewComponent;
