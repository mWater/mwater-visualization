import React from "react";
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent";
interface ExprUpdateModalComponentProps {
    /** Schema to use */
    schema: any;
    /** Data source to use to get values */
    dataSource: any;
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
    render(): React.CElement<{
        title?: React.ReactNode;
        actionLabel?: React.ReactNode;
        cancelLabel?: React.ReactNode;
        deleteLabel?: React.ReactNode;
        onAction?: (() => void) | undefined;
        onCancel?: (() => void) | undefined;
        onDelete?: (() => void) | undefined;
        size?: "full" | "large" | undefined;
        actionBusy?: boolean | undefined;
    }, ActionCancelModalComponent> | null;
}
export {};
