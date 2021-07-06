import ItemsHtmlConverter from "./ItemsHtmlConverter";
export default class ExprItemsHtmlConverter extends ItemsHtmlConverter {
    constructor(schema: any, designMode: any, exprValues: any, summarizeExprs: any, namedStrings: any, locale: any);
    convertSpecialItemToHtml(item: any): string;
    convertElemToItems(elem: any): any;
}
