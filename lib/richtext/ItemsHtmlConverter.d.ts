export declare type HtmlItem = string | HtmlItemBase;
export interface HtmlItemBase {
    type: string;
    items?: HtmlItem[];
}
export interface HtmlItemElement extends HtmlItemBase {
    type: "element";
    tag: string;
    items?: HtmlItem[];
    style?: any;
    href?: string;
    target?: string;
}
/** Converts items (JSON contents of rich text) to HTML and back to allow editing
 * Items are array of:
 *  string (html text)
 *  { type: "element", tag: "h1", items: [nested items] }
 *  elements can contain style (object), href, target
 */
export default class ItemsHtmlConverter {
    static isBlank: (items: HtmlItem[] | undefined) => boolean;
    namedStrings: {
        [key: string]: string;
    } | undefined;
    constructor(namedStrings?: {
        [key: string]: string;
    });
    convertItemsToHtml(items: any): string;
    convertSpecialItemToHtml(item: HtmlItemBase): string;
    convertElemToItems(elem: HTMLElement): HtmlItem[];
}
