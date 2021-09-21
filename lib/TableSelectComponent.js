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
const lodash_1 = __importDefault(require("lodash"));
const prop_types_1 = __importDefault(require("prop-types"));
const react_1 = __importDefault(require("react"));
const ui = __importStar(require("./UIComponents"));
const mwater_expressions_1 = require("mwater-expressions");
const R = react_1.default.createElement;
class TableSelectComponent extends react_1.default.Component {
    render() {
        var _a;
        if (this.context.tableSelectElementFactory) {
            return this.context.tableSelectElementFactory(this.props);
        }
        return react_1.default.createElement(ui.ToggleEditComponent, {
            forceOpen: !this.props.value,
            label: this.props.value
                ? mwater_expressions_1.ExprUtils.localizeString(((_a = this.props.schema.getTable(this.props.value)) === null || _a === void 0 ? void 0 : _a.name) || "(not found)", this.context.locale)
                : R("i", null, "Select..."),
            editor: (onClose) => {
                return react_1.default.createElement(ui.OptionListComponent, {
                    hint: "Select source to get data from",
                    items: lodash_1.default.map(lodash_1.default.filter(this.props.schema.getTables(), (table) => !table.deprecated), (table) => ({
                        name: mwater_expressions_1.ExprUtils.localizeString(table.name, this.context.locale),
                        desc: mwater_expressions_1.ExprUtils.localizeString(table.desc, this.context.locale),
                        onClick: () => {
                            onClose();
                            return this.props.onChange(table.id);
                        }
                    }))
                });
            }
        });
    }
}
exports.default = TableSelectComponent;
TableSelectComponent.contextTypes = {
    tableSelectElementFactory: prop_types_1.default.func,
    locale: prop_types_1.default.string,
    // Optional list of tables (ids) being used. Some overrides of the table select component may use this to present
    // an initially short list to select from
    activeTables: prop_types_1.default.arrayOf(prop_types_1.default.string.isRequired)
};
