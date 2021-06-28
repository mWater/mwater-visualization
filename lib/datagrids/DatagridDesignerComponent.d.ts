import React from "react";
import TabbedComponent from "react-library/lib/TabbedComponent";
interface DatagridDesignerComponentProps {
    /** schema to use */
    schema: any;
    /** dataSource to use */
    dataSource: any;
    /** Design of datagrid. See README.md of this folder */
    design: any;
    /** Called when design changes */
    onDesignChange: any;
}
export default class DatagridDesignerComponent extends React.Component<DatagridDesignerComponentProps> {
    static initClass(): void;
    handleTableChange: (table: any) => any;
    handleColumnsChange: (columns: any) => any;
    handleFilterChange: (filter: any) => any;
    handleGlobalFiltersChange: (globalFilters: any) => any;
    handleOrderBysChange: (orderBys: any) => any;
    renderTabs(): React.CElement<{
        tabs: {
            id: string;
            label: React.ReactNode;
            elem: React.ReactNode;
            onRemove?: (() => void) | undefined;
        }[];
        initialTabId?: string | undefined;
        tabId?: string | undefined;
        onAddTab?: (() => void) | undefined;
        onTabClick?: ((tabId: string) => void) | undefined;
    }, TabbedComponent>;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
