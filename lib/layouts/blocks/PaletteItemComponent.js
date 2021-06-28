"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const DragSourceComponent = require("../DragSourceComponent").default("visualization-block");
// Item in a palette that can be dragged to add a widget or other item
class PaletteItemComponent extends react_1.default.Component {
    render() {
        return R(DragSourceComponent, { createDragItem: this.props.createItem }, R("div", { className: "mwater-visualization-palette-item" }, R("div", { className: "title", key: "title" }, this.props.title), R("div", { className: "subtitle", key: "subtitle" }, this.props.subtitle)));
    }
}
exports.default = PaletteItemComponent;
