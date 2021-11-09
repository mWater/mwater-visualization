import React from "react";
import { Column } from "fixed-data-table-2";
import { DataSource, Expr, Schema } from "mwater-expressions";
import DatagridDataSource from "./DatagridDataSource";
import { DatagridDesign, JsonQLFilter } from "..";
export interface DatagridViewComponentProps {
    /** Width of control */
    width: number;
    /** Height of control */
    height: number;
    pageSize?: number;
    schema: Schema;
    dataSource: DataSource;
    datagridDataSource: DatagridDataSource;
    design: DatagridDesign;
    onDesignChange?: (design: DatagridDesign) => void;
    filters?: JsonQLFilter[];
    /** Check if cell is editable
     * If present, called with (tableId, rowId, expr, callback). Callback should be called with (error, true/false)
     */
    canEditCell?: (tableId: string, rowId: any, expr: Expr, callback: (error: any, editable: boolean) => void) => void;
    /** Update cell value
     * Called with (tableId, rowId, expr, value, callback). Callback should be called with (error)
     */
    updateCell?: (tableId: string, rowId: any, expr: Expr, value: any, callback: (error: any) => void) => void;
    /** Called when row is double-clicked with (tableId, rowId, rowIndex) */
    onRowDoubleClick?: (tableId: string, rowId: any, rowIndex: number) => void;
    /** Called when a row is clicked with (tableId, rowId, rowIndex) */
    onRowClick?: (tableId: string, rowId: any, rowIndex: number) => void;
}
export interface DatagridViewComponentState {
    rows: any[];
    entirelyLoaded: boolean;
    /** set to { rowIndex: 0, 1, 2, columnIndex: 0, 1, 2... } if editing a cell */
    editingCell: {
        rowIndex: number;
        columnIndex: number;
    } | null;
    savingCell: boolean;
}
interface LoadState {
    design: DatagridDesign;
    offset: number;
    limit: number;
    filters?: JsonQLFilter[];
}
export default class DatagridViewComponent extends React.Component<DatagridViewComponentProps, DatagridViewComponentState> {
    static defaultProps: {
        pageSize: number;
    };
    loadState: LoadState | null;
    constructor(props: DatagridViewComponentProps);
    componentWillReceiveProps(nextProps: DatagridViewComponentProps): void;
    loadMoreRows(): void;
    reload: () => void;
    deleteRow(rowIndex: any, callback: any): any;
    reloadRow(rowIndex: any, callback: any): void;
    handleColumnResize: (newColumnWidth: any, columnKey: any) => void;
    handleCellClick: (rowIndex: any, columnIndex: any) => void;
    handleSaveEdit: () => void;
    handleCancelEdit: () => void;
    refEditCell: (comp: any) => void;
    handleRowDoubleClick: (ev: any, rowIndex: any) => void;
    handleRowClick: (ev: any, rowIndex: any) => void;
    renderCell: (column: any, columnIndex: any, exprType: any, cellProps: any) => React.CElement<any, any> | undefined;
    renderColumn(column: any, columnIndex: any): React.CElement<import("fixed-data-table-2").ColumnProps, Column>;
    renderColumns(): React.CElement<import("fixed-data-table-2").ColumnProps, Column>[];
    render(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
}
export {};
