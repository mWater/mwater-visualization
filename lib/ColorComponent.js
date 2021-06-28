"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const react_onclickout_1 = __importDefault(require("react-onclickout"));
const react_color_1 = require("react-color");
const react_color_2 = require("react-color");
// Simple color well with popup
class ColorComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleClick = () => {
            return this.setState({ open: !this.state.open, advanced: false });
        };
        this.handleClose = (color) => {
            return this.props.onChange(color.hex);
        };
        this.handleReset = () => {
            this.setState({ open: false });
            return this.props.onChange(null);
        };
        this.handleTransparent = () => {
            this.setState({ open: false });
            return this.props.onChange("transparent");
        };
        this.handleAdvanced = () => {
            return this.setState({ advanced: !this.state.advanced });
        };
        this.state = { open: false, advanced: false };
    }
    render() {
        const style = {
            height: 20,
            width: 20,
            border: "solid 2px #888",
            borderRadius: 4,
            backgroundColor: this.props.color,
            cursor: "pointer",
            display: "inline-block"
        };
        if (!this.props.color) {
            // http://lea.verou.me/css3patterns/#diagonal-stripes
            style.backgroundColor = "#AAA";
            style.backgroundImage =
                "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,.7) 2px, rgba(255,255,255,.7) 4px)";
        }
        const popupPosition = {
            position: "absolute",
            top: 0,
            left: 30,
            zIndex: 1000,
            backgroundColor: "white",
            border: "solid 1px #DDD",
            borderRadius: 3
        };
        return R("div", { style: { position: "relative", display: "inline-block" } }, R("div", { style, onClick: this.handleClick }), this.state.open
            ? react_1.default.createElement(react_onclickout_1.default, { onClickOut: () => this.setState({ open: false }) }, R("div", { style: popupPosition }, R("button", { type: "button", className: "btn btn-link btn-sm", onClick: this.handleReset }, R("i", { className: "fa fa-undo" }), " Reset Color"), 
            // R 'button', type: "button", className: "btn btn-link btn-sm", onClick: @handleTransparent,
            //   R 'i', className: "fa fa-ban"
            //   " None"
            R("button", { type: "button", className: "btn btn-link btn-sm", onClick: this.handleAdvanced }, this.state.advanced ? "Basic" : "Advanced"), this.state.advanced
                ? react_1.default.createElement(react_color_1.SketchPicker, {
                    color: this.props.color || undefined,
                    disableAlpha: true,
                    onChangeComplete: this.handleClose
                })
                : react_1.default.createElement(react_color_2.SwatchesPicker, {
                    color: this.props.color || undefined,
                    onChangeComplete: this.handleClose
                })))
            : undefined);
    }
}
exports.default = ColorComponent;
