"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const lodash_1 = __importDefault(require("lodash"));
const react_onclickout_1 = __importDefault(require("react-onclickout"));
// Palette item that allows picking a size from dropdown
class FontSizePaletteItem extends react_1.default.Component {
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
    renderSize(label, value) {
        return R("div", {
            className: "font-size-palette-menu-item",
            onMouseDown: (ev) => {
                ev.preventDefault();
                this.props.onSetSize(value);
                return this.setState({ open: false });
            },
            key: value
        }, label);
    }
    renderSizes() {
        return R("div", null, this.renderSize("Tiny", "50%"), this.renderSize("Small", "66%"), this.renderSize("Normal", "100%"), this.renderSize("Large", "150%"), this.renderSize("Huge", "200%"));
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
        }, R("style", null, `\
.font-size-palette-menu-item {
color: black;
background-color: white;
text-align: left;
padding: 5px 15px 5px 15px;
cursor: pointer;
}
.font-size-palette-menu-item:hover {
background-color: #DDD;
}\
`), this.state.open ? R("div", { style: popupPosition }, this.renderSizes()) : undefined, R("i", { className: "fa fa-arrows-v" })));
    }
}
exports.default = FontSizePaletteItem;
FontSizePaletteItem.defaultProps = { position: "under" };
class ColorPaletteComponent extends react_1.default.Component {
    renderColor(color) {
        return R("td", null, R("div", {
            style: { width: 16, height: 15, backgroundColor: color, margin: 1 },
            onMouseDown: (ev) => {
                ev.preventDefault();
                return this.props.onSetColor.bind(null, color);
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
            return this.renderColor(Color({ r: (i * 255) / 7, g: (i * 255) / 7, b: (i * 255) / 7 }).hex());
        })), R("tr", { style: { height: 5 } }), 
        // Base colors
        R("tr", null, lodash_1.default.map(baseColors, (c) => this.renderColor(c))), R("tr", { style: { height: 5 } }), R("tr", null, lodash_1.default.map(baseColors, (c) => this.renderColor(Color(c).lighten(0.7).hex()))), R("tr", null, lodash_1.default.map(baseColors, (c) => this.renderColor(Color(c).lighten(0.5).hex()))), R("tr", null, lodash_1.default.map(baseColors, (c) => this.renderColor(Color(c).lighten(0.3).hex()))), R("tr", null, lodash_1.default.map(baseColors, (c) => this.renderColor(Color(c).darken(0.3).hex()))), R("tr", null, lodash_1.default.map(baseColors, (c) => this.renderColor(Color(c).darken(0.5).hex()))), R("tr", null, lodash_1.default.map(baseColors, (c) => this.renderColor(Color(c).darken(0.7).hex()))))));
    }
}
