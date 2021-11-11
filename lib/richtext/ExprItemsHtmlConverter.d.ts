import ItemsHtmlConverter from "./ItemsHtmlConverter";
import { Expr, Schema } from "mwater-expressions";
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
    convertSpecialItemToHtml(item: any): string;
    convertElemToItems(elem: any): import("./ItemsHtmlConverter").HtmlItem[];
}
