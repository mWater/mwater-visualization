"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_dnd_1 = require("react-dnd");
// Draggable sample that becomes a block when dragged on
const sourceSpec = {
    beginDrag(props, monitor, component) {
        return props.createDragItem();
    }
};
function collectSource(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview()
    };
}
// Simple drag source that runs a function to get the drag item.
class DragSourceComponent extends react_1.default.Component {
    render() {
        return this.props.connectDragPreview(this.props.connectDragSource(this.props.children));
    }
}
exports.default = (type) => react_dnd_1.DragSource(type, sourceSpec, collectSource)(DragSourceComponent);
