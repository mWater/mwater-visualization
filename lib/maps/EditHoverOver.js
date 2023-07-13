"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const mwater_expressions_ui_1 = require("mwater-expressions-ui");
const react_1 = __importStar(require("react"));
const ModalWindowComponent_1 = __importDefault(require("react-library/lib/ModalWindowComponent"));
const ui = __importStar(require("react-library/lib/bootstrap"));
const uuid_1 = __importDefault(require("uuid"));
const EditHoverOver = props => {
    var _a, _b, _c, _d, _e;
    const [editing, setEditing] = (0, react_1.useState)(false);
    const handleRemovePopup = () => {
        const design = (0, lodash_1.omit)(props.design, "hoverOver");
        props.onDesignChange(design);
    };
    const handleDesignChange = (items) => {
        var _a;
        const hoverOver = Object.assign(Object.assign({}, ((_a = props.design.hoverOver) !== null && _a !== void 0 ? _a : {})), { items });
        const design = Object.assign(Object.assign({}, props.design), { hoverOver });
        return props.onDesignChange(design);
    };
    const handleItemChange = (item) => {
        var _a, _b;
        const items = ((_b = (_a = props.design.hoverOver) === null || _a === void 0 ? void 0 : _a.items) !== null && _b !== void 0 ? _b : []).map((i) => (item.id === i.id ? item : i));
        const design = Object.assign(Object.assign({}, props.design), { hoverOver: Object.assign(Object.assign({}, props.design.hoverOver), { items }) });
        return props.onDesignChange(design);
    };
    const handleItemDelete = (item) => {
        var _a, _b;
        const items = ((_b = (_a = props.design.hoverOver) === null || _a === void 0 ? void 0 : _a.items) !== null && _b !== void 0 ? _b : []).filter((i) => item.id !== i.id);
        const design = Object.assign(Object.assign({}, props.design), { hoverOver: Object.assign(Object.assign({}, props.design.hoverOver), { items }) });
        return props.onDesignChange(design);
    };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("button", { className: "btn btn-link", onClick: () => setEditing(true) },
            react_1.default.createElement("span", { className: "fa fa-pencil" }),
            "Customize Hover over"),
        props.design.hoverOver && (react_1.default.createElement("button", { className: "btn btn-link", onClick: handleRemovePopup },
            react_1.default.createElement("span", { className: "fa fa-times" }),
            "Remove Hover over")),
        editing && (react_1.default.createElement(ModalWindowComponent_1.default, { isOpen: true, onRequestClose: () => setEditing(false) },
            ((_b = (_a = props.design.hoverOver) === null || _a === void 0 ? void 0 : _a.items) !== null && _b !== void 0 ? _b : []).length > 0 && (react_1.default.createElement("table", { className: "table" },
                react_1.default.createElement("thead", null,
                    react_1.default.createElement("tr", null,
                        react_1.default.createElement("th", null, "Label"),
                        react_1.default.createElement("th", null, "Value"),
                        react_1.default.createElement("th", null))),
                react_1.default.createElement("tbody", null, (_c = props.design.hoverOver) === null || _c === void 0 ? void 0 : _c.items.map((item) => (react_1.default.createElement(HoverOverItemEditor, { schema: props.schema, dataSource: props.dataSource, table: props.design.table, onItemChange: handleItemChange, onItemDelete: handleItemDelete, item: item })))))),
            ((_e = (_d = props.design.hoverOver) === null || _d === void 0 ? void 0 : _d.items) !== null && _e !== void 0 ? _e : []).length < 3 && (react_1.default.createElement("button", { className: "btn btn-link", onClick: () => {
                    var _a, _b;
                    return handleDesignChange([
                        ...((_b = (_a = props.design.hoverOver) === null || _a === void 0 ? void 0 : _a.items) !== null && _b !== void 0 ? _b : []),
                        { id: (0, uuid_1.default)().replace(/-/g, ""), label: "" }
                    ]);
                } },
                react_1.default.createElement("span", { className: "fa fa-plus" }),
                "Add item"))))));
};
const HoverOverItemEditor = ({ schema, dataSource, table, item, onItemChange, onItemDelete }) => {
    var _a;
    return (react_1.default.createElement("tr", null,
        react_1.default.createElement("td", null,
            react_1.default.createElement(ui.TextInput, { value: item.label, onChange: value => onItemChange(Object.assign(Object.assign({}, item), { label: value })) })),
        react_1.default.createElement("td", null,
            react_1.default.createElement(mwater_expressions_ui_1.ExprComponent, { schema: schema, dataSource: dataSource, table: table, types: ["text", "number", "enum", "boolean", "date", "datetime", "id"], onChange: expr => onItemChange(Object.assign(Object.assign({}, item), { value: expr })), value: (_a = item.value) !== null && _a !== void 0 ? _a : null, aggrStatuses: ["individual", "literal", "aggregate"] })),
        react_1.default.createElement("td", null,
            react_1.default.createElement("button", { className: "btn btn-link", onClick: () => onItemDelete(item) },
                react_1.default.createElement("span", { className: "fa fa-close" })))));
};
exports.default = EditHoverOver;
