"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var prop_types_1 = __importDefault(require("prop-types"));
/** Adds the locale to the context */
var LocaleContextInjector = /** @class */ (function (_super) {
    __extends(LocaleContextInjector, _super);
    function LocaleContextInjector() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LocaleContextInjector.prototype.getChildContext = function () {
        return { locale: this.props.locale };
    };
    LocaleContextInjector.prototype.render = function () {
        return this.props.children;
    };
    LocaleContextInjector.childContextTypes = {
        locale: prop_types_1.default.string
    };
    return LocaleContextInjector;
}(react_1.default.Component));
exports.default = LocaleContextInjector;
