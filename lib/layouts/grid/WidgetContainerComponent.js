"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const lodash_1 = __importDefault(require("lodash"));
const R = react_1.default.createElement;
const react_dnd_1 = require("react-dnd");
const DecoratedBlockComponent_1 = __importDefault(require("../DecoratedBlockComponent"));
// Render a child element as draggable, resizable block, injecting handle connectors
// to child element
class LayoutComponent extends react_1.default.Component {
    render() {
        if (this.props.canDrag) {
            return react_1.default.cloneElement(react_1.default.Children.only(this.props.children), {
                connectMoveHandle: this.props.connectMoveHandle,
                connectResizeHandle: this.props.connectResizeHandle
            });
        }
        else {
            return this.props.children;
        }
    }
}
const moveSpec = {
    beginDrag(props, monitor, component) {
        return props.dragInfo;
    },
    canDrag(props, monitor) {
        return props.canDrag;
    }
};
function moveCollect(connect, monitor) {
    return {
        connectMoveHandle: connect.dragSource()
    };
}
const MoveLayoutComponent = (0, react_dnd_1.DragSource)("block-move", moveSpec, moveCollect)(LayoutComponent);
const resizeSpec = {
    beginDrag(props, monitor, component) {
        return props.dragInfo;
    },
    canDrag(props, monitor) {
        return props.canDrag;
    }
};
function resizeCollect(connect, monitor) {
    return {
        connectResizeHandle: connect.dragSource()
    };
}
const MoveResizeLayoutComponent = (0, react_dnd_1.DragSource)("block-resize", resizeSpec, resizeCollect)(MoveLayoutComponent);
// Container contains layouts to layout. It renders widgets at the correct location.
class Container extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleRemove = (id) => {
            // Update item layouts
            const items = lodash_1.default.omit(this.props.items, id);
            return this.props.onItemsChange(items);
        };
        this.handleWidgetDesignChange = (id, widgetDesign) => {
            let { widget } = this.props.items[id];
            widget = lodash_1.default.extend({}, widget, { design: widgetDesign });
            let item = this.props.items[id];
            item = lodash_1.default.extend({}, item, { widget });
            const items = lodash_1.default.clone(this.props.items);
            items[id] = item;
            return this.props.onItemsChange(items);
        };
        // Render a particular layout. Allow visible to be false so that
        // dragged elements can retain state
        this.renderItem = (id, item, layout, visible = true) => {
            // Calculate bounds
            const bounds = this.props.layoutEngine.getLayoutBounds(layout);
            // Position absolutely
            const style = {
                position: "absolute",
                left: bounds.x,
                top: bounds.y
            };
            if (!visible) {
                style.display = "none";
            }
            // Create dragInfo which is all the info needed to drop the layout
            const dragInfo = {
                id,
                bounds,
                widget: item.widget
            };
            let elem = this.props.renderWidget({
                id,
                type: item.widget.type,
                design: item.widget.design,
                onDesignChange: this.props.onItemsChange != null ? this.handleWidgetDesignChange.bind(null, id) : undefined,
                width: bounds.width - 10,
                height: bounds.height - 10
            });
            // Render decorated if editable
            if (this.props.onItemsChange) {
                elem = react_1.default.createElement(DecoratedBlockComponent_1.default, 
                // style: { width: bounds.width, height: bounds.height }
                { onBlockRemove: this.handleRemove.bind(null, id) }, elem);
            }
            else {
                elem = R("div", { className: "mwater-visualization-block-view" }, 
                // style: { width: bounds.width, height: bounds.height },
                elem);
            }
            // Clone element, injecting width, height and enclosing in a dnd block
            return R("div", { style, key: id }, react_1.default.createElement(MoveResizeLayoutComponent, { dragInfo, canDrag: this.props.onItemsChange != null }, elem));
        };
        this.state = { moveHover: null, resizeHover: null };
    }
    setMoveHover(hoverInfo) {
        return this.setState({ moveHover: hoverInfo });
    }
    setResizeHover(hoverInfo) {
        return this.setState({ resizeHover: hoverInfo });
    }
    dropLayout(id, droppedRect, widget) {
        // Stop hover
        this.setState({ moveHover: null, resizeHover: null });
        // Convert rect to layout
        const droppedLayout = this.props.layoutEngine.rectToLayout(droppedRect);
        // Insert dropped layout
        let items = lodash_1.default.clone(this.props.items);
        items[id] = { layout: droppedLayout, widget };
        let layouts = {};
        for (id in items) {
            const item = items[id];
            layouts[id] = item.layout;
        }
        // Perform layout
        layouts = this.props.layoutEngine.performLayout(layouts, id);
        // Update item layouts
        items = lodash_1.default.mapValues(items, (item, id) => {
            return lodash_1.default.extend({}, item, { layout: layouts[id] });
        });
        return this.props.onItemsChange(items);
    }
    // Called when a block is dropped
    dropMoveLayout(dropInfo) {
        // Get rectangle of dropped block
        const droppedRect = {
            x: dropInfo.x,
            y: dropInfo.y,
            width: dropInfo.dragInfo.bounds.width,
            height: dropInfo.dragInfo.bounds.height
        };
        return this.dropLayout(dropInfo.dragInfo.id, droppedRect, dropInfo.dragInfo.widget);
    }
    dropResizeLayout(dropInfo) {
        // Get rectangle of hovered block
        const droppedRect = {
            x: dropInfo.dragInfo.bounds.x,
            y: dropInfo.dragInfo.bounds.y,
            width: dropInfo.width,
            height: dropInfo.height
        };
        return this.dropLayout(dropInfo.dragInfo.id, droppedRect, dropInfo.dragInfo.widget);
    }
    componentWillReceiveProps(nextProps) {
        // Reset hover if not over
        if (!nextProps.isOver && (this.state.moveHover || this.state.resizeHover)) {
            // Defer to prevent "Cannot dispatch in the middle of a dispatch." error
            lodash_1.default.defer(() => {
                this.setState({ moveHover: null, resizeHover: null });
            });
        }
    }
    renderPlaceholder(bounds) {
        return R("div", {
            key: "placeholder",
            style: {
                position: "absolute",
                left: bounds.x,
                top: bounds.y,
                width: bounds.width,
                height: bounds.height,
                border: "dashed 3px #AAA",
                borderRadius: 5,
                padding: 5
            }
        });
    }
    // Calculate a lookup of layouts incorporating hover info
    calculateLayouts(props, state) {
        // Get hovered block if present
        let hoveredRect, id;
        let hoveredDragInfo = null;
        let hoveredLayout = null; // Layout of hovered block
        if (state.moveHover) {
            hoveredDragInfo = state.moveHover.dragInfo;
            hoveredRect = {
                x: state.moveHover.x,
                y: state.moveHover.y,
                width: state.moveHover.dragInfo.bounds.width,
                height: state.moveHover.dragInfo.bounds.height
            };
            hoveredLayout = props.layoutEngine.rectToLayout(hoveredRect);
        }
        if (state.resizeHover) {
            hoveredDragInfo = state.resizeHover.dragInfo;
            hoveredRect = {
                x: state.resizeHover.dragInfo.bounds.x,
                y: state.resizeHover.dragInfo.bounds.y,
                width: state.resizeHover.width,
                height: state.resizeHover.height
            };
            hoveredLayout = props.layoutEngine.rectToLayout(hoveredRect);
        }
        let layouts = {};
        for (id in props.items) {
            const item = props.items[id];
            layouts[id] = item.layout;
        }
        // Add hovered layout
        if (hoveredDragInfo) {
            layouts[hoveredDragInfo.id] = hoveredLayout;
        }
        // Perform layout
        layouts = props.layoutEngine.performLayout(layouts, hoveredDragInfo ? hoveredDragInfo.id : undefined);
        return layouts;
    }
    renderItems(items) {
        let id;
        const layouts = this.calculateLayouts(this.props, this.state);
        const renderElems = [];
        const hover = this.state.moveHover || this.state.resizeHover;
        // Render blocks in their adjusted position
        const ids = [];
        for (id in items) {
            ids.push(id);
        }
        if (hover && !ids.includes(hover.dragInfo.id)) {
            ids.push(hover.dragInfo.id);
        }
        for (id of lodash_1.default.sortBy(ids)) {
            const item = items[id];
            if (!hover || id !== hover.dragInfo.id) {
                renderElems.push(this.renderItem(id, item, layouts[id]));
            }
            else {
                // Render it anyway so that its state is retained
                if (item) {
                    renderElems.push(this.renderItem(id, item, layouts[id], false));
                }
                renderElems.push(this.renderPlaceholder(this.props.layoutEngine.getLayoutBounds(layouts[id])));
            }
        }
        return renderElems;
    }
    // This gets called 100s of times when dragging
    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.width !== nextProps.width) {
            return true;
        }
        if (this.props.layoutEngine !== nextProps.layoutEngine) {
            return true;
        }
        const layouts = this.calculateLayouts(this.props, this.state);
        const nextLayouts = this.calculateLayouts(nextProps, nextState);
        if (!lodash_1.default.isEqual(layouts, nextLayouts)) {
            return true;
        }
        return false;
    }
    render() {
        // Determine height using layout engine
        const style = {
            width: this.props.width,
            height: "100%",
            position: "relative"
        };
        // Connect as a drop target
        return this.props.connectDropTarget(R("div", { style }, this.renderItems(this.props.items)));
    }
}
const targetSpec = {
    drop(props, monitor, component) {
        if (monitor.getItemType() === "block-move") {
            const rect = react_dom_1.default.findDOMNode(component).getBoundingClientRect();
            component.dropMoveLayout({
                dragInfo: monitor.getItem(),
                x: monitor.getClientOffset().x -
                    (monitor.getInitialClientOffset().x - monitor.getInitialSourceClientOffset().x) -
                    rect.left,
                y: monitor.getClientOffset().y -
                    (monitor.getInitialClientOffset().y - monitor.getInitialSourceClientOffset().y) -
                    rect.top
            });
        }
        if (monitor.getItemType() === "block-resize") {
            component.dropResizeLayout({
                dragInfo: monitor.getItem(),
                width: monitor.getItem().bounds.width + monitor.getDifferenceFromInitialOffset().x,
                height: monitor.getItem().bounds.height + monitor.getDifferenceFromInitialOffset().y
            });
        }
    },
    hover(props, monitor, component) {
        if (monitor.getItemType() === "block-move") {
            const rect = react_dom_1.default.findDOMNode(component).getBoundingClientRect();
            component.setMoveHover({
                dragInfo: monitor.getItem(),
                x: monitor.getClientOffset().x -
                    (monitor.getInitialClientOffset().x - monitor.getInitialSourceClientOffset().x) -
                    rect.left,
                y: monitor.getClientOffset().y -
                    (monitor.getInitialClientOffset().y - monitor.getInitialSourceClientOffset().y) -
                    rect.top
            });
        }
        if (monitor.getItemType() === "block-resize") {
            component.setResizeHover({
                dragInfo: monitor.getItem(),
                width: monitor.getItem().bounds.width + monitor.getDifferenceFromInitialOffset().x,
                height: monitor.getItem().bounds.height + monitor.getDifferenceFromInitialOffset().y
            });
        }
    }
};
function targetCollect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        clientOffset: monitor.getClientOffset()
    };
}
exports.default = (0, react_dnd_1.DropTarget)(["block-move", "block-resize"], targetSpec, targetCollect)(Container);
