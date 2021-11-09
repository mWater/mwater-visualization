import React from "react";
import { DataSource, Schema } from "mwater-expressions";
interface ExprInsertModalComponentProps {
    /** Schema to use */
    schema: Schema;
    /** Data source to use to get values */
    dataSource: DataSource;
    /** Called with expr item to insert */
    onInsert: any;
    singleRowTable?: string;
}
interface ExprInsertModalComponentState {
    exprItem: any;
    open: any;
}
export default class ExprInsertModalComponent extends React.Component<ExprInsertModalComponentProps, ExprInsertModalComponentState> {
    constructor(props: any);
    open(): void;
    handleInsert: (ev: any) => void;
    render(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> | null;
}
export {};
