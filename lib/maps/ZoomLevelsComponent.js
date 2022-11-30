"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const NumberInputComponent_1 = __importDefault(require("react-library/lib/NumberInputComponent"));
// Zoom level min and max control
class ZoomLevelsComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: false
        };
    }
    render() {
        if (!this.state.expanded) {
            return R("div", null, R("a", { className: "btn btn-link btn-sm", onClick: () => this.setState({ expanded: true }) }, "Zoom level options..."));
        }
        return R("div", { className: "mb-3" }, R("label", { className: "text-muted" }, "Zoom level options"), R("div", { key: "min" }, R("span", { className: "text-muted" }, "Minimum Zoom Level:"), " ", R(NumberInputComponent_1.default, {
            small: true,
            style: { display: "inline-block" },
            placeholder: "None",
            value: this.props.design.minZoom,
            onChange: (v) => this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, { minZoom: v }))
        })), R("div", { key: "max" }, R("span", { className: "text-muted" }, "Maximum Zoom Level: "), " ", R(NumberInputComponent_1.default, {
            small: true,
            style: { display: "inline-block" },
            placeholder: "None",
            value: this.props.design.maxZoom,
            onChange: (v) => this.props.onDesignChange(lodash_1.default.extend({}, this.props.design, { maxZoom: v }))
        })));
    }
}
exports.default = ZoomLevelsComponent;
