"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Layer_1 = __importDefault(require("./Layer"));
var react_1 = __importDefault(require("react"));
var dompurify_1 = __importDefault(require("dompurify"));
/** Layer that has multiple tile urls that it can display. Switchable but not editable */
var SwitchableTileUrlLayer = /** @class */ (function (_super) {
    __extends(SwitchableTileUrlLayer, _super);
    function SwitchableTileUrlLayer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SwitchableTileUrlLayer.prototype.getLayerDefinitionType = function () {
        return "TileUrl";
    };
    /** Gets the tile url for definition type "TileUrl" */
    SwitchableTileUrlLayer.prototype.getTileUrl = function (design, filters) {
        // Find active option
        var option = design.options.find(function (d) { return d.id === design.activeOption; });
        if (!option) {
            return null;
        }
        return option.tileUrl || null;
    };
    /** Gets the utf grid url for definition type "TileUrl" */
    SwitchableTileUrlLayer.prototype.getUtfGridUrl = function (design, filters) {
        // Find active option
        var option = design.options.find(function (d) { return d.id === design.activeOption; });
        if (!option) {
            return null;
        }
        return option.utfGridUrl || null;
    };
    SwitchableTileUrlLayer.prototype.getLegend = function (design, schema, name, dataSource, filters) {
        // Find active option
        var option = design.options.find(function (d) { return d.id === design.activeOption; });
        if (!option || !option.legendUrl) {
            return null;
        }
        return react_1.default.createElement(HtmlUrlLegend, { url: option.legendUrl, name: name });
    };
    /** True if layer can be edited */
    SwitchableTileUrlLayer.prototype.isEditable = function () {
        return true;
    };
    // Creates a design element with specified options
    // options:
    //   design: design of layer
    //   schema: schema to use
    //   dataSource: data source to use
    //   onDesignChange: function called when design changes
    //   filters: array of filters
    SwitchableTileUrlLayer.prototype.createDesignerElement = function (options) {
        // Require here to prevent server require problems
        var SwitchableTileUrlLayerDesigner = require('./SwitchableTileUrlLayerDesigner').default;
        return react_1.default.createElement(SwitchableTileUrlLayerDesigner, {
            design: options.design,
            onDesignChange: function (design) {
                return options.onDesignChange(design);
            }
        });
    };
    return SwitchableTileUrlLayer;
}(Layer_1.default));
exports.default = SwitchableTileUrlLayer;
/** Loads a html legend and sanitizes it from a url */
var HtmlUrlLegend = /** @class */ (function (_super) {
    __extends(HtmlUrlLegend, _super);
    function HtmlUrlLegend(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            html: ""
        };
        return _this;
    }
    HtmlUrlLegend.prototype.componentDidMount = function () {
        this.loadLegend();
    };
    HtmlUrlLegend.prototype.componentDidUpdate = function (prevProps) {
        if (prevProps.url !== this.props.url) {
            this.loadLegend();
        }
    };
    HtmlUrlLegend.prototype.loadLegend = function () {
        var _this = this;
        var url = this.props.url.replace(/\{name\}/, encodeURIComponent(this.props.name));
        window.fetch(url)
            .then(function (response) { return response.text(); })
            .then(function (html) {
            var safeHtml = dompurify_1.default.sanitize(html);
            _this.setState({ html: safeHtml });
        });
    };
    HtmlUrlLegend.prototype.render = function () {
        return react_1.default.createElement("div", { dangerouslySetInnerHTML: { __html: this.state.html } });
    };
    return HtmlUrlLegend;
}(react_1.default.Component));
