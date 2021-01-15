"use strict";
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
exports.MapViewComponent = void 0;
var react_1 = __importDefault(require("react"));
var NewMapViewComponent_1 = require("./NewMapViewComponent");
var OldMapViewComponent_1 = __importDefault(require("./OldMapViewComponent"));
/** Component that displays just the map */
function MapViewComponent(props) {
    if (window.localStorage.getItem("newmaps") == "true") {
        return react_1.default.createElement(NewMapViewComponent_1.NewMapViewComponent, __assign({}, props));
    }
    else {
        return react_1.default.createElement(OldMapViewComponent_1.default, __assign({}, props));
    }
}
exports.MapViewComponent = MapViewComponent;
