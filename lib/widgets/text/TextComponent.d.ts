import PropTypes from "prop-types";
import React from "react";
import RichTextComponent from "../../richtext/RichTextComponent";
import ExprInsertModalComponent from "./ExprInsertModalComponent";
import ExprUpdateModalComponent from "./ExprUpdateModalComponent";
import ExprItemsHtmlConverter from "../../richtext/ExprItemsHtmlConverter";
import { TextWidgetDesign } from "./TextWidgetDesign";
import { DataSource, Schema } from "mwater-expressions";
export interface TextComponentProps {
    design: TextWidgetDesign;
    onDesignChange?: (design: TextWidgetDesign) => void;
    schema: Schema;
    dataSource: DataSource;
    /** Expression values */
    exprValues: {
        [key: string]: any;
    };
    width?: number;
    height?: number;
    /** Table that is filtered to have one row */
    singleRowTable?: string;
    /** Optional lookup of string name to value. Used for {{branding}} and other replacement strings in text widget */
    namedStrings?: {
        [key: string]: string;
    };
}
export default class TextComponent extends React.Component<TextComponentProps> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    exprInsertModal: ExprInsertModalComponent | null;
    exprUpdateModal: ExprUpdateModalComponent | null;
    editor: RichTextComponent | null;
    createItemsHtmlConverter(): ExprItemsHtmlConverter;
    handleItemsChange: (items: any) => void;
    handleInsertExpr: (item: any) => void;
    replaceItem(item: any): void;
    handleItemClick: (item: any) => void;
    handleAddExpr: (ev: any) => void;
    renderExtraPaletteButtons(): React.DetailedReactHTMLElement<{
        key: string;
        className: string;
        onMouseDown: (ev: any) => void;
    }, HTMLElement>;
    renderModals(): (React.CElement<import("./ExprInsertModalComponent").ExprInsertModalComponentProps, ExprInsertModalComponent> | React.CElement<any, ExprUpdateModalComponent>)[];
    refRichTextComponent: (c: RichTextComponent | null) => void;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
