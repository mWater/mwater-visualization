"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const MapLayersDesignerComponent_1 = __importDefault(require("./MapLayersDesignerComponent"));
const BaseLayerDesignerComponent_1 = __importDefault(require("./BaseLayerDesignerComponent"));
// Allows controlling readonly map
class MapControlComponent extends react_1.default.Component {
    render() {
        return R("div", { style: { padding: 5 } }, R(MapLayersDesignerComponent_1.default, {
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            design: this.props.design,
            onDesignChange: this.props.onDesignChange,
            allowEditingLayers: false
        }), R("br"), R("div", { className: "form-group" }, R("label", { className: "text-muted" }, "Map Style"), R(BaseLayerDesignerComponent_1.default, {
            design: this.props.design,
            onDesignChange: this.props.onDesignChange
        })));
    }
}
exports.default = MapControlComponent;
