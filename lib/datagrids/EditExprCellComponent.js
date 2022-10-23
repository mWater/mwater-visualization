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
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importStar(require("react"));
const R = react_1.default.createElement;
const mwater_expressions_1 = require("mwater-expressions");
const moment_1 = __importDefault(require("moment"));
// Cell allows editing an expression column cell
// Store edited value here to prevent slow re-render of entire datagrid
class EditExprCellComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleChange = (value) => {
            this.setState({ value });
        };
        this.state = { value: props.value };
    }
    getValue() {
        return this.state.value;
    }
    // Check if edit value has changed
    hasChanged() {
        return !lodash_1.default.isEqual(this.props.value, this.state.value);
    }
    render() {
        const exprUtils = new mwater_expressions_1.ExprUtils(this.props.schema);
        // Get expression type
        const exprType = exprUtils.getExprType(this.props.expr);
        switch (exprType) {
            case "text":
                return R(TextEditComponent, {
                    value: this.state.value,
                    onChange: this.handleChange,
                    onSave: this.props.onSave,
                    onCancel: this.props.onCancel
                });
            case "number":
                return R(NumberEditComponent, {
                    value: this.state.value,
                    onChange: this.handleChange,
                    onSave: this.props.onSave,
                    onCancel: this.props.onCancel
                });
            case "enum":
                return R(EnumEditComponent, {
                    value: this.state.value,
                    onChange: this.handleChange,
                    enumValues: exprUtils.getExprEnumValues(this.props.expr),
                    onSave: this.props.onSave,
                    onCancel: this.props.onCancel,
                    locale: this.props.locale
                });
            case "date":
            case "datetime":
                return R(DateEditComponent, {
                    value: this.state.value,
                    onChange: this.handleChange,
                    onSave: this.props.onSave,
                    onCancel: this.props.onCancel,
                    datetime: exprType === "datetime"
                });
        }
        throw new Error(`Unsupported type ${exprType} for editing`);
    }
}
exports.default = EditExprCellComponent;
// Simple text box
class TextEditComponent extends react_1.default.Component {
    componentDidMount() {
        var _a;
        // Focus when created
        return (_a = this.input) === null || _a === void 0 ? void 0 : _a.focus();
    }
    render() {
        return R("div", { style: { paddingTop: 3 } }, R("input", {
            ref: (c) => {
                this.input = c;
            },
            type: "text",
            className: "form-control",
            value: this.props.value || "",
            onChange: (ev) => this.props.onChange(ev.target.value || null),
            onKeyUp: (ev) => {
                if (ev.keyCode === 27) {
                    this.props.onCancel();
                }
                if (ev.keyCode === 13) {
                    return this.props.onSave();
                }
            }
        }));
    }
}
// Simple number box
class NumberEditComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleChange = (ev) => {
            if (ev.target.value) {
                return this.props.onChange(parseFloat(ev.target.value));
            }
            else {
                return this.props.onChange(null);
            }
        };
    }
    componentDidMount() {
        var _a;
        // Focus when created
        return (_a = this.input) === null || _a === void 0 ? void 0 : _a.focus();
    }
    render() {
        return R("div", { style: { paddingTop: 3 } }, R("input", {
            ref: (c) => {
                return (this.input = c);
            },
            type: "number",
            step: "any",
            className: "form-control",
            value: this.props.value != null ? this.props.value : "",
            onChange: this.handleChange,
            onKeyUp: (ev) => {
                if (ev.keyCode === 27) {
                    this.props.onCancel();
                }
                if (ev.keyCode === 13) {
                    return this.props.onSave();
                }
            }
        }));
    }
}
// Simple enum box
class EnumEditComponent extends react_1.default.Component {
    render() {
        return R("div", { style: { paddingTop: 3 } }, R("select", {
            value: this.props.value || "",
            onChange: (ev) => this.props.onChange(ev.target.value || null),
            className: "form-select"
        }, R("option", { key: "", value: "" }, ""), lodash_1.default.map(this.props.enumValues, (ev) => {
            return R("option", { key: ev.id, value: ev.id }, mwater_expressions_1.ExprUtils.localizeString(ev.name, this.props.locale));
        })));
    }
}
/** Simple date editor */
function DateEditComponent(props) {
    // // Focus when created
    // return this.input?.focus()
    // Format date
    const [valueStr, setValueStr] = (0, react_1.useState)(props.datetime ?
        (props.value ? (0, moment_1.default)(props.value, moment_1.default.ISO_8601).format("YYYY-MM-DD HH:mm") : "")
        : props.value || "");
    const [isValid, setIsValid] = (0, react_1.useState)(true);
    // Parse date
    function parseDate(value) {
        if (!value) {
            setIsValid(true);
            return null;
        }
        const m = (0, moment_1.default)(value, props.datetime ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD");
        if (!m.isValid()) {
            setIsValid(false);
            return null;
        }
        setIsValid(true);
        if (props.datetime) {
            return m.toISOString();
        }
        else {
            return m.format("YYYY-MM-DD");
        }
    }
    return react_1.default.createElement("div", { style: { paddingTop: 3 } },
        react_1.default.createElement("input", { type: "text", className: "form-control", value: valueStr, style: { backgroundColor: isValid ? "white" : "pink" }, onChange: ev => {
                setValueStr(ev.target.value);
                props.onChange(parseDate(ev.target.value));
            }, ref: c => {
                if (c) {
                    c.focus();
                }
            }, onKeyUp: (ev) => {
                if (ev.keyCode === 27) {
                    props.onCancel();
                }
                if (ev.keyCode === 13) {
                    return props.onSave();
                }
            } }));
}
