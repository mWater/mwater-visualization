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
exports.LayerSwitcherComponent = void 0;
var immer_1 = __importDefault(require("immer"));
var react_1 = __importStar(require("react"));
/** Component to switch layers on a map */
function LayerSwitcherComponent(props) {
    var _a = react_1.useState(false), dropdownOpen = _a[0], setDropdownOpen = _a[1];
    var iconStyle = {
        backgroundColor: "white",
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop: 3,
        paddingBottom: 3,
        borderRadius: 4,
        border: "solid 1px #AAA",
        color: "#666",
        position: "absolute",
        right: 0,
        top: 0,
        cursor: "pointer",
        fontSize: 14
    };
    function toggleDropdown() {
        setDropdownOpen(function (ddo) { return !ddo; });
    }
    function renderLayerView(lv, index) {
        function handleClick() {
            props.onDesignChange(immer_1.default(props.design, function (draft) {
                draft.layerViews[index].visible = !lv.visible;
                // Unselect any in same group if selected
                if (lv.group && !lv.visible) {
                    draft.layerViews.forEach(function (lv2, i) {
                        if (lv2.visible && i != index && lv2.group == lv.group) {
                            lv2.visible = false;
                        }
                    });
                }
            }));
        }
        return react_1.default.createElement("div", { key: index, style: { fontSize: 12, whiteSpace: "nowrap", cursor: "pointer" }, onClick: handleClick },
            react_1.default.createElement("i", { className: lv.visible ? "fa fa-fw fa-check-square text-primary" : "fa fa-fw fa-square text-muted" }),
            "\u00A0",
            lv.name);
    }
    return react_1.default.createElement("div", { style: { position: "absolute", top: 20, right: 20, zIndex: 1000, userSelect: "none" }, ref: useClickOutside(function () { setDropdownOpen(false); }) },
        react_1.default.createElement("div", { style: iconStyle, onClick: toggleDropdown },
            react_1.default.createElement("i", { className: "fas fa-layer-group fa-fw" })),
        dropdownOpen ?
            react_1.default.createElement("div", { style: { backgroundColor: "white", position: "absolute", top: 28, right: 0, padding: 5 } }, props.design.layerViews.map(renderLayerView))
            : null);
}
exports.LayerSwitcherComponent = LayerSwitcherComponent;
/** Hook for click outside catching */
function useClickOutside(onClickOut) {
    var node = react_1.useRef(null);
    var handleClick = function (e) {
        var nodeRef = node.current;
        // If inside click
        if (nodeRef && nodeRef.contains(e.target)) {
            return;
        }
        // If outside click
        onClickOut();
    };
    react_1.useEffect(function () {
        document.addEventListener("mousedown", handleClick);
        return function () { document.removeEventListener("mousedown", handleClick); };
    }, []);
    return node;
}
