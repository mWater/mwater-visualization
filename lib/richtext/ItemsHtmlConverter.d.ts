export declare type HtmlItem = string | HtmlItemElement;
export interface HtmlItemElement {
    type: "element";
    tag: string;
    items?: HtmlItem[];
    style?: any;
    href?: string;
    target?: string;
}
export default class ItemsHtmlConverter {
    static isBlank: (items: HtmlItem[] | undefined) => boolean;
    namedStrings: {
        [key: string]: string;
    } | undefined;
    constructor(namedStrings?: {
        [key: string]: string;
    });
    convertItemsToHtml(items: any): string;
    convertSpecialItemToHtml(item: any): string;
    convertElemToItems(elem: any): HtmlItem[];
}
