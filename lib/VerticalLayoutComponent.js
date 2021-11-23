"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jquery_1 = __importDefault(require("jquery"));
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const R = react_1.default.createElement;
const lodash_1 = __importDefault(require("lodash"));
// Lays out divs vertically, allowing fractional allocation combined with auto-sized ones
// Children must all have keys
// Children will be cloned with height: prop set in case of fractional ones
class VerticalLayoutComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = { availableHeight: 0 };
        this.childRefs = {};
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.height !== this.props.height || !lodash_1.default.isEqual(nextProps.relativeHeights, this.props.relativeHeights)) {
            return this.recalculateSize(nextProps);
        }
    }
    componentDidMount() {
        return this.recalculateSize(this.props);
    }
    recalculateSize(props) {
        // Calculate available height
        let availableHeight = props.height;
        for (let child of props.children) {
            if (!child) {
                continue;
            }
            if (props.relativeHeights[child.key]) {
                continue;
            }
            const node = react_dom_1.default.findDOMNode(this.childRefs[child.key]);
            availableHeight -= (0, jquery_1.default)(node).outerHeight();
        }
        return this.setState({ availableHeight });
    }
    // Get a subcomponent
    getComponent(key) {
        return this.childRefs[key];
    }
    render() {
        // Calculate scaling
        return R("div", { style: { height: this.props.height } }, react_1.default.Children.map(this.props.children, (child) => {
            if (!child) {
                return;
            }
            // If variable height
            if (child.key && this.props.relativeHeights[child.key]) {
                // If available height is known, render variable
                if (this.state.availableHeight) {
                    const height = this.state.availableHeight * this.props.relativeHeights[child.key];
                    return R("div", { style: { height, position: "relative" } }, R("div", {
                        style: { height },
                        ref: (c) => {
                            return (this.childRefs[child.key] = c);
                        }
                    }, react_1.default.cloneElement(child, { height })));
                }
                // Otherwise don't show until available height is known
                return null;
            }
            return R("div", {
                ref: (c) => {
                    return (this.childRefs[child.key] = c);
                }
            }, child);
        }));
    }
}
exports.default = VerticalLayoutComponent;
