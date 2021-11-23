import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent";
export interface ExprUpdateModalComponentProps {
    /** Schema to use */
    schema: Schema;
    /** Data source to use to get values */
    dataSource: DataSource;
    singleRowTable?: string;
}
interface ExprUpdateModalComponentState {
    open: any;
    onUpdate: any;
    exprItem: any;
}
export default class ExprUpdateModalComponent extends React.Component<ExprUpdateModalComponentProps, ExprUpdateModalComponentState> {
    constructor(props: any);
    open(item: any, onUpdate: any): void;
    render(): React.CElement<import("react-library/lib/ActionCancelModalComponent").ActionCancelModalComponentProps, ActionCancelModalComponent> | null;
}
export {};
