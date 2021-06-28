"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const lodash_1 = __importDefault(require("lodash"));
const TextComponent_1 = __importDefault(require("./TextComponent"));
const TextWidget_1 = __importDefault(require("./TextWidget"));
const AsyncLoadComponent_1 = __importDefault(require("react-library/lib/AsyncLoadComponent"));
// Widget which displays styled text with embedded expressions
class TextWidgetComponent extends AsyncLoadComponent_1.default {
    constructor(props) {
        super(props);
        this.state = {
            // Map of expression id to expression value
            exprValues: {},
            error: null,
            cacheExpiry: props.dataSource.getCacheExpiry() // Save cache expiry to see if changes
        };
    }
    // Override to determine if a load is needed. Not called on mounting
    isLoadNeeded(newProps, oldProps) {
        // Get expression items recursively
        function getExprItems(items) {
            let exprItems = [];
            for (let item of items || []) {
                if (item.type === "expr") {
                    exprItems.push(item);
                }
                if (item.items) {
                    exprItems = exprItems.concat(getExprItems(item.items));
                }
            }
            return exprItems;
        }
        // Reload if filters or expressions have changed or cache expiry
        return (!lodash_1.default.isEqual(newProps.filters, oldProps.filters) ||
            !lodash_1.default.isEqual(getExprItems(newProps.design.items), getExprItems(oldProps.design.items)) ||
            newProps.dataSource.getCacheExpiry() !== this.state.cacheExpiry);
    }
    // Call callback with state changes
    load(props, prevProps, callback) {
        // Shortcut if no expressions in text widget
        const widget = new TextWidget_1.default();
        if (widget.getExprItems(props.design.items).length === 0) {
            callback({ error: null, exprValues: {} }, props.dataSource.getCacheExpiry());
            return;
        }
        // Get data
        return props.widgetDataSource.getData(props.design, props.filters, (error, data) => {
            return callback({ error, exprValues: data || {}, cacheExpiry: props.dataSource.getCacheExpiry() });
        });
    }
    scrollToTOCEntry(entryId) {
        // Find entry in divComp
        const entries = this.divComp.querySelectorAll("h1,h2,h3,h4,h5,h6,h7,h8,h9");
        const entry = entries[entryId];
        if (entry) {
            return entry.scrollIntoView(true);
        }
    }
    render() {
        // If loading, don't display old values
        const exprValues = !this.state.loading ? this.state.exprValues : {};
        return R("div", {
            ref: (c) => {
                return (this.divComp = c);
            }
        }, R(TextComponent_1.default, {
            design: this.props.design,
            onDesignChange: this.props.onDesignChange,
            filters: this.props.filters,
            schema: this.props.schema,
            dataSource: this.props.dataSource,
            exprValues,
            width: this.props.width,
            height: this.props.height,
            singleRowTable: this.props.singleRowTable,
            namedStrings: this.props.namedStrings
        }));
    }
}
exports.default = TextWidgetComponent;
