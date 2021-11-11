import React, { ReactNode } from "react";
import { ContentEditableComponent } from "mwater-expressions-ui";
import ItemsHtmlConverter, { HtmlItem } from "./ItemsHtmlConverter";
export interface RichTextComponentProps {
    items?: HtmlItem[];
    onItemsChange: (items: HtmlItem[]) => void;
    onItemClick?: (item: HtmlItem) => void;
    /** Optional className of editor wrapper */
    className?: string;
    /** Optional style of editor wrapper */
    style?: any;
    /** Converter to use for editing */
    itemsHtmlConverter?: ItemsHtmlConverter;
    /** True (default) to include heading h1, h2 in palette */
    includeHeadings?: boolean;
    /** Extra buttons to put in palette */
    extraPaletteButtons?: ReactNode;
}
export default class RichTextComponent extends React.Component<RichTextComponentProps, {
    focused: boolean;
}> {
    static defaultProps: {
        includeHeadings: boolean;
        items: never[];
        itemsHtmlConverter: ItemsHtmlConverter;
    };
    entireComponent: HTMLElement | null;
    contentEditable: ContentEditableComponent | null;
    paletteComponent: HTMLElement | null;
    constructor(props: any);
    handleClick: (ev: any) => void;
    pasteHTML(html: any): void;
    focus(): void;
    handleInsertExpr: (item: any) => void;
    handleSetFontSize: (size: any) => any;
    handleSetFontColor: (color: any) => void;
    handleChange: (elem: any) => void;
    handleFocus: () => void;
    handleBlur: () => void;
    handleCommand: (command: any, param: any, ev?: any) => boolean;
    handleCreateLink: (ev: any) => void;
    handleEditorClick: (ev: any) => void;
    createHtml(): string;
    renderPalette(): React.CElement<{
        style: {
            zIndex: number;
        };
        edges: string;
        align: string;
        render: (schemeName: any, { edges }: any) => React.DetailedReactHTMLElement<{
            key: string;
            className: string;
            ref: (c: HTMLElement | null) => void;
        }, HTMLElement>;
    }, React.Component<{
        style: {
            zIndex: number;
        };
        edges: string;
        align: string;
        render: (schemeName: any, { edges }: any) => React.DetailedReactHTMLElement<{
            key: string;
            className: string;
            ref: (c: HTMLElement | null) => void;
        }, HTMLElement>;
    }, any, any>>;
    renderPaletteContent: (schemeName: any, { edges }: any) => React.DetailedReactHTMLElement<{
        key: string;
        className: string;
        ref: (c: HTMLElement | null) => void;
    }, HTMLElement>;
    refContentEditable: (c: ContentEditableComponent | null) => void;
    renderHtml(): React.DetailedReactHTMLElement<{
        key: string;
        style: any;
        className: string | undefined;
    }, HTMLElement>;
    render(): React.DetailedReactHTMLElement<{
        style: {
            position: "relative";
        };
        ref: (c: HTMLElement | null) => void;
    }, HTMLElement>;
}
