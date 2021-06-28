"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const jquery_1 = __importDefault(require("jquery"));
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const R = react_1.default.createElement;
// Widget wrapper that adds a dropdown menu in a gear floating
class DropdownWidgetComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.renderDropdownItem = (item, i) => {
            return R("li", { key: `${i}` }, R("a", { onClick: item.onClick }, item.icon ? R("span", { className: `glyphicon glyphicon-${item.icon} text-muted` }) : undefined, item.icon ? " " : undefined, item.label));
        };
        this.closeMenu = () => {
            return jquery_1.default(react_dom_1.default.findDOMNode(this)).find('[data-toggle="dropdown"]').parent().removeClass("open");
        };
    }
    renderDropdown() {
        if (this.props.dropdownItems.length === 0) {
            return null;
        }
        const dropdownStyle = {
            position: "absolute",
            right: 3,
            top: 3,
            cursor: "pointer",
            zIndex: 1029
        };
        const elem = R("div", { style: dropdownStyle, "data-toggle": "dropdown" }, R("div", { className: "mwater-visualization-simple-widget-gear-button" }, R("span", { className: "glyphicon glyphicon-cog" })));
        return R("div", { style: dropdownStyle }, elem, R("ul", { className: "dropdown-menu dropdown-menu-right", style: { top: 25 } }, lodash_1.default.map(this.props.dropdownItems, this.renderDropdownItem)));
    }
    render() {
        return R("div", {
            className: "mwater-visualization-simple-widget",
            onMouseLeave: this.closeMenu,
            style: { width: this.props.width, height: this.props.height }
        }, this.props.children, this.renderDropdown());
    }
}
exports.default = DropdownWidgetComponent;
