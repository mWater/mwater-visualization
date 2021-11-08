"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonToggleComponent = exports.ToggleEditComponent = exports.SwitchViewComponent = exports.OptionComponent = exports.OptionListComponent = exports.SectionComponent = void 0;
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const R = react_1.default.createElement;
const motion = __importStar(require("react-motion"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
// Miscellaneous ui components
// Section with a title and icon
class SectionComponent extends react_1.default.Component {
    render() {
        return R("div", { style: { marginBottom: 15 } }, R("label", { className: "text-muted" }, this.props.icon && this.props.icon.match(/^fa-/)
            ? [R("i", { className: `fa ${this.props.icon}` }), " "]
            : undefined, this.props.icon && this.props.icon.match(/^glyphicon-/)
            ? [R("span", { className: `glyphicon ${this.props.icon}` }), " "]
            : undefined, this.props.label), R("div", { style: { marginLeft: 10 } }, this.props.children));
    }
}
exports.SectionComponent = SectionComponent;
/** List of options with a name and description each */
class OptionListComponent extends react_1.default.Component {
    render() {
        return R("div", null, R("div", { style: { color: "#AAA", fontStyle: "italic" }, key: "hint" }, this.props.hint), R("div", { className: "mwater-visualization-big-options", key: "options" }, lodash_1.default.map(this.props.items, (item, i) => {
            return R(OptionComponent, {
                name: item.name,
                desc: item.desc,
                onClick: item.onClick,
                onRemove: item.onRemove,
                key: i
            });
        })));
    }
}
exports.OptionListComponent = OptionListComponent;
// Single option
class OptionComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleClick = (ev) => {
            ev.stopPropagation();
            return this.props.onRemove();
        };
    }
    render() {
        return R("div", { className: "mwater-visualization-big-option", onClick: this.props.onClick }, this.props.onRemove
            ? R("button", { type: "button", className: "btn btn-link btn-sm float-end", onClick: this.handleClick }, R("span", { className: "fas fa-times" }))
            : undefined, R("div", { style: { fontWeight: "bold" } }, this.props.name), R("div", { style: { color: "#888" } }, this.props.desc));
    }
}
exports.OptionComponent = OptionComponent;
// Switches views smoothly
class SwitchViewComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        // Save components
        this.refCallback = (id, comp) => {
            this.comps = this.comps || {};
            return (this.comps[id] = comp);
        };
        this.state = {
            measuring: false
        };
    }
    componentWillReceiveProps(nextProps) {
        // If view changes, measure all components
        if (nextProps.viewId !== this.props.viewId) {
            return this.setState({ measuring: true });
        }
    }
    componentDidUpdate(prevProps, prevState) {
        // If measuring, get the heights to interpolate
        if (this.state.measuring) {
            this.heights = {};
            // Get heights
            for (let id of lodash_1.default.keys(this.props.views)) {
                this.heights[id] = react_dom_1.default.findDOMNode(this.comps[id]).clientHeight;
            }
            return this.setState({ measuring: false });
        }
    }
    render() {
        // Create the style object that has the opacity for each view
        let id;
        const style = {};
        for (id in this.props.views) {
            const view = this.props.views[id];
            style[id] = motion.spring(id === this.props.viewId ? 1 : 0, [332, 34]);
        } // Stiff, quick spring
        return R(motion.Motion, { style }, (style) => {
            // If measuring, display all positioned at top
            if (this.state.measuring) {
                return R("div", { style: { position: "relative" } }, lodash_1.default.map(lodash_1.default.keys(this.props.views), (v) => {
                    return R("div", {
                        style: { position: "absolute", top: 0, opacity: style[v] },
                        ref: this.refCallback.bind(null, v),
                        key: v
                    }, this.props.views[v]);
                }));
            }
            // If transitioning
            if (style[this.props.viewId] !== 1) {
                // Calculate interpolated height
                let height = 0;
                for (id in style) {
                    const val = style[id];
                    height += val * this.heights[id];
                }
                return R("div", { style: { position: "relative", height } }, lodash_1.default.map(lodash_1.default.keys(this.props.views), (v) => {
                    return R("div", { style: { position: "absolute", top: 0, left: 0, right: 0, opacity: style[v] }, key: v }, this.props.views[v]);
                }));
            }
            // Just display (but wrapped to keep same component)
            return R("div", null, R("div", { key: this.props.viewId }, this.props.views[this.props.viewId]));
        });
    }
}
exports.SwitchViewComponent = SwitchViewComponent;
// Shows as editable link that can be clicked to open
// Editor can be node or can be function that takes onClose function as first parameter
class ToggleEditComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.close = () => {
            // Save height of editor
            if (this.editorComp) {
                this.editorHeight = react_dom_1.default.findDOMNode(this.editorComp).clientHeight;
            }
            return this.setState({ open: false });
        };
        this.open = () => {
            return this.setState({ open: true });
        };
        this.handleToggle = () => {
            return this.setState({ open: !this.state.open });
        };
        // Save editor comp
        this.editorRef = (editorComp) => {
            return (this.editorComp = editorComp);
        };
        this.state = { open: props.initiallyOpen || false };
    }
    render() {
        let { editor } = this.props;
        if (lodash_1.default.isFunction(editor)) {
            editor = editor(this.close);
        }
        const link = R(mwater_expressions_ui_1.LinkComponent, { onClick: this.open, onRemove: this.props.onRemove }, this.props.label);
        const isOpen = this.state.open || this.props.forceOpen;
        return R(SwitchViewComponent, {
            views: { editor, link },
            viewId: isOpen ? "editor" : "link"
        });
    }
}
exports.ToggleEditComponent = ToggleEditComponent;
// Switch between several values as a series of radio buttons
class ButtonToggleComponent extends react_1.default.Component {
    render() {
        return R("div", { className: "btn-group btn-group-sm" }, lodash_1.default.map(this.props.options, (option, i) => {
            return R("button", {
                type: "button",
                key: option.value,
                className: option.value === this.props.value ? "btn btn-primary active" : "btn btn-outline-primary",
                onClick: this.props.onChange.bind(null, option.value)
            }, option.label);
        }));
    }
}
exports.ButtonToggleComponent = ButtonToggleComponent;
