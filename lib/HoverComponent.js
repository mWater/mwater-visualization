"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let HoverComponent;
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
exports.default = HoverComponent = class HoverComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.onOver = () => {
            return this.setState({ hovered: true });
        };
        this.onOut = () => {
            return this.setState({ hovered: false });
        };
        this.state = { hovered: false };
    }
    componentDidMount() {
        react_dom_1.default.findDOMNode(this.main).addEventListener("mouseover", this.onOver);
        return react_dom_1.default.findDOMNode(this.main).addEventListener("mouseout", this.onOut);
    }
    componentWillUnmount() {
        react_dom_1.default.findDOMNode(this.main).removeEventListener("mouseover", this.onOver);
        return react_dom_1.default.findDOMNode(this.main).removeEventListener("mouseout", this.onOut);
    }
    render() {
        return react_1.default.cloneElement(react_1.default.Children.only(this.props.children), {
            ref: (c) => {
                return (this.main = c);
            },
            hovered: this.state.hovered
        });
    }
};
