"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Responsible for laying out items, rendering widgets and holding them in a data structure that is layout manager specific */
class LayoutManager {
    /** Renders the layout as a react element */
    renderLayout(options) {
        return null;
    }
    /** Tests if dashboard has any items */
    isEmpty(items) {
        return true;
    }
    /** Gets { type, design } of a widget */
    getWidgetTypeAndDesign(items, widgetId) {
        throw new Error("Not implemented");
    }
    /** Gets all widgets in items as array of { id, type, design } */
    getAllWidgets(items) {
        return [];
    }
    static createLayoutManager(type) {
        // Default is old grid type
        type = type || "grid";
        switch (type) {
            case "grid": // Old one
                var GridLayoutManager = require("./grid/GridLayoutManager").default;
                return new GridLayoutManager();
                break;
            case "blocks": // New one
                var BlocksLayoutManager = require("./blocks/BlocksLayoutManager").default;
                return new BlocksLayoutManager();
                break;
            default:
                throw new Error(`Unknown layout manager type ${type}`);
        }
    }
    addWidget(items, widgetType, widgetDesign) {
        throw new Error("Not implemented");
    }
}
exports.default = LayoutManager;
