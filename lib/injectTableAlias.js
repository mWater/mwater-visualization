"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
const lodash_1 = __importDefault(require("lodash"));
// Recursively inject table alias tableAlias for `{alias}`
function injectTableAlias(jsonql, tableAlias) {
    // Handle empty
    if (!jsonql) {
        return jsonql;
    }
    // Handle arrays
    if (lodash_1.default.isArray(jsonql)) {
        return lodash_1.default.map(jsonql, (item) => injectTableAlias(item, tableAlias));
    }
    // Handle non-objects by leaving alone
    if (!lodash_1.default.isObject(jsonql)) {
        return jsonql;
    }
    // Handle field
    if (jsonql.type === "field" && jsonql.tableAlias === "{alias}") {
        return lodash_1.default.extend({}, jsonql, { tableAlias });
    }
    // Recurse object keys
    return lodash_1.default.mapValues(jsonql, (value) => injectTableAlias(value, tableAlias));
}
exports.default = injectTableAlias;
