"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const lodash_1 = __importDefault(require("lodash"));
const react_onclickout_1 = __importDefault(require("react-onclickout"));
const color_1 = __importDefault(require("color"));
// Palette item that allows picking a color
class FontColorPaletteItem extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleMouseDown = (ev) => {
            // Don't lose focus from editor
            ev.preventDefault();
            return this.setState({ open: !this.state.open });
        };
        this.state = {
            open: false
        };
    }
    render() {
        const popupPosition = {
            position: "absolute",
            left: 0,
            zIndex: 1000,
            backgroundColor: "white",
            border: "solid 1px #AAA",
            borderRadius: 3
        };
        if (this.props.position === "under") {
            popupPosition["top"] = 26;
        }
        else {
            popupPosition["bottom"] = 26;
        }
        return R(react_onclickout_1.default, { onClickOut: () => this.setState({ open: false }) }, R("div", {
            className: "mwater-visualization-text-palette-item",
            onMouseDown: this.handleMouseDown,
            style: { position: "relative" }
        }, this.state.open
            ? R("div", { style: popupPosition }, R(ColorPaletteComponent, {
                onSetColor: (color) => {
                    this.props.onSetColor(color);
                    return this.setState({ open: false });
                }
            }))
            : undefined, R("i", { className: "fa fa-tint" })));
    }
}
exports.default = FontColorPaletteItem;
FontColorPaletteItem.defaultProps = { position: "under" };
class ColorPaletteComponent extends react_1.default.Component {
    renderColor(color) {
        return R("td", null, R("div", {
            style: { width: 16, height: 15, backgroundColor: color, margin: 1 },
            onMouseDown: (ev) => {
                ev.preventDefault();
                return this.props.onSetColor(color);
            }
        }));
    }
    render() {
        const baseColors = [
            "#FF0000",
            "#FFAA00",
            "#FFFF00",
            "#00FF00",
            "#00FFFF",
            "#0000FF",
            "#9900FF",
            "#FF00FF" // magenta
        ];
        return R("div", { style: { padding: 5 } }, R("table", null, R("tbody", null, 
        // Grey shades
        R("tr", null, lodash_1.default.map(lodash_1.default.range(0, 8), (i) => {
            return this.renderColor((0, color_1.default)({ r: (i * 255) / 7, g: (i * 255) / 7, b: (i * 255) / 7 }).hex());
        })), R("tr", { style: { height: 5 } }), 
        // Base colors
        R("tr", null, lodash_1.default.map(baseColors, (c) => this.renderColor(c))), R("tr", { style: { height: 5 } }), R("tr", null, lodash_1.default.map(baseColors, (c) => this.renderColor((0, color_1.default)(c).lighten(0.7).hex()))), R("tr", null, lodash_1.default.map(baseColors, (c) => this.renderColor((0, color_1.default)(c).lighten(0.5).hex()))), R("tr", null, lodash_1.default.map(baseColors, (c) => this.renderColor((0, color_1.default)(c).lighten(0.3).hex()))), R("tr", null, lodash_1.default.map(baseColors, (c) => this.renderColor((0, color_1.default)(c).darken(0.3).hex()))), R("tr", null, lodash_1.default.map(baseColors, (c) => this.renderColor((0, color_1.default)(c).darken(0.5).hex()))), R("tr", null, lodash_1.default.map(baseColors, (c) => this.renderColor((0, color_1.default)(c).darken(0.7).hex()))))));
    }
}
