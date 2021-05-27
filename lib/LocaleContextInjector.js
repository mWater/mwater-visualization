"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const prop_types_1 = __importDefault(require("prop-types"));
/** Adds the locale to the context */
class LocaleContextInjector extends react_1.default.Component {
    getChildContext() {
        return { locale: this.props.locale };
    }
    render() {
        return this.props.children;
    }
}
exports.default = LocaleContextInjector;
LocaleContextInjector.childContextTypes = {
    locale: prop_types_1.default.string
};
