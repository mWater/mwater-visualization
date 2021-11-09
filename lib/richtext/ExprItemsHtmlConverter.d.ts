import ItemsHtmlConverter from "./ItemsHtmlConverter";
import { Schema } from "mwater-expressions";
export default class ExprItemsHtmlConverter extends ItemsHtmlConverter {
    constructor(schema: Schema, designMode: any, exprValues: any, summarizeExprs: any, namedStrings: any, locale: any);
    convertSpecialItemToHtml(item: any): string;
    convertElemToItems(elem: any): any;
}
