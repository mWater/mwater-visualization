"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const lodash_1 = __importDefault(require("lodash"));
const R = react_1.default.createElement;
const AxisBuilder_1 = __importDefault(require("../axes/AxisBuilder"));
const LegendGroup_1 = __importDefault(require("./LegendGroup"));
// wraps the legends for a layer
class LayerLegendComponent extends react_1.default.Component {
    static initClass() {
        this.defaultProps = { radiusLayer: false };
    }
    getCategories() {
        const axisBuilder = new AxisBuilder_1.default({ schema: this.props.schema });
        if (!this.props.axis || !this.props.axis.colorMap) {
            return;
        }
        // Get categories (value + label)
        const categories = axisBuilder.getCategories(this.props.axis, null, this.props.locale);
        // Just "None" and so doesn't count
        if (lodash_1.default.any(categories, (category) => category.value != null)) {
            return categories;
        }
        // Can't get values of aggregate axis
        if (axisBuilder.isAxisAggr(this.props.axis)) {
            return [];
        }
        // If no categories, use values from color map as input
        return axisBuilder.getCategories(this.props.axis, lodash_1.default.pluck(this.props.axis.colorMap, "value"), this.props.locale);
    }
    render() {
        let items;
        const axisBuilder = new AxisBuilder_1.default({ schema: this.props.schema });
        const categories = this.getCategories();
        if (this.props.axis && this.props.axis.colorMap) {
            items = lodash_1.default.map(categories, (category) => {
                // Exclude if excluded
                if (lodash_1.default.includes(this.props.axis.excludedValues, category.value)) {
                    return null;
                }
                const label = axisBuilder.formatCategory(this.props.axis, category);
                const color = lodash_1.default.find(this.props.axis.colorMap, { value: category.value });
                if (color) {
                    return { color: color.color, name: label };
                }
                else {
                    // old color maps dont have null value
                    return { color: this.props.defaultColor, name: label };
                }
            });
            // Compact out nulls
            items = lodash_1.default.compact(items);
        }
        else {
            items = [];
        }
        return react_1.default.createElement(LegendGroup_1.default, {
            symbol: this.props.symbol,
            markerSize: this.props.markerSize,
            items,
            defaultColor: this.props.defaultColor,
            name: this.props.name,
            radiusLayer: this.props.radiusLayer
        });
    }
}
exports.default = LayerLegendComponent;
LayerLegendComponent.initClass();
