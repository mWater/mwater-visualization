"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const lodash_1 = __importDefault(require("lodash"));
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const ItemsHtmlConverter_1 = __importDefault(require("./ItemsHtmlConverter"));
const react_float_affixed_1 = __importDefault(require("react-float-affixed"));
const FontColorPaletteItem_1 = __importDefault(require("./FontColorPaletteItem"));
const FontSizePaletteItem_1 = __importDefault(require("./FontSizePaletteItem"));
class RichTextComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleClick = (ev) => {
            // If click is in component or in palette component, ignore, otherwise remove focus
            if (!this.entireComponent.contains(ev.target) &&
                (!this.paletteComponent || !this.paletteComponent.contains(ev.target))) {
                return this.setState({ focused: false });
            }
        };
        this.handleInsertExpr = (item) => {
            const html = '<div data-embed="' + lodash_1.default.escape(JSON.stringify(item)) + '"></div>';
            this.contentEditable.pasteHTML(html);
        };
        this.handleSetFontSize = (size) => {
            // Requires a selection
            let html = this.contentEditable.getSelectedHTML();
            if (!html) {
                return alert("Please select text first to set size");
            }
            // Clear existing font-size styles. This is clearly a hack, but font sizes are absolute in execCommand which
            // doesn't mix with our various dashboard stylings, so we need to use percentages
            html = html.replace(/font-size:\s*\d+%;?/g, "");
            return this.contentEditable.pasteHTML(`<span style=\"font-size:${size}\">` + html + "</span>");
        };
        this.handleSetFontColor = (color) => {
            // Requires a selection
            const html = this.contentEditable.getSelectedHTML();
            if (!html) {
                return alert("Please select text first to set color");
            }
            this.handleCommand("foreColor", color);
        };
        this.handleChange = (elem) => {
            const items = this.props.itemsHtmlConverter.convertElemToItems(elem);
            // Check if changed
            if (!lodash_1.default.isEqual(items, this.props.items)) {
                this.props.onItemsChange(items);
            }
            else {
                // Re-render as HTML may have been mangled and needs a round-trip
                this.forceUpdate();
            }
        };
        this.handleFocus = () => {
            return this.setState({ focused: true });
        };
        this.handleBlur = () => {
            return this.setState({ focused: false });
        };
        // Perform a command such as bold, underline, etc.
        this.handleCommand = (command, param, ev) => {
            // Don't lose focus
            ev === null || ev === void 0 ? void 0 : ev.preventDefault();
            // Use CSS for some commands
            if (["foreColor"].includes(command)) {
                document.execCommand("styleWithCSS", null, true);
                document.execCommand(command, false, param);
                return document.execCommand("styleWithCSS", null, false);
            }
            else {
                return document.execCommand(command, false, param);
            }
        };
        this.handleCreateLink = (ev) => {
            // Don't lose focus
            ev.preventDefault();
            // Ask for url
            const url = window.prompt("Enter URL to link to");
            if (url) {
                document.execCommand("createLink", false, url);
            }
        };
        this.handleEditorClick = (ev) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            // Be sure focused
            if (!this.state.focused) {
                this.setState({ focused: true });
            }
            if (((_a = ev.target.dataset) === null || _a === void 0 ? void 0 : _a.embed) || ((_c = (_b = ev.target.parentElement) === null || _b === void 0 ? void 0 : _b.dataset) === null || _c === void 0 ? void 0 : _c.embed)) {
                const item = JSON.parse(((_d = ev.target.dataset) === null || _d === void 0 ? void 0 : _d.embed) || ((_f = (_e = ev.target.parentElement) === null || _e === void 0 ? void 0 : _e.dataset) === null || _f === void 0 ? void 0 : _f.embed));
                if (item != null) {
                    return (_h = (_g = this.props).onItemClick) === null || _h === void 0 ? void 0 : _h.call(_g, item);
                }
            }
        };
        this.renderPaletteContent = (schemeName, { edges }) => {
            return R("div", {
                key: "palette",
                className: "mwater-visualization-text-palette",
                ref: (c) => {
                    this.paletteComponent = c;
                },
            }, R("div", {
                key: "bold",
                className: "mwater-visualization-text-palette-item",
                onMouseDown: this.handleCommand.bind(null, "bold", null),
            }, R("b", null, "B")), R("div", {
                key: "italic",
                className: "mwater-visualization-text-palette-item",
                onMouseDown: this.handleCommand.bind(null, "italic", null),
            }, R("i", null, "I")), R("div", {
                key: "underline",
                className: "mwater-visualization-text-palette-item",
                onMouseDown: this.handleCommand.bind(null, "underline", null),
            }, R("span", { style: { textDecoration: "underline" } }, "U")), R(FontColorPaletteItem_1.default, {
                key: "foreColor",
                onSetColor: this.handleSetFontColor,
                position: schemeName === "over" ? "under" : "over",
            }), R(FontSizePaletteItem_1.default, {
                key: "fontSize",
                onSetSize: this.handleSetFontSize,
                position: schemeName === "over" ? "under" : "over",
            }), R("div", { key: "link", className: "mwater-visualization-text-palette-item", onMouseDown: this.handleCreateLink }, R("i", { className: "fa fa-link" })), R("div", {
                key: "justifyLeft",
                className: "mwater-visualization-text-palette-item",
                onMouseDown: this.handleCommand.bind(null, "justifyLeft", null),
            }, R("i", { className: "fa fa-align-left" })), R("div", {
                key: "justifyCenter",
                className: "mwater-visualization-text-palette-item",
                onMouseDown: this.handleCommand.bind(null, "justifyCenter", null),
            }, R("i", { className: "fa fa-align-center" })), R("div", {
                key: "justifyRight",
                className: "mwater-visualization-text-palette-item",
                onMouseDown: this.handleCommand.bind(null, "justifyRight", null),
            }, R("i", { className: "fa fa-align-right" })), R("div", {
                key: "justifyFull",
                className: "mwater-visualization-text-palette-item",
                onMouseDown: this.handleCommand.bind(null, "justifyFull", null),
            }, R("i", { className: "fa fa-align-justify" })), R("div", {
                key: "insertUnorderedList",
                className: "mwater-visualization-text-palette-item",
                onMouseDown: this.handleCommand.bind(null, "insertUnorderedList", null),
            }, R("i", { className: "fa fa-list-ul" })), R("div", {
                key: "insertOrderedList",
                className: "mwater-visualization-text-palette-item",
                onMouseDown: this.handleCommand.bind(null, "insertOrderedList", null),
            }, R("i", { className: "fa fa-list-ol" })), this.props.includeHeadings
                ? [
                    R("div", {
                        key: "h1",
                        className: "mwater-visualization-text-palette-item",
                        onMouseDown: this.handleCommand.bind(null, "formatBlock", "<H1>"),
                    }, R("i", { className: "fa fa-header" })),
                    R("div", {
                        key: "h2",
                        className: "mwater-visualization-text-palette-item",
                        onMouseDown: this.handleCommand.bind(null, "formatBlock", "<H2>"),
                    }, R("i", { className: "fa fa-header", style: { fontSize: "80%" } })),
                    R("div", {
                        key: "p",
                        className: "mwater-visualization-text-palette-item",
                        onMouseDown: this.handleCommand.bind(null, "formatBlock", "<div>"),
                    }, "\u00b6"),
                ]
                : undefined, R("div", {
                key: "removeFormat",
                className: "mwater-visualization-text-palette-item",
                onMouseDown: this.handleCommand.bind(null, "removeFormat", null),
                style: { paddingLeft: 5, paddingRight: 5 },
            }, R("img", { src: removeFormatIcon, style: { height: 20 } })), this.props.extraPaletteButtons);
        };
        this.refContentEditable = (c) => {
            this.contentEditable = c;
        };
        this.state = {
            focused: false,
        };
    }
    // Paste HTML in
    pasteHTML(html) {
        this.contentEditable.pasteHTML(html);
    }
    focus() {
        this.contentEditable.focus();
    }
    createHtml() {
        return this.props.itemsHtmlConverter.convertItemsToHtml(this.props.items);
    }
    renderPalette() {
        return R(react_float_affixed_1.default, {
            style: { zIndex: 9999 },
            edges: "over,under,left,right",
            align: "center",
            render: this.renderPaletteContent,
        });
    }
    renderHtml() {
        var _a;
        if (this.props.onItemsChange != null) {
            return R("div", { key: "contents", style: this.props.style, className: this.props.className }, R(mwater_expressions_ui_1.ContentEditableComponent, {
                ref: this.refContentEditable,
                style: { outline: "none" },
                html: this.createHtml(),
                onChange: this.handleChange,
                onClick: this.handleEditorClick,
                onFocus: this.handleFocus,
                onBlur: this.handleBlur,
            }), ((_a = this.props.items) === null || _a === void 0 ? void 0 : _a[0]) == null
                ? R("div", {
                    key: "placeholder",
                    style: { color: "#DDD", position: "absolute", top: 0, left: 0, right: 0, pointerEvents: "none" },
                }, "Click to Edit")
                : undefined);
        }
        else {
            return R("div", {
                key: "contents",
                style: this.props.style,
                className: this.props.className,
                dangerouslySetInnerHTML: { __html: this.createHtml() },
            });
        }
    }
    render() {
        return R("div", {
            style: { position: "relative" },
            ref: (c) => {
                this.entireComponent = c;
            },
        }, this.renderHtml(), this.state.focused ? this.renderPalette() : undefined);
    }
}
exports.default = RichTextComponent;
RichTextComponent.defaultProps = {
    includeHeadings: true,
    items: [],
    itemsHtmlConverter: new ItemsHtmlConverter_1.default(),
};
var removeFormatIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAr0lEQVQ4y91U2w3CMAy8VB0kbFA2YYVuABOZbsAmGaFscnzgSlGSBgfCB1g6OXbkkx+yHUn0lgFfkN8hHSt/lma71kxdhIv6Dom/HGicflB97NVTD2ACsPQc1En1zUpqKb+pdEumzaVbSNPSRRFL7iNZQ1BstvApsmODZJXUa8A58W9Ea4nwFWkNa0Sc/Q+F1dyDRD30AO6qJV/wtgxNPR3fOEJXALO+5092/0+P9APt7i9xOIlepwAAAABJRU5ErkJggg==";
