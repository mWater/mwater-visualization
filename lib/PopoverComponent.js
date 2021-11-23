"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const jquery_1 = __importDefault(require("jquery"));
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
// Wraps a child with an optional popover
class PopoverComponent extends react_1.default.Component {
    componentDidMount() {
        return this.updatePopover(this.props, null);
    }
    componentWillUnmount() {
        return this.updatePopover(null, this.props);
    }
    componentDidUpdate(prevProps) {
        if (!lodash_1.default.isEqual(prevProps.content, this.props.content) ||
            prevProps.visible !== this.props.visible ||
            prevProps.placement !== this.props.placement) {
            return this.updatePopover(this.props, prevProps);
        }
    }
    updatePopover(props, oldProps) {
        // Destroy old popover
        if (oldProps && oldProps.visible) {
            (0, jquery_1.default)(react_dom_1.default.findDOMNode(this)).popover("destroy");
        }
        if (props && props.visible) {
            const div = document.createElement("div");
            return react_dom_1.default.render(this.props.content, div, () => {
                (0, jquery_1.default)(react_dom_1.default.findDOMNode(this)).popover({
                    content() {
                        return (0, jquery_1.default)(div);
                    },
                    html: true,
                    trigger: "manual",
                    placement: this.props.placement
                });
                return (0, jquery_1.default)(react_dom_1.default.findDOMNode(this)).popover("show");
            });
        }
    }
    render() {
        return react_1.default.Children.only(this.props.children);
    }
}
exports.default = PopoverComponent;
