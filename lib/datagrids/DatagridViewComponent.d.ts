import PropTypes from "prop-types";
import React from "react";
export default class DatagridViewComponent extends React.Component {
    static propTypes: {
        width: PropTypes.Validator<number>;
        height: PropTypes.Validator<number>;
        pageSize: PropTypes.Requireable<number>;
        schema: PropTypes.Validator<object>;
        dataSource: PropTypes.Validator<object>;
        datagridDataSource: PropTypes.Validator<object>;
        design: PropTypes.Validator<object>;
        onDesignChange: PropTypes.Requireable<(...args: any[]) => any>;
        filters: PropTypes.Requireable<(PropTypes.InferProps<{
            table: PropTypes.Validator<string>;
            jsonql: PropTypes.Validator<object>;
        }> | null | undefined)[]>;
        canEditCell: PropTypes.Requireable<(...args: any[]) => any>;
        updateCell: PropTypes.Requireable<(...args: any[]) => any>;
        onRowDoubleClick: PropTypes.Requireable<(...args: any[]) => any>;
        onRowClick: PropTypes.Requireable<(...args: any[]) => any>;
    };
    static defaultProps: {
        pageSize: number;
    };
    constructor(props: any);
    componentWillReceiveProps(nextProps: any): void;
    loadMoreRows(): any;
    reload: () => void;
    deleteRow(rowIndex: any, callback: any): any;
    reloadRow(rowIndex: any, callback: any): any;
    handleColumnResize: (newColumnWidth: any, columnKey: any) => any;
    handleCellClick: (rowIndex: any, columnIndex: any) => any;
    handleSaveEdit: () => void;
    handleCancelEdit: () => void;
    refEditCell: (comp: any) => any;
    handleRowDoubleClick: (ev: any, rowIndex: any) => any;
    handleRowClick: (ev: any, rowIndex: any) => any;
    renderCell: (column: any, columnIndex: any, exprType: any, cellProps: any) => React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> | React.CElement<any, any> | undefined;
    renderColumn(column: any, columnIndex: any): React.ReactSVGElement;
    renderColumns(): React.ReactSVGElement[];
    render(): React.CElement<{
        rowsCount: any;
        rowHeight: number;
        headerHeight: number;
        width: any;
        height: any;
        onRowDoubleClick: (ev: any, rowIndex: any) => any;
        onRowClick: (ev: any, rowIndex: any) => any;
        isColumnResizing: boolean;
        allowCellsRecycling: boolean;
        onColumnResizeEndCallback: (newColumnWidth: any, columnKey: any) => any;
    }, React.Component<{
        rowsCount: any;
        rowHeight: number;
        headerHeight: number;
        width: any;
        height: any;
        onRowDoubleClick: (ev: any, rowIndex: any) => any;
        onRowClick: (ev: any, rowIndex: any) => any;
        isColumnResizing: boolean;
        allowCellsRecycling: boolean;
        onColumnResizeEndCallback: (newColumnWidth: any, columnKey: any) => any;
    }, any, any>>;
}
