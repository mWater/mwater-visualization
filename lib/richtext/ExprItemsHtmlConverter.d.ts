import ItemsHtmlConverter, { HtmlItemBase } from "./ItemsHtmlConverter";
import { Expr, Schema } from "mwater-expressions";
export interface HtmlItemExpr extends HtmlItemBase {
    type: "expr";
    /** unique id */
    id: string;
    /** Expression to display */
    expr: Expr;
    /** true to include label */
    includeLabel?: boolean;
    /** override label text */
    labelText?: string;
    /** d3 format if number */
    format?: string;
}
/**
 * ItemsHtmlConverter that supports embedded mwater expressions
 * Converts items (JSON contents of rich text) to HTML and back to allow editing
 * Items are array of:
 *  string (html text)
 *  { type: "element", tag: "h1", items: [nested items] }
 *  { type: "expr", id: unique id, expr: expression, includeLabel: true to include label, labelText: override label text, format: d3 format if number }
 */
export default class ExprItemsHtmlConverter extends ItemsHtmlConverter {
    schema: Schema;
    designMode: boolean;
    exprValues: {
        [id: string]: Expr;
    };
    summarizeExprs: boolean;
    locale: string | undefined;
    constructor(schema: Schema, designMode: boolean, exprValues: {
        [id: string]: Expr;
    }, summarizeExprs: boolean, namedStrings?: {
        [key: string]: string;
    }, locale?: string);
    convertSpecialItemToHtml(item: HtmlItemBase): string;
    convertElemToItems(elem: HTMLElement): import("./ItemsHtmlConverter").HtmlItem[];
}
