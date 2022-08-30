import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import { HtmlItemExpr } from "../../richtext/ExprItemsHtmlConverter";
export interface ExprItemEditorComponentProps {
    /** Schema to use */
    schema: Schema;
    /** Data source to use to get values */
    dataSource: DataSource;
    /** Expression item to edit */
    exprItem: HtmlItemExpr;
    /** Called with expr item */
    onChange: (exprItem: HtmlItemExpr) => void;
    singleRowTable?: string;
}
interface ExprItemEditorComponentState {
    table: string;
}
export default class ExprItemEditorComponent extends React.Component<ExprItemEditorComponentProps, ExprItemEditorComponentState> {
    constructor(props: any);
    handleTableChange: (table: any) => void;
    handleExprChange: (expr: any) => void;
    handleIncludeLabelChange: (value: any) => void;
    handleLabelTextChange: (ev: any) => void;
    handleFormatChange: (ev: any) => void;
    renderFormat(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
    render(): React.DetailedReactHTMLElement<{
        style: {
            paddingBottom: number;
        };
    }, HTMLElement>;
}
export {};
