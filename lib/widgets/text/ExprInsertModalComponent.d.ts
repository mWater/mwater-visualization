import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent";
import { HtmlItemExpr } from "../../richtext/ExprItemsHtmlConverter";
export interface ExprInsertModalComponentProps {
    /** Schema to use */
    schema: Schema;
    /** Data source to use to get values */
    dataSource: DataSource;
    /** Called with expr item to insert */
    onInsert: (exprItem: HtmlItemExpr) => void;
    singleRowTable?: string;
}
interface ExprInsertModalComponentState {
    exprItem: HtmlItemExpr | null;
    open: boolean;
}
export default class ExprInsertModalComponent extends React.Component<ExprInsertModalComponentProps, ExprInsertModalComponentState> {
    constructor(props: ExprInsertModalComponentProps);
    open(): void;
    handleInsert: () => void;
    render(): React.CElement<import("react-library/lib/ActionCancelModalComponent").ActionCancelModalComponentProps, ActionCancelModalComponent> | null;
}
export {};
