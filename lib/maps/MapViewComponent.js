"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapViewComponent = void 0;
const react_1 = __importDefault(require("react"));
const OldMapViewComponent_1 = __importDefault(require("./OldMapViewComponent"));
/** Component that displays just the map */
function MapViewComponent(props) {
    // if (window.localStorage.getItem("newmaps") == "true") {
    //   return <NewMapViewComponent {...props}/>
    // }
    // else {
    return react_1.default.createElement(OldMapViewComponent_1.default, Object.assign({}, props));
    // }
}
exports.MapViewComponent = MapViewComponent;
