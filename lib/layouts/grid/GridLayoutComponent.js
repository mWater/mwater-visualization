"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const WidgetContainerComponent_1 = __importDefault(require("./WidgetContainerComponent"));
const LegoLayoutEngine_1 = __importDefault(require("./LegoLayoutEngine"));
class GridLayoutComponent extends react_1.default.Component {
    renderPageBreaks(layoutEngine, layouts) {
        // Get height
        const height = layoutEngine.calculateHeight(layouts);
        // Page breaks are 8.5x11 with 0.5" margin
        const pageHeight = (this.props.width / 7.5) * 10;
        const number = Math.floor(height / pageHeight);
        const elems = [];
        if (number > 0) {
            for (let i = 1, end = number, asc = 1 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
                elems.push(R("div", {
                    className: "mwater-visualization-page-break",
                    key: `page${i}`,
                    style: { position: "absolute", top: i * pageHeight }
                }));
            }
        }
        return elems;
    }
    render() {
        // Create layout engine
        const layoutEngine = new LegoLayoutEngine_1.default(this.props.width, 24);
        // Get layouts indexed by id
        const layouts = lodash_1.default.mapValues(this.props.items, "layout");
        const style = {
            height: "100%",
            position: "relative"
        };
        // Render widget container
        return R("div", { style }, R(WidgetContainerComponent_1.default, {
            layoutEngine,
            items: this.props.items,
            onItemsChange: this.props.onItemsChange,
            renderWidget: this.props.renderWidget,
            width: this.props.width
        }), this.renderPageBreaks(layoutEngine, layouts));
    }
}
exports.default = GridLayoutComponent;
