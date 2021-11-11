"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const ItemsHtmlConverter_1 = __importDefault(require("./ItemsHtmlConverter"));
const mwater_expressions_1 = require("mwater-expressions");
const uuid_1 = __importDefault(require("uuid"));
const valueFormatter_1 = require("../valueFormatter");
const valueFormatter_2 = require("../valueFormatter");
// ItemsHtmlConverter that supports embedded mwater expressions
// Converts items (JSON contents of rich text) to HTML and back to allow editing
// Items are array of:
//  string (html text)
//  { type: "element", tag: "h1", items: [nested items] }
//  { type: "expr", id: unique id, expr: expression, includeLabel: true to include label, labelText: override label text, format: d3 format if number }
class ExprItemsHtmlConverter extends ItemsHtmlConverter_1.default {
    // designMode is true to display in design mode (exprs as blocks)
    // exprValues is map of expr id to value
    // summarizeExprs shows summaries of expressions, not values
    // namedStrings: Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget
    // locale: locale to use e.g. "en"
    constructor(schema, designMode, exprValues, summarizeExprs, namedStrings, locale) {
        super(namedStrings);
        this.schema = schema;
        this.designMode = designMode;
        this.exprValues = exprValues;
        this.summarizeExprs = summarizeExprs;
        this.locale = locale;
    }
    // Converts an item that is not an element to html. Override in subclass.
    // To be reversible, should contain data-embed which contains JSON of item
    convertSpecialItemToHtml(item) {
        let html = "";
        if (item.type === "expr") {
            let exprHtml, text;
            if (this.summarizeExprs) {
                text = new mwater_expressions_1.ExprUtils(this.schema).summarizeExpr(item.expr, this.locale);
                if (text.length > 30) {
                    text = text.substr(0, 30) + "...";
                }
                exprHtml = lodash_1.default.escape(text);
            }
            else if (lodash_1.default.has(this.exprValues, item.id)) {
                // If has data
                const exprUtils = new mwater_expressions_1.ExprUtils(this.schema);
                const value = this.exprValues[item.id];
                if (value != null) {
                    // Get expression type
                    const exprType = exprUtils.getExprType(item.expr);
                    // Format if can format
                    if (exprType && valueFormatter_2.canFormatType(exprType)) {
                        text = valueFormatter_1.formatValue(exprType, value, item.format);
                    }
                    else {
                        text = exprUtils.stringifyExprLiteral(item.expr, value, this.locale);
                    }
                    exprHtml = lodash_1.default.escape(text);
                }
                else {
                    exprHtml = '<span style="color: #DDD">---</span>';
                }
            }
            else {
                // Placeholder
                exprHtml = '<span class="text-muted">\u25a0\u25a0\u25a0</span>';
            }
            // Add label
            if (item.includeLabel) {
                const label = item.labelText || new mwater_expressions_1.ExprUtils(this.schema).summarizeExpr(item.expr, this.locale) + ":\u00A0";
                exprHtml = '<span class="text-muted">' + lodash_1.default.escape(label) + "</span>" + exprHtml;
            }
            if (this.designMode) {
                html +=
                    '\u2060<span data-embed="' +
                        lodash_1.default.escape(JSON.stringify(item)) +
                        '" class="mwater-visualization-text-widget-expr">' +
                        (exprHtml || "\u00A0") +
                        "</span>\u2060";
            }
            else {
                // View mode
                html += exprHtml;
            }
        }
        return html;
    }
    convertElemToItems(elem) {
        const items = super.convertElemToItems(elem);
        // Ensure exprs have unique ids
        const takenIds = {};
        var uniqueify = (items) => {
            for (let item of items) {
                if (item.type === "expr") {
                    if (takenIds[item.id]) {
                        item.id = uuid_1.default();
                    }
                    takenIds[item.id] = true;
                }
                if (item.items) {
                    uniqueify(item.items);
                }
            }
        };
        uniqueify(items);
        return items;
    }
}
exports.default = ExprItemsHtmlConverter;
