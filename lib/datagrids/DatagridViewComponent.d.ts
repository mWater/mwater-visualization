import React from "react";
declare const _default: {
    new (props: any): {
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
        context: any;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<{}>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<{}> & Readonly<{
            children?: React.ReactNode;
        }>;
        state: Readonly<{}>;
        refs: {
            [key: string]: React.ReactInstance;
        };
        componentDidMount?(): void;
        shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean;
        componentWillUnmount?(): void;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any;
        componentDidUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void;
    };
    initClass(): void;
    contextType?: React.Context<any> | undefined;
};
export default _default;
