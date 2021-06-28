"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
// Responsible for laying out items, rendering widgets and holding them in a data structure that is layout manager specific
let LayoutManager;
exports.default = LayoutManager = class LayoutManager {
    // Renders the layout as a react element
    // options:
    //  width: width of layout
    //  items: opaque items object that layout manager understands
    //  onItemsChange: Called when items changes
    //  renderWidget: called with ({ id:, type:, design:, onDesignChange:, width:, height:  })
    //  style: style to use for layout. null for default
    //  layoutOptions: layout options to use
    //  disableMaps: true to disable maps
    renderLayout(options) {
        return null;
    }
    // Tests if dashboard has any items
    isEmpty(items) {
        return true;
    }
    // Gets { type, design } of a widget
    getWidgetTypeAndDesign(items, widgetId) {
        return null;
    }
    // Gets all widgets in items as array of { id, type, design }
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
        return {
            addWidget(items, widgetType, widgetDesign) {
                throw new Error("Not implemented");
            }
        };
    }
};
