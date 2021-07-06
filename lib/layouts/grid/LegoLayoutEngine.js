"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
// Layout engine that places blocks like lego and displaces others out of the way
class LegoLayoutEngine {
    constructor(width, blocksAcross) {
        this.width = width;
        this.blocksAcross = blocksAcross;
        this.scale = this.width / this.blocksAcross;
    }
    // Calculate the total height needed to fit all layouts plus one row
    calculateHeight(layouts) {
        const bottom = lodash_1.default.max(lodash_1.default.map(layouts, (l) => this.getLayoutBounds(l).y + this.getLayoutBounds(l).height));
        return bottom + this.scale;
    }
    // Get the bounds of a layout (x, y, width, height)
    getLayoutBounds(layout) {
        return {
            x: this.scale * layout.x,
            y: this.scale * layout.y,
            width: this.scale * layout.w,
            height: this.scale * layout.h
        };
    }
    // Converts a rectangle to a layout
    rectToLayout(rect) {
        // Get snapped approximate location
        let x = Math.round(rect.x / this.scale);
        let y = Math.round(rect.y / this.scale);
        let w = Math.round(rect.width / this.scale);
        let h = Math.round(rect.height / this.scale);
        // Clip
        if (x < 0) {
            x = 0;
        }
        if (y < 0) {
            y = 0;
        }
        if (x >= this.blocksAcross) {
            x = this.blocksAcross - 1;
        }
        if (w < 1) {
            w = 1;
        }
        if (x + w > this.blocksAcross) {
            w = this.blocksAcross - x;
        }
        if (h < 1) {
            h = 1;
        }
        return { x, y, w, h };
    }
    // Arranges a layout, making all blocks fit. Optionally prioritizes
    // a particular item.
    // layouts is lookup of id -> layout
    // priority is optional id to layout first
    // Returns layout lookup of id -> layout
    performLayout(layouts, priority) {
        // Create list of placed layouts to avoid as placing new ones
        const placedLayouts = [];
        const results = {};
        // Add priority first to displace others
        if (priority) {
            placedLayouts.push(layouts[priority]);
            results[priority] = layouts[priority];
        }
        // Order all by reading order (l->r, top->bottom)
        const toProcess = lodash_1.default.sortBy(lodash_1.default.keys(layouts), (id) => {
            const l = layouts[id];
            return l.x + l.y * this.blocksAcross;
        });
        // Process each layout, avoiding all previous
        for (let id of toProcess) {
            // Skip priority one
            if (id === priority) {
                continue;
            }
            // Check if overlaps
            var layout = layouts[id];
            while (lodash_1.default.any(placedLayouts, (pl) => this.overlaps(pl, layout))) {
                // Move around until fits
                layout = this.shiftLayout(layout);
            }
            placedLayouts.push(layout);
            results[id] = layout;
        }
        return results;
    }
    // Adds a layout with the w and h (width and height in blocks)
    appendLayout(layouts, w, h) {
        // Check if overlaps
        let layout = { x: 0, y: 0, w, h };
        while (lodash_1.default.any(lodash_1.default.values(layouts), (pl) => this.overlaps(pl, layout))) {
            // Move around until fits
            layout = this.shiftLayout(layout);
        }
        return layout;
    }
    // Check if layouts overlap
    overlaps(a, b) {
        if (a.x + a.w <= b.x) {
            return false;
        }
        if (a.y + a.h <= b.y) {
            return false;
        }
        if (a.x >= b.x + b.w) {
            return false;
        }
        if (a.y >= b.y + b.h) {
            return false;
        }
        return true;
    }
    // Shifts layout right or down if no more room
    shiftLayout(layout) {
        if (layout.x + layout.w < this.blocksAcross) {
            return { x: layout.x + 1, y: layout.y, w: layout.w, h: layout.h };
        }
        return { x: 0, y: layout.y + 1, w: layout.w, h: layout.h };
    }
}
exports.default = LegoLayoutEngine;
