import React from "react";
import ModalPopupComponent from "react-library/lib/ModalPopupComponent";
import { DataSource, Expr, Schema } from "mwater-expressions";
import { DatagridDesign, JsonQLFilter } from "..";
interface FindReplaceModalComponentProps {
    schema: Schema;
    dataSource: DataSource;
    design: DatagridDesign;
    filters?: JsonQLFilter[];
    canEditValue?: (tableId: string, rowId: any, expr: Expr, callback: (error: any, canEdit?: boolean) => void) => void;
    updateValue?: (tableId: string, rowId: any, expr: Expr, value: any, callback: (error: any) => void) => void;
    onUpdate: () => void;
}
interface FindReplaceModalComponentState {
    /** True if modal is open */
    open: boolean;
    /** Column id to replace */
    replaceColumn: string | null;
    /** Replace with expression */
    withExpr: Expr;
    /** Condition expr */
    conditionExpr: Expr;
    /** 0-100 when working */
    progress: null | number;
}
export default class FindReplaceModalComponent extends React.Component<FindReplaceModalComponentProps, FindReplaceModalComponentState> {
    constructor(props: any);
    show(): void;
    performReplace(): void;
    renderPreview(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    renderContents(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    render(): React.CElement<any, ModalPopupComponent> | null;
}
export {};
