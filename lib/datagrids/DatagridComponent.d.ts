import React, { ReactNode } from "react";
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent";
import { DataSource, Expr, Schema } from "mwater-expressions";
import DatagridViewComponent from "./DatagridViewComponent";
import FindReplaceModalComponent from "./FindReplaceModalComponent";
import DatagridDataSource from "./DatagridDataSource";
import { DatagridDesign, JsonQLFilter } from "..";
export interface DatagridComponentProps {
    /** schema to use */
    schema: Schema;
    /** dataSource to use */
    dataSource: DataSource;
    /** datagrid dataSource to use */
    datagridDataSource: DatagridDataSource;
    design: DatagridDesign;
    /** Called when design changes */
    onDesignChange?: (design: DatagridDesign) => void;
    /** Extra element to include in title at left */
    titleElem?: ReactNode;
    /** Extra elements to add to right */
    extraTitleButtonsElem?: ReactNode;
    canEditValue?: (tableId: string, rowId: any, expr: Expr, callback: (error: any, canEdit?: boolean) => void) => void;
    /** Update table row expression with a new value
     * Called with (tableId, rowId, expr, value, callback). Callback should be called with (error)
     */
    updateValue?: (tableId: string, rowId: any, expr: Expr, value: any, callback: (error: any) => void) => void;
    /** Called when row is clicked with (tableId, rowId) */
    onRowClick?: (tableId: string, rowId: any) => void;
    /** Called when row is double-clicked with (tableId, rowId) */
    onRowDoubleClick?: (tableId: string, rowId: any) => void;
    /** Locked quickfilter values. See README in quickfilters */
    quickfilterLocks?: any[];
    filters?: JsonQLFilter[];
}
export default class DatagridComponent extends React.Component<DatagridComponentProps, {
    /** is design being edited */
    editingDesign: boolean;
    /** True if cells can be edited directly */
    cellEditingEnabled: boolean;
    /** Height of quickfilters */
    quickfiltersHeight: number | null;
    quickfiltersValues: null | any[];
}> {
    datagridView?: DatagridViewComponent | null;
    quickfilters?: HTMLElement | null;
    findReplaceModal: FindReplaceModalComponent | null;
    constructor(props: DatagridComponentProps);
    reload(): void | undefined;
    componentDidMount(): void;
    componentDidUpdate(): void;
    updateHeight(): void;
    getQuickfilterValues: () => any[];
    getQuickfilterFilters: () => JsonQLFilter[];
    handleCellEditingToggle: () => void;
    handleEdit: () => void;
    getCompiledFilters(): JsonQLFilter[];
    renderCellEdit(): React.DetailedReactHTMLElement<{
        key: string;
        className: string;
        onClick: () => void;
    }, HTMLElement> | null;
    renderEditButton(): React.DetailedReactHTMLElement<{
        type: string;
        className: string;
        onClick: () => void;
    }, HTMLElement> | null;
    renderFindReplace(): React.DetailedReactHTMLElement<{
        key: string;
        className: string;
        onClick: () => void;
    }, HTMLElement> | null;
    renderTitleBar(): React.DetailedReactHTMLElement<{
        style: {
            position: "absolute";
            top: number;
            left: number;
            right: number;
            height: number;
            padding: number;
        };
    }, HTMLElement>;
    renderQuickfilter(): React.DetailedReactHTMLElement<{
        style: {
            position: "absolute";
            top: number;
            left: number;
            right: number;
        };
        ref: (c: HTMLElement | null) => void;
    }, HTMLElement>;
    renderEditor(): React.CElement<DatagridEditorComponentProps, DatagridEditorComponent> | undefined;
    renderFindReplaceModal(filters: any): React.CElement<any, FindReplaceModalComponent>;
    render(): React.DetailedReactHTMLElement<{
        style: {
            width: string;
            height: string;
            position: "relative";
            paddingTop: number;
        };
    }, HTMLElement>;
}
interface DatagridEditorComponentProps {
    schema: Schema;
    dataSource: DataSource;
    design: DatagridDesign;
    onDesignChange: (design: DatagridDesign) => void;
    onCancel: () => void;
}
/** Popup editor */
declare class DatagridEditorComponent extends React.Component<DatagridEditorComponentProps, {
    design: DatagridDesign;
}> {
    constructor(props: DatagridEditorComponentProps);
    render(): React.CElement<import("react-library/lib/ActionCancelModalComponent").ActionCancelModalComponentProps, ActionCancelModalComponent>;
}
export {};
