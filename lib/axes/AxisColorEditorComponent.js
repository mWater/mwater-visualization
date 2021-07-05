"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const CategoryMapComponent_1 = __importDefault(require("./CategoryMapComponent"));
const ColorSchemeFactory_1 = __importDefault(require("../ColorSchemeFactory"));
const ColorPaletteCollectionComponent_1 = __importDefault(require("./ColorPaletteCollectionComponent"));
const update_object_1 = __importDefault(require("update-object"));
const AxisBuilder_1 = __importDefault(require("./AxisBuilder"));
// Color editor for axis. Allows switching between editing individial colors (using CategoryMapComponent)
// and setting the colors from a palette (using ColorPaletteCollectionComponent)
class AxisColorEditorComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleSelectPalette = () => {
            return this.setState({ mode: "palette" });
        };
        this.handleResetPalette = () => {
            // Completely reset
            const colorMap = lodash_1.default.map(this.props.categories, (category, i) => ({
                value: category.value,
                color: null
            }));
            this.handlePaletteChange(colorMap);
            return this.setState({ mode: "normal" });
        };
        this.handlePaletteChange = (palette) => {
            this.props.onChange(update_object_1.default(this.props.axis, { colorMap: { $set: palette }, drawOrder: { $set: lodash_1.default.pluck(palette, "value") } }));
            return this.setState({ mode: "normal" });
        };
        this.handleCancelCustomize = () => {
            return this.setState({ mode: "normal" });
        };
        this.state = {
            mode: "normal"
        };
    }
    componentWillMount() {
        return this.updateColorMap();
    }
    componentDidUpdate() {
        return this.updateColorMap();
    }
    // Update color map if categories no longer match
    updateColorMap() {
        const axisBuilder = new AxisBuilder_1.default({ schema: this.props.schema });
        // If no categories, can't do anything
        if (!this.props.categories) {
            return;
        }
        // If no color map or color map values have changed
        if (!this.props.axis.colorMap ||
            !lodash_1.default.isEqual(lodash_1.default.pluck(this.props.axis.colorMap, "value").sort(), lodash_1.default.pluck(this.props.categories, "value").sort())) {
            let colorMap;
            if (this.props.autosetColors) {
                colorMap = ColorSchemeFactory_1.default.createColorMapForCategories(this.props.categories, axisBuilder.isCategorical(this.props.axis));
            }
            else {
                // Keep existing
                const existing = lodash_1.default.indexBy(this.props.axis.colorMap || [], "value");
                colorMap = lodash_1.default.map(this.props.categories, (category, i) => ({
                    value: category.value,
                    color: existing[category.value] ? existing[category.value].color : null
                }));
            }
            this.handlePaletteChange(colorMap);
            return this.setState({ mode: "normal" });
        }
    }
    renderPreview() {
        return R("div", { className: "axis-palette" }, lodash_1.default.map(this.props.categories.slice(0, 6), (category, i) => {
            const color = lodash_1.default.find(this.props.axis.colorMap, { value: category.value });
            const cellStyle = {
                display: "inline-block",
                height: 20,
                width: 20,
                backgroundColor: color ? color.color : this.props.defaultColor
            };
            return R("div", { style: cellStyle, key: i }, " ");
        }));
    }
    render() {
        return R("div", null, (() => {
            if (this.state.mode === "palette") {
                if (this.props.categories) {
                    return R(ColorPaletteCollectionComponent_1.default, {
                        onPaletteSelected: this.handlePaletteChange,
                        axis: this.props.axis,
                        categories: this.props.categories,
                        onCancel: this.handleCancelCustomize
                    });
                }
            }
        })(), this.state.mode === "normal"
            ? R("div", null, R("p", null, R("a", { style: { cursor: "pointer" }, onClick: this.handleSelectPalette, key: "select-palette" }, "Change color scheme"), !this.props.autosetColors
                ? R("a", {
                    style: { cursor: "pointer", marginLeft: 10 },
                    onClick: this.handleResetPalette,
                    key: "reset-palette"
                }, "Reset colors")
                : undefined), this.props.axis.colorMap
                ? R("div", { key: "selected-palette" }, R("div", null, R(CategoryMapComponent_1.default, {
                    schema: this.props.schema,
                    axis: this.props.axis,
                    onChange: this.props.onChange,
                    categories: this.props.categories,
                    key: "colorMap",
                    reorderable: this.props.reorderable,
                    allowExcludedValues: this.props.allowExcludedValues,
                    showColorMap: true,
                    initiallyExpanded: this.props.initiallyExpanded
                })))
                : undefined)
            : undefined);
    }
}
exports.default = AxisColorEditorComponent;
AxisColorEditorComponent.defaultProps = {
    reorderable: false,
    autosetColors: true
};
