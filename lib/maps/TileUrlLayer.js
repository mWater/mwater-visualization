"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const Layer_1 = __importDefault(require("./Layer"));
/*
Layer that is a custom Leaflet-style url tile layer
Design is:
  tileUrl: Url with {s}, {z}, {x}, {y}
  minZoom: optional min zoom level
  maxZoom: optional max zoom level
  readonly: if true, hides url and prevents editing
*/
class TileUrlLayer extends Layer_1.default {
    // Gets the type of layer definition ("JsonQLCss"/"TileUrl")
    getLayerDefinitionType() {
        return "TileUrl";
    }
    // Gets the tile url for definition type "TileUrl"
    getTileUrl(design, filters) {
        return design.tileUrl;
    }
    // Gets the utf grid url for definition type "TileUrl"
    getUtfGridUrl(design, filters) {
        return null;
    }
    // Get min and max zoom levels
    getMinZoom(design) {
        return design.minZoom;
    }
    getMaxZoom(design) {
        return design.maxZoom;
    }
    // True if layer can be edited
    isEditable() {
        return true;
    }
    // True if layer is incomplete (e.g. brand new) and should be editable immediately
    isIncomplete(design, schema) {
        return this.validateDesign(this.cleanDesign(design, schema), schema) != null;
    }
    // Creates a design element with specified options.
    // Design should be cleaned on the way in and on way out.
    // options:
    //   design: design of layer
    //   schema: schema to use
    //   dataSource: data source to use
    //   onDesignChange: function called when design changes
    createDesignerElement(options) {
        return R(TileUrlLayerDesignerComponent, { design: options.design, onDesignChange: options.onDesignChange });
    }
    // Returns a cleaned design
    cleanDesign(design, schema) {
        return design;
    }
    // Validates design. Null if ok, message otherwise
    validateDesign(design, schema) {
        if (!design.tileUrl) {
            return "Missing Url";
        }
        return null;
    }
}
exports.default = TileUrlLayer;
class TileUrlLayerDesignerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleTileUrlChange = (ev) => {
            return this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, { tileUrl: ev.target.value }));
        };
    }
    render() {
        // Readonly is non-editable and shows only description
        if (this.props.design.readonly) {
            return null;
        }
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, "Url (containing {z}, {x} and {y})"), R("input", {
            type: "text",
            className: "form-control",
            value: this.props.design.tileUrl || "",
            onChange: this.handleTileUrlChange
        }));
    }
}
