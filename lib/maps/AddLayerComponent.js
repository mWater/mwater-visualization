"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const uuid_1 = __importDefault(require("uuid"));
const LayerFactory_1 = __importDefault(require("./LayerFactory"));
// Dropdown to add a new layer.
// Can be overridden by context of addLayerElementFactory which is called with all props
class AddLayerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleAddLayer = (newLayer) => {
            const layerView = {
                id: (0, uuid_1.default)(),
                name: newLayer.name,
                desc: "",
                type: newLayer.type,
                visible: true,
                opacity: 1,
                design: null
            };
            // Clean design to make valid
            const layer = LayerFactory_1.default.createLayer(layerView.type);
            layerView.design = layer.cleanDesign(newLayer.design, this.props.schema);
            return this.handleAddLayerView(layerView);
        };
        this.handleAddLayerView = (layerView) => {
            // Add to list
            const layerViews = this.props.design.layerViews.slice();
            layerViews.push(layerView);
            const design = lodash_1.default.extend({}, this.props.design, { layerViews });
            return this.props.onDesignChange(design);
        };
    }
    render() {
        if (this.context.addLayerElementFactory) {
            return this.context.addLayerElementFactory(this.props);
        }
        const newLayers = [
            {
                label: "Marker Layer",
                name: "Untitled Layer",
                type: "Markers",
                design: {}
            },
            {
                label: "Radius (circles) Layer",
                name: "Untitled Layer",
                type: "Buffer",
                design: {}
            },
            {
                label: "Choropleth Layer",
                name: "Untitled Layer",
                type: "AdminChoropleth",
                design: {}
            },
            {
                label: "Cluster Layer",
                name: "Untitled Layer",
                type: "Cluster",
                design: {}
            },
            {
                label: "Grid Layer",
                name: "Untitled Layer",
                type: "Grid",
                design: {}
            },
            {
                label: "Custom Tile Url (advanced)",
                name: "Untitled Layer",
                type: "TileUrl",
                design: {}
            }
        ];
        return R("div", { style: { margin: 5 }, key: "addLayer", className: "btn-group" }, R("button", { type: "button", "data-bs-toggle": "dropdown", className: "btn btn-primary dropdown-toggle" }, R("span", { className: "fas fa-plus" }), " Add Layer"), R("ul", { className: "dropdown-menu" }, lodash_1.default.map(newLayers, (layer, i) => {
            return R("li", { key: "" + i }, R("a", { className: "dropdown-item", onClick: this.handleAddLayer.bind(null, layer) }, layer.label || layer.name));
        })));
    }
}
exports.default = AddLayerComponent;
AddLayerComponent.contextTypes = { addLayerElementFactory: prop_types_1.default.func };
