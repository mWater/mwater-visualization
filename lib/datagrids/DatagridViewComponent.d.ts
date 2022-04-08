import React from "react";
import { Table, Column, Cell } from "fixed-data-table-2";
import { DataSource, Expr, Schema } from "mwater-expressions";
import ExprCellComponent from "./ExprCellComponent";
import EditExprCellComponent from "./EditExprCellComponent";
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
    /** Check if a cell is editable by testing if underlying expression is editable */
    canEditExpr?: (tableId: string, rowId: any, expr: Expr) => Promise<boolean>;
    /** Update cell values by updating set of expressions and values */
    updateExprValues?: (tableId: string, rowUpdates: RowUpdate[]) => Promise<void>;
    /** Called when row is double-clicked with (tableId, rowId, rowIndex) */
    onRowDoubleClick?: (tableId: string, rowId: any, rowIndex: number) => void;
    /** Called when a row is clicked with (tableId, rowId, rowIndex) */
    onRowClick?: (tableId: string, rowId: any, rowIndex: number) => void;
}
/** Update to one row expression value */
export interface RowUpdate {
    primaryKey: string;
    expr: Expr;
    value: any;
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
    editCellComp: EditExprCellComponent | null;
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
    refEditCell: (comp: EditExprCellComponent | null) => void;
    handleRowDoubleClick: (ev: any, rowIndex: any) => void;
    handleRowClick: (ev: any, rowIndex: any) => void;
    renderCell: (column: any, columnIndex: any, exprType: any, cellProps: any) => React.CElement<import("fixed-data-table-2").CellProps, Cell> | React.CElement<any, EditExprCellComponent> | React.CElement<import("./ExprCellComponent").ExprCellComponentProps, ExprCellComponent> | null;
    renderColumn(column: any, columnIndex: any): React.CElement<import("fixed-data-table-2").ColumnProps, Column>;
    renderColumns(): React.CElement<import("fixed-data-table-2").ColumnProps, Column>[];
    render(): React.CElement<import("fixed-data-table-2").TableProps, Table>;
}
export {};
