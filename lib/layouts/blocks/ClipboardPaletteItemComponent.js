"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const uuid_1 = __importDefault(require("uuid"));
const DragSourceComponent = require("../DragSourceComponent")("visualization-block");
const react_dnd_1 = require("react-dnd");
// Clipboard item in a palette that has special properties
class ClipboardPaletteItemComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.createItem = () => {
            // Add unique id
            return { block: lodash_1.default.extend({}, this.props.clipboard, { id: uuid_1.default() }) };
        };
        this.handleClear = () => {
            if (confirm("Clear clipboard?")) {
                return this.props.onClipboardChange(null);
            }
        };
    }
    render() {
        let elem = this.props.connectDropTarget(R("div", {
            className: this.props.clipboard && !this.props.cantPasteMessage
                ? "mwater-visualization-palette-item"
                : "mwater-visualization-palette-item disabled",
            style: this.props.isOver ? { backgroundColor: "#2485dd" } : undefined
        }, R("div", { className: "title", key: "title" }, this.props.isOver ? R("i", { className: "fa fa-clone" }) : R("i", { className: "fa fa-clipboard" })), R("div", { className: "subtitle", key: "subtitle" }, this.props.isOver ? "Copy" : "Clipboard"), this.props.cantPasteMessage
            ? R("div", { className: "tooltiptext" }, this.props.cantPasteMessage)
            : R("div", { className: "tooltiptext" }, "Clipboard allows copying widgets for pasting on this dashboard or another dashboard. Drag a widget on to this clipboard to copy it."), this.props.clipboard
            ? R("div", { className: "clearclipboard", onClick: this.handleClear }, R("i", { className: "fa fa-trash-o" }))
            : undefined));
        if (this.props.clipboard && !this.props.cantPasteMessage) {
            elem = R(DragSourceComponent, { createDragItem: this.createItem }, elem);
        }
        return elem;
    }
}
const blockTargetSpec = {
    canDrop(props, monitor) {
        return true;
    },
    drop(props, monitor, component) {
        // Check that not from a nested one
        if (monitor.didDrop()) {
            return;
        }
        props.onClipboardChange(monitor.getItem().block);
    }
};
function collectTarget(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop()
    };
}
exports.default = lodash_1.default.flow(react_dnd_1.DropTarget("visualization-block", blockTargetSpec, collectTarget))(ClipboardPaletteItemComponent);
