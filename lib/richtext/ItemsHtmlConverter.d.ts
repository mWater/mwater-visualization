export default class ItemsHtmlConverter {
    static isBlank: (items: any) => any;
    constructor(namedStrings: any);
    convertItemsToHtml(items: any): string;
    convertSpecialItemToHtml(item: any): string;
    convertElemToItems(elem: any): any;
}
