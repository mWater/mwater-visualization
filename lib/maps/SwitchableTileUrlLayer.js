"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Layer_1 = __importDefault(require("./Layer"));
const react_1 = __importDefault(require("react"));
const dompurify_1 = __importDefault(require("dompurify"));
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
        const option = design.options.find(d => d.id === design.activeOption);
        if (!option) {
            return null;
        }
        return option.tileUrl || null;
    }
    /** Gets the utf grid url for definition type "TileUrl" */
    getUtfGridUrl(design, filters) {
        // Find active option
        const option = design.options.find(d => d.id === design.activeOption);
        if (!option) {
            return null;
        }
        return option.utfGridUrl || null;
    }
    getLegend(design, schema, name, dataSource, locale, filters) {
        // Find active option
        const option = design.options.find(d => d.id === design.activeOption);
        if (!option || !option.legendUrl) {
            return null;
        }
        return react_1.default.createElement(HtmlUrlLegend, { url: option.legendUrl, name: name });
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
        const SwitchableTileUrlLayerDesigner = require('./SwitchableTileUrlLayerDesigner').default;
        return react_1.default.createElement(SwitchableTileUrlLayerDesigner, {
            design: options.design,
            onDesignChange: (design) => {
                return options.onDesignChange(design);
            }
        });
    }
}
exports.default = SwitchableTileUrlLayer;
/** Loads a html legend and sanitizes it from a url */
class HtmlUrlLegend extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            html: ""
        };
    }
    componentDidMount() {
        this.loadLegend();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.url !== this.props.url) {
            this.loadLegend();
        }
    }
    loadLegend() {
        const url = this.props.url.replace(/\{name\}/, encodeURIComponent(this.props.name));
        window.fetch(url)
            .then(response => response.text())
            .then(html => {
            const safeHtml = dompurify_1.default.sanitize(html);
            this.setState({ html: safeHtml });
        });
    }
    render() {
        return react_1.default.createElement("div", { dangerouslySetInnerHTML: { __html: this.state.html } });
    }
}
