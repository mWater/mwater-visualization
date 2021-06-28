"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
const pako_1 = __importDefault(require("pako"));
/*
Gzips and base64 encodes JSON object if larger than 100 bytes
*/
function default_1(json) {
    const str = JSON.stringify(json);
    if (str && str.length > 100) {
        return btoa(pako_1.default.deflate(str, { to: "string" }));
    }
    else {
        return str;
    }
}
exports.default = default_1;
