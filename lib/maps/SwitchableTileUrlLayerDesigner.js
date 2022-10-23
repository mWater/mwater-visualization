"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const immer_1 = require("immer");
const bootstrap_1 = require("react-library/lib/bootstrap");
/** Designer for a switchable tile url layer */
class SwitchableTileUrlLayerDesigner extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (activeOption) => {
            this.props.onDesignChange(Object.assign(Object.assign({}, this.props.design), { activeOption: activeOption }));
        };
    }
    update(mutation) {
        this.props.onDesignChange((0, immer_1.produce)(this.props.design, mutation));
    }
    render() {
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("div", { className: "text-muted", style: { paddingBottom: 5 } }, this.props.design.note),
            this.props.design.options.map((opt) => {
                return (react_1.default.createElement(bootstrap_1.Radio, { key: opt.id, value: this.props.design.activeOption, radioValue: opt.id, onChange: this.handleChange, inline: false }, opt.name));
            })));
    }
}
exports.default = SwitchableTileUrlLayerDesigner;
