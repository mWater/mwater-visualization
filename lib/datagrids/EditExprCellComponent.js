"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const mwater_expressions_1 = require("mwater-expressions");
// Cell allows editing an expression column cell
// Store edited value here to prevent slow re-render of entire datagrid
class EditExprCellComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleChange = (value) => {
            return this.setState({ value });
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
                break;
            case "number":
                return R(NumberEditComponent, {
                    value: this.state.value,
                    onChange: this.handleChange,
                    onSave: this.props.onSave,
                    onCancel: this.props.onCancel
                });
                break;
            case "enum":
                return R(EnumEditComponent, {
                    value: this.state.value,
                    onChange: this.handleChange,
                    enumValues: exprUtils.getExprEnumValues(this.props.expr),
                    onSave: this.props.onSave,
                    onCancel: this.props.onCancel,
                    locale: this.props.locale
                });
                break;
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
                return (this.input = c);
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
            className: "form-control"
        }, R("option", { key: "", value: "" }, ""), lodash_1.default.map(this.props.enumValues, (ev) => {
            return R("option", { key: ev.id, value: ev.id }, mwater_expressions_1.ExprUtils.localizeString(ev.name, this.props.locale));
        })));
    }
}
