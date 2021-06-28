"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let WidgetScoper;
const lodash_1 = __importDefault(require("lodash"));
// Scopes widgets, applying scope that a widget specifies to itself and the filter to other
// widgets. Immutable.
// Scope is a JSON object consisting of:
//  name: human-readable name for the scope/filter
//  filter: filter for other widgets in format { table: table id, jsonql: JsonQL with {alias} for the table name to filter by }
//  data: internal, opaque data that the widget understands. opaque
exports.default = WidgetScoper = class WidgetScoper {
    constructor(scopes) {
        this.scopes = scopes || {};
    }
    // Applies a scope to a particular widget. Filter will be applied to all others
    applyScope(widgetId, scope) {
        const data = {};
        data[widgetId] = scope;
        const scopes = lodash_1.default.extend({}, this.scopes, data);
        return new WidgetScoper(scopes);
    }
    // Gets the scope of a widget
    getScope(widgetId) {
        if (this.scopes[widgetId]) {
            return this.scopes[widgetId];
        }
    }
    // Gets lookup of scopes by widget id
    getScopes() {
        return this.scopes;
    }
    getFilters(widgetId) {
        const filters = [];
        for (let key in this.scopes) {
            const value = this.scopes[key];
            if (key !== widgetId && value && value.filter) {
                filters.push(value.filter);
            }
        }
        return filters;
    }
    reset() {
        return new WidgetScoper();
    }
};
