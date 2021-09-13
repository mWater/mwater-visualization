import PropTypes from "prop-types";
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
    static contextTypes: {
        globalFiltersElementFactory: PropTypes.Requireable<(...args: any[]) => any>;
    };
    handleTableChange: (table: any) => any;
    handleColumnsChange: (columns: any) => any;
    handleFilterChange: (filter: any) => any;
    handleGlobalFiltersChange: (globalFilters: any) => any;
    handleOrderBysChange: (orderBys: any) => any;
    renderTabs(): React.CElement<any, TabbedComponent>;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
