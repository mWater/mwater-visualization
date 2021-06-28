"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const rc_slider_1 = __importDefault(require("rc-slider"));
const PopoverHelpComponent_1 = __importDefault(require("react-library/lib/PopoverHelpComponent"));
// Designer for config
class BaseLayerDesignerComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleBaseLayerChange = (baseLayer) => {
            return this.updateDesign({ baseLayer });
        };
        this.handleOpacityChange = (newValue) => {
            return this.updateDesign({ baseLayerOpacity: newValue / 100 });
        };
    }
    // Updates design with the specified changes
    updateDesign(changes) {
        const design = lodash_1.default.extend({}, this.props.design, changes);
        return this.props.onDesignChange(design);
    }
    renderBaseLayer(id, name) {
        let className = "mwater-visualization-layer";
        if (id === this.props.design.baseLayer) {
            className += " checked";
        }
        return R("div", {
            key: id,
            className,
            style: { display: "inline-block" },
            onClick: this.handleBaseLayerChange.bind(null, id)
        }, name);
    }
    renderOpacityControl() {
        let opacity;
        if (this.props.design.baseLayerOpacity != null) {
            opacity = this.props.design.baseLayerOpacity;
        }
        else {
            opacity = 1;
        }
        return R("div", { className: "form-group", style: { paddingTop: 10 } }, R("label", { className: "text-muted" }, R("span", null, `Opacity: ${Math.round(opacity * 100)}%`)), R("div", { style: { padding: "10px" } }, react_1.default.createElement(rc_slider_1.default, {
            min: 0,
            max: 100,
            step: 1,
            tipTransitionName: "rc-slider-tooltip-zoom-down",
            value: opacity * 100,
            onChange: this.handleOpacityChange
        })));
    }
    render() {
        return R("div", { className: "form-group" }, R("label", { className: "text-muted" }, "Background Map"), R("div", { style: { marginLeft: 10 } }, R("div", null, this.renderBaseLayer("cartodb_positron", "Light"), this.renderBaseLayer("cartodb_dark_matter", "Dark"), this.renderBaseLayer("bing_road", "Roads"), this.renderBaseLayer("bing_aerial", "Satellite"), this.renderBaseLayer("blank", "Blank"), " ", R(PopoverHelpComponent_1.default, { placement: "bottom" }, "Blank map backgrounds work best with chloropleth map layers")), this.renderOpacityControl()));
    }
}
exports.default = BaseLayerDesignerComponent;
