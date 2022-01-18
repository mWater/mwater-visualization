"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Layer_1 = __importDefault(require("./Layer"));
const react_1 = __importDefault(require("react"));
const HtmlUrlLegend_1 = require("./HtmlUrlLegend");
/** Layer that has multiple tile urls that it can display. Switchable but not editable */
class SwitchableTileUrlLayer extends Layer_1.default {
    getLayerDefinitionType() {
        return "TileUrl";
    }
    getMinZoom(design) {
        return design.minZoom || null;
    }
    getMaxZoom(design) {
        return design.maxZoom || 21;
    }
    /** Gets the tile url for definition type "TileUrl" */
    getTileUrl(design, filters) {
        // Find active option
        const option = design.options.find((d) => d.id === design.activeOption);
        if (!option) {
            return null;
        }
        return option.tileUrl || null;
    }
    /** Gets the utf grid url for definition type "TileUrl" */
    getUtfGridUrl(design, filters) {
        // Find active option
        const option = design.options.find((d) => d.id === design.activeOption);
        if (!option) {
            return null;
        }
        return option.utfGridUrl || null;
    }
    getLegend(design, schema, name, dataSource, locale, filters) {
        // Find active option
        const option = design.options.find((d) => d.id === design.activeOption);
        if (!option || !option.legendUrl) {
            return null;
        }
        const url = option.legendUrl.replace(/\{name\}/, encodeURIComponent(name));
        return react_1.default.createElement(HtmlUrlLegend_1.HtmlUrlLegend, { url: url });
    }
    /** True if layer can be edited */
    isEditable() {
        return true;
    }
    // Creates a design element with specified options
    // options:
    //   design: design of layer
    //   schema: schema to use
    //   dataSource: data source to use
    //   onDesignChange: function called when design changes
    //   filters: array of filters
    createDesignerElement(options) {
        // Require here to prevent server require problems
        const SwitchableTileUrlLayerDesigner = require("./SwitchableTileUrlLayerDesigner").default;
        return react_1.default.createElement(SwitchableTileUrlLayerDesigner, {
            design: options.design,
            onDesignChange: (design) => {
                return options.onDesignChange(design);
            }
        });
    }
}
exports.default = SwitchableTileUrlLayer;
