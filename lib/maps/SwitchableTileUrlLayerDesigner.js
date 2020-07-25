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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var R = react_1.default.createElement;
var immer_1 = require("immer");
var EditPopupComponent = require('./EditPopupComponent');
var ZoomLevelsComponent = require('./ZoomLevelsComponent');
var bootstrap_1 = require("react-library/lib/bootstrap");
var AdminScopeAndDetailLevelComponent = require('./AdminScopeAndDetailLevelComponent');
var ScopeAndDetailLevelComponent = require('./ScopeAndDetailLevelComponent');
/** Designer for a switchable tile url layer */
var SwitchableTileUrlLayerDesigner = /** @class */ (function (_super) {
    __extends(SwitchableTileUrlLayerDesigner, _super);
    function SwitchableTileUrlLayerDesigner() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleChange = function (activeOption) {
            _this.props.onDesignChange(__assign(__assign({}, _this.props.design), { activeOption: activeOption }));
        };
        return _this;
    }
    SwitchableTileUrlLayerDesigner.prototype.update = function (mutation) {
        this.props.onDesignChange(immer_1.produce(this.props.design, mutation));
    };
    SwitchableTileUrlLayerDesigner.prototype.render = function () {
        var _this = this;
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("div", { className: "text-muted", style: { paddingBottom: 5 } }, this.props.design.note),
            this.props.design.options.map(function (opt) {
                return react_1.default.createElement(bootstrap_1.Radio, { key: opt.id, value: _this.props.design.activeOption, radioValue: opt.id, onChange: _this.handleChange, inline: false }, opt.name);
            })));
    };
    return SwitchableTileUrlLayerDesigner;
}(react_1.default.Component));
exports.default = SwitchableTileUrlLayerDesigner;
