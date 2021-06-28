"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutOptionsComponent = void 0;
const react_1 = __importDefault(require("react"));
const react_2 = require("react");
const bootstrap_1 = require("react-library/lib/bootstrap");
const layoutOptions_1 = require("./layoutOptions");
const sizeOptions = [
    { value: { width: 360, height: 640 }, label: "Phone (360x640)" },
    { value: { width: 768, height: 1024 }, label: "Tablet (768x1024)" },
    { value: { width: 1000, height: 800 }, label: "Laptop (1000x800)" },
    { value: { width: 1280, height: 1024 }, label: "Desktop (1280x1024)" }
];
function LayoutOptionsComponent(props) {
    const [previewSize, setPreviewSize] = react_2.useState(2);
    const layoutOptions = layoutOptions_1.getLayoutOptions(props.design);
    function setLayoutOptions(layoutOptions) {
        props.onDesignChange(Object.assign(Object.assign({}, props.design), { layoutOptions }));
    }
    function handleResetDefaults() {
        props.onDesignChange(Object.assign(Object.assign({}, props.design), { layoutOptions: layoutOptions_1.getDefaultLayoutOptions(props.design.style) }));
    }
    return (react_1.default.createElement("div", { style: { display: "grid", gridTemplateRows: "auto 1fr", gridTemplateColumns: "auto 1fr", height: "100%" } },
        react_1.default.createElement("div", { style: { padding: 5, gridRow: "1 / 3" } },
            react_1.default.createElement("div", { key: "back" },
                react_1.default.createElement("button", { className: "btn btn-xs btn-link", onClick: props.onClose },
                    react_1.default.createElement("i", { className: "fa fa-arrow-left" }),
                    " Close")),
            react_1.default.createElement("br", null),
            react_1.default.createElement(ThemeToggle, { theme: props.design.style, onChange: (theme) => {
                    props.onDesignChange(Object.assign(Object.assign({}, props.design), { style: theme, layoutOptions: layoutOptions_1.getDefaultLayoutOptions(theme) }));
                } }),
            react_1.default.createElement("br", null),
            react_1.default.createElement("h4", null, "Advanced"),
            react_1.default.createElement("a", { className: "btn btn-xs btn-link", style: { float: "right" }, onClick: handleResetDefaults }, "Reset to Defaults"),
            react_1.default.createElement(bootstrap_1.FormGroup, { label: "Collapse to Single Column" },
                react_1.default.createElement(WidthSelector, { value: layoutOptions.collapseColumnsWidth, onChange: (collapseColumnsWidth) => {
                        setLayoutOptions(Object.assign(Object.assign({}, layoutOptions), { collapseColumnsWidth }));
                    }, sign: "< " })),
            react_1.default.createElement(bootstrap_1.FormGroup, { label: "Hide Quickfilters" },
                react_1.default.createElement(WidthSelector, { value: layoutOptions.hideQuickfiltersWidth, onChange: (hideQuickfiltersWidth) => {
                        setLayoutOptions(Object.assign(Object.assign({}, layoutOptions), { hideQuickfiltersWidth }));
                    }, sign: "< " })),
            react_1.default.createElement(bootstrap_1.FormGroup, { label: "Minimum Width (before scrolling or scaling)" },
                react_1.default.createElement(WidthSelector, { value: layoutOptions.minimumWidth, onChange: (minimumWidth) => {
                        setLayoutOptions(Object.assign(Object.assign({}, layoutOptions), { minimumWidth }));
                    }, sign: "< " }),
                react_1.default.createElement(bootstrap_1.FormGroup, { label: "When Below Minimum Width" },
                    react_1.default.createElement(bootstrap_1.Toggle, { value: layoutOptions.belowMinimumWidth, onChange: (belowMinimumWidth) => {
                            setLayoutOptions(Object.assign(Object.assign({}, layoutOptions), { belowMinimumWidth: belowMinimumWidth }));
                        }, options: [
                            { value: "scroll", label: "Scroll" },
                            { value: "scale", label: "Scale" }
                        ] }))),
            react_1.default.createElement(bootstrap_1.FormGroup, { label: "Maximum Width (before padding)" },
                react_1.default.createElement(WidthSelector, { value: layoutOptions.maximumWidth, onChange: (maximumWidth) => {
                        setLayoutOptions(Object.assign(Object.assign({}, layoutOptions), { maximumWidth }));
                    }, sign: "> " }))),
        react_1.default.createElement("div", { style: { textAlign: "center", padding: 3 } },
            react_1.default.createElement("span", { className: "text-muted" }, "Preview As:\u00A0"),
            react_1.default.createElement(bootstrap_1.Toggle, { value: previewSize, onChange: setPreviewSize, size: "xs", options: sizeOptions.map((so, index) => ({ value: index, label: so.label })) })),
        react_1.default.createElement("div", { style: { overflow: "auto" } },
            react_1.default.createElement("div", { style: {
                    display: "grid",
                    gridTemplateColumns: `1fr ${sizeOptions[previewSize].value.width}px 1fr`,
                    gridTemplateRows: `1fr ${sizeOptions[previewSize].value.height}px 1fr`,
                    height: "100%",
                    border: "solid 1px #AAA"
                } },
                react_1.default.createElement("div", { style: { backgroundColor: "#888", gridColumn: "1 / 4" } }),
                react_1.default.createElement("div", { style: { backgroundColor: "#888" } }),
                react_1.default.createElement("div", { style: { height: "100%", display: "grid", gridTemplateRows: "auto 1fr" } },
                    react_1.default.createElement("div", { key: "quickfilters" }, layoutOptions.hideQuickfiltersWidth == null ||
                        sizeOptions[previewSize].value.width > layoutOptions.hideQuickfiltersWidth
                        ? props.quickfiltersView
                        : null),
                    props.dashboardView),
                react_1.default.createElement("div", { style: { backgroundColor: "#888" } }),
                react_1.default.createElement("div", { style: { backgroundColor: "#888", gridColumn: "1 / 4" } })))));
}
exports.LayoutOptionsComponent = LayoutOptionsComponent;
function ThemeToggle(props) {
    function renderStyleItem(theme) {
        const isActive = (props.theme || "default") == theme;
        if (theme == "default") {
            return (react_1.default.createElement("a", { key: theme, className: isActive ? "list-group-item active" : "list-group-item", onClick: props.onChange.bind(null, "default") },
                react_1.default.createElement("div", null, "Classic Dashboard"),
                react_1.default.createElement("div", { style: { opacity: 0.6 } }, "Ideal for data display with minimal text")));
        }
        if (theme == "greybg") {
            return (react_1.default.createElement("a", { key: theme, className: isActive ? "list-group-item active" : "list-group-item", onClick: props.onChange.bind(null, "greybg") },
                react_1.default.createElement("div", null, "Framed Dashboard"),
                react_1.default.createElement("div", { style: { opacity: 0.6 } }, "Each widget is white on a grey background")));
        }
        if (theme == "story") {
            return (react_1.default.createElement("a", { key: theme, className: isActive ? "list-group-item active" : "list-group-item", onClick: props.onChange.bind(null, "story") },
                react_1.default.createElement("div", null, "Story"),
                react_1.default.createElement("div", { style: { opacity: 0.6 } }, "Ideal for data-driven storytelling with lots of text")));
        }
        return null;
    }
    return (react_1.default.createElement(bootstrap_1.FormGroup, { label: "Theme" },
        renderStyleItem("default"),
        renderStyleItem("greybg"),
        renderStyleItem("story")));
}
function WidthSelector(props) {
    return (react_1.default.createElement(bootstrap_1.Select, { value: props.value, onChange: props.onChange, nullLabel: "N/A", options: [
            { value: 400, label: `${props.sign}400px (Phone)` },
            { value: 600, label: `${props.sign}600px (Small tablet)` },
            { value: 800, label: `${props.sign}800px (Tablet)` },
            { value: 1000, label: `${props.sign}1000px (Laptop)` },
            { value: 1200, label: `${props.sign}1200px (Desktop)` },
            { value: 1600, label: `${props.sign}1600px (Wide Desktop)` }
        ] }));
}
