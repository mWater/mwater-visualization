"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const ColorSchemeFactory_1 = __importDefault(require("../ColorSchemeFactory"));
class ColorPaletteCollectionComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.onPaletteSelected = (index) => {
            // Generate color map
            const scheme = ColorSchemeFactory_1.default.createColorScheme({
                type: ColorPaletteCollectionComponent.palettes[index].type,
                // Null doesn't count to length
                number: lodash_1.default.any(this.props.categories, (c) => c.value == null)
                    ? this.props.categories.length - 1
                    : this.props.categories.length,
                reversed: ColorPaletteCollectionComponent.palettes[index].reversed
            });
            const colorMap = lodash_1.default.map(this.props.categories, (category, i) => ({
                value: category.value,
                color: category.value === null ? "#aaaaaa" : scheme[i % scheme.length]
            }));
            return this.props.onPaletteSelected(colorMap);
        };
        this.renderCancel = () => {
            if (this.props.axis.colorMap) {
                return R("div", null, R("a", { style: { cursor: "pointer" }, onClick: this.props.onCancel, key: "cancel-customize" }, "Cancel"));
            }
        };
    }
    static initClass() {
        this.palettes = [
            { type: "schemeSet1", reversed: false },
            { type: "schemeSet2", reversed: false },
            { type: "schemeSet3", reversed: false },
            { type: "schemeAccent", reversed: false },
            { type: "schemeDark2", reversed: false },
            { type: "schemePaired", reversed: false },
            { type: "schemePastel1", reversed: false },
            { type: "schemePastel2", reversed: false },
            { type: "interpolateSpectral", reversed: false },
            { type: "interpolateSpectral", reversed: true },
            { type: "interpolateBlues", reversed: false },
            { type: "interpolateBlues", reversed: true },
            { type: "interpolateGreens", reversed: false },
            { type: "interpolateGreens", reversed: true },
            { type: "interpolateGreys", reversed: false },
            { type: "interpolateGreys", reversed: true },
            { type: "interpolateOranges", reversed: false },
            { type: "interpolateOranges", reversed: true },
            { type: "interpolatePurples", reversed: false },
            { type: "interpolatePurples", reversed: true },
            { type: "interpolateReds", reversed: false },
            { type: "interpolateReds", reversed: true },
            { type: "interpolateBuGn", reversed: false },
            { type: "interpolateBuGn", reversed: true },
            { type: "interpolateBuPu", reversed: false },
            { type: "interpolateBuPu", reversed: true },
            { type: "interpolateGnBu", reversed: false },
            { type: "interpolateGnBu", reversed: true },
            { type: "interpolateOrRd", reversed: false },
            { type: "interpolateOrRd", reversed: true },
            { type: "interpolatePuBuGn", reversed: false },
            { type: "interpolatePuBuGn", reversed: true },
            { type: "interpolatePuBu", reversed: false },
            { type: "interpolatePuBu", reversed: true },
            { type: "interpolatePuRd", reversed: false },
            { type: "interpolatePuRd", reversed: true },
            { type: "interpolateRdPu", reversed: false },
            { type: "interpolateRdPu", reversed: true },
            { type: "interpolateYlGnBu", reversed: false },
            { type: "interpolateYlGnBu", reversed: true },
            { type: "interpolateYlGn", reversed: false },
            { type: "interpolateYlGn", reversed: true },
            { type: "interpolateYlOrBr", reversed: false },
            { type: "interpolateYlOrBr", reversed: true },
            { type: "interpolateYlOrRd", reversed: false },
            { type: "interpolateYlOrRd", reversed: true },
            { type: "interpolateBrBG", reversed: false },
            { type: "interpolateBrBG", reversed: true },
            { type: "interpolatePRGn", reversed: false },
            { type: "interpolatePRGn", reversed: true },
            { type: "interpolatePiYG", reversed: false },
            { type: "interpolatePiYG", reversed: true },
            { type: "interpolatePuOr", reversed: false },
            { type: "interpolatePuOr", reversed: true },
            { type: "interpolateRdBu", reversed: false },
            { type: "interpolateRdBu", reversed: true },
            { type: "interpolateRdGy", reversed: false },
            { type: "interpolateRdGy", reversed: true },
            { type: "interpolateRdYlBu", reversed: false },
            { type: "interpolateRdYlBu", reversed: true },
            { type: "interpolateRdYlGn", reversed: false },
            { type: "interpolateRdYlGn", reversed: true }
        ];
    }
    render() {
        return R("div", null, R("p", null, "Please select a color scheme"), lodash_1.default.map(ColorPaletteCollectionComponent.palettes, (config, index) => {
            return R(ColorPaletteComponent, {
                key: index,
                index,
                colorSet: ColorSchemeFactory_1.default.createColorScheme({
                    type: config.type,
                    number: Math.min(this.props.categories.length - 1, 6),
                    reversed: config.reversed
                }),
                onPaletteSelected: this.onPaletteSelected,
                number: this.props.categories.length
            });
        }), this.renderCancel());
    }
}
exports.default = ColorPaletteCollectionComponent;
ColorPaletteCollectionComponent.initClass();
class ColorPaletteComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleSelect = () => {
            return this.props.onPaletteSelected(this.props.index);
        };
    }
    static initClass() {
        this.defaultProps = { number: 6 };
    }
    render() {
        return R("div", { onClick: this.handleSelect, className: "axis-palette" }, lodash_1.default.map(this.props.colorSet.slice(0, this.props.number), (color, i) => {
            const cellStyle = {
                display: "inline-block",
                height: 20,
                width: 20,
                backgroundColor: color
            };
            return R("div", { style: cellStyle, key: i }, " ");
        }));
    }
}
ColorPaletteComponent.initClass();
