import React from "react";
import AutoSizeComponent from "react-library/lib/AutoSizeComponent";
import { RowUpdate } from "./DatagridViewComponent";
import ModalPopupComponent from "react-library/lib/ModalPopupComponent";
import { DataSource, Expr, Schema } from "mwater-expressions";
import { DatagridDesign, JsonQLFilter } from "..";
export interface FindReplaceModalComponentProps {
    schema: Schema;
    dataSource: DataSource;
    design: DatagridDesign;
    filters?: JsonQLFilter[];
    /** Update cell values by updating set of expressions and values */
    updateExprValues: (tableId: string, rowUpdates: RowUpdate[]) => Promise<void>;
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
    /** True when working */
    busy: boolean;
}
export default class FindReplaceModalComponent extends React.Component<FindReplaceModalComponentProps, FindReplaceModalComponentState> {
    constructor(props: any);
    show(): void;
    performReplace(): Promise<void>;
    renderPreview(): React.CElement<import("react-library/lib/AutoSizeComponent").AutoSizeComponentProps, AutoSizeComponent>;
    renderContents(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    render(): React.CElement<import("react-library/lib/ModalPopupComponent").ModalPopupComponentProps, ModalPopupComponent> | null;
}
export {};
