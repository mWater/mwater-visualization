"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const react_select_1 = __importDefault(require("react-select"));
const mapSymbols_1 = require("./mapSymbols");
// Allows selecting of map marker symbol
class MarkerSymbolSelectComponent extends react_1.default.Component {
    render() {
        // Create options
        const options = mapSymbols_1.mapSymbols;
        const optionRenderer = (option) => R("span", null, R("i", { className: `fa fa-${option.value.substr(13)}` }), // Trim "font-awesome/"
        ` ${option.label}`);
        return R("div", { className: "form-group" }, R("label", { className: "text-muted" }, R("span", { className: "fa fa-star" }), " ", "Symbol"), R(react_select_1.default, {
            placeholder: "Circle",
            value: lodash_1.default.findWhere(options, { value: this.props.symbol }) || null,
            options,
            formatOptionLabel: optionRenderer,
            isClearable: true,
            onChange: (opt) => this.props.onChange((opt === null || opt === void 0 ? void 0 : opt.value) || null)
        }));
    }
}
exports.default = MarkerSymbolSelectComponent;
