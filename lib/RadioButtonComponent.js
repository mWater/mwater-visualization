"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
// Pretty radio button component
class RadioButtonComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleClick = () => {
            if (this.props.onChange) {
                this.props.onChange(!this.props.checked);
            }
            if (this.props.onClick) {
                return this.props.onClick();
            }
        };
    }
    render() {
        return R("div", {
            className: this.props.checked ? "mwater-visualization-radio checked" : "mwater-visualization-radio",
            onClick: this.handleClick
        }, this.props.children);
    }
}
exports.default = RadioButtonComponent;
