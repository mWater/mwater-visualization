"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
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
