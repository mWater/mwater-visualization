"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const uuid_1 = __importDefault(require("uuid"));
const WidgetFactory_1 = __importDefault(require("../widgets/WidgetFactory"));
// Upgrades old dashboards to new ones (grid -> blocks)
class DashboardUpgrader {
    upgrade(design) {
        // Get list of all items
        const items = lodash_1.default.clone(design.items);
        const newItems = {
            id: "root",
            type: "root",
            blocks: []
        };
        function convertBlock(id, item) {
            const widget = WidgetFactory_1.default.createWidget(item.widget.type);
            const block = {
                type: "widget",
                widgetType: item.widget.type,
                design: item.widget.design,
                id
            };
            if (!widget.isAutoHeight()) {
                block.aspectRatio = item.layout.w / item.layout.h;
            }
            return block;
        }
        // Scan horizontally
        let y = 0;
        while (lodash_1.default.keys(items).length > 0) {
            var id;
            let lineItems = [];
            for (id in items) {
                const item = items[id];
                if (item.layout.y <= y && item.layout.y + item.layout.h > y) {
                    lineItems.push(id);
                }
            }
            // Sort by x
            lineItems = lodash_1.default.sortBy(lineItems, (id) => items[id].layout.x);
            // Convert
            if (lineItems.length > 1) {
                newItems.blocks.push({
                    id: (0, uuid_1.default)(),
                    type: "horizontal",
                    blocks: lodash_1.default.map(lineItems, (li) => convertBlock(li, items[li]))
                });
                for (let li of lineItems) {
                    delete items[li];
                }
            }
            else if (lineItems.length === 1) {
                newItems.blocks.push(convertBlock(lineItems[0], items[lineItems[0]]));
                delete items[lineItems[0]];
            }
            y += 1;
        }
        return {
            items: newItems,
            layout: "blocks",
            style: "default"
        };
    }
}
exports.default = DashboardUpgrader;
/*

Old style:

items: dashboard items, indexed by id. Each item contains:

 `layout`: layout-engine specific data for layout of item
 `widget`: details of the widget (see below)

`widget` contains:
 `type`: type string of the widget. Understandable by widget factory
 `version`: version of the widget. semver string
 `design`: design of the widget as a JSON object


New style:

id: id of block
type: "root"/"vertical"/"horizontal"/"widget"/"spacer"
widgetType: if a widget
aspectRatio: w/h if not autoHeight
design: widget design
weights: weights for proportioning horizontal blocks. Default is 1
blocks: other blocks if not a widget

*/
