"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const LayerFactory_1 = __importDefault(require("./LayerFactory"));
// Displays legends
function LegendComponent(props) {
    const legendItems = lodash_1.default.compact(lodash_1.default.map(props.layerViews, (layerView) => {
        // Ignore if legend hidden
        if (layerView.hideLegend) {
            return;
        }
        // Create layer
        const layer = LayerFactory_1.default.createLayer(layerView.type);
        const design = layer.cleanDesign(layerView.design, props.schema);
        // Ignore if invalid
        if (layer.validateDesign(design, props.schema)) {
            return null;
        }
        // Ignore if not visible
        if (!layerView.visible) {
            return null;
        }
        // Ignore if zoom out of range
        // Disabled as of https://github.com/mWater/mwater-portal/issues/1593
        // const minZoom = layer.getMinZoom(design)
        // const maxZoom = layer.getMaxZoom(design)
        // if (minZoom != null && props.zoom != null && props.zoom < minZoom) {
        //   return null
        // }
        // if (maxZoom != null && props.zoom != null && props.zoom > maxZoom) {
        //   return null
        // }
        return {
            key: layerView.id,
            legend: layer.getLegend(design, props.schema, layerView.name, props.dataSource, props.locale, props.filters)
        };
    }));
    if (legendItems.length === 0) {
        return null;
    }
    const legendStyle = {
        padding: 7,
        background: "rgba(255,255,255,0.8)",
        boxShadow: "0 0 15px rgba(0,0,0,0.2)",
        borderRadius: 5,
        position: "absolute",
        right: 10,
        bottom: 35,
        maxHeight: "85%",
        overflowY: "auto",
        zIndex: 1000,
        fontSize: 12
    };
    const hideStyle = {
        position: "absolute",
        bottom: 34,
        right: 11,
        zIndex: 1001,
        fontSize: 10,
        color: "#337ab7",
        cursor: "pointer"
    };
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("div", { style: legendStyle }, lodash_1.default.map(legendItems, (item, i) => {
            return [react_1.default.createElement("div", { key: item.key }, item.legend)];
        })),
        react_1.default.createElement("div", { key: "hide", style: hideStyle, onClick: props.onHide },
            react_1.default.createElement("i", { className: "fa fa-angle-double-right" }))));
}
exports.default = LegendComponent;
