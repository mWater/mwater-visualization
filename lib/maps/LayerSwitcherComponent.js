"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayerSwitcherComponent = void 0;
var react_1 = __importDefault(require("react"));
/** Component to switch layers on a map */
function LayerSwitcherComponent(props) {
    return react_1.default.createElement("div", null,
        react_1.default.createElement("i", { className: "fas fa-layer-group" }));
}
exports.LayerSwitcherComponent = LayerSwitcherComponent;
