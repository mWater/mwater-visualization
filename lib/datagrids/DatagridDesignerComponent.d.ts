import PropTypes from "prop-types";
import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import TabbedComponent from "react-library/lib/TabbedComponent";
import { DatagridDesign } from "..";
export interface DatagridDesignerComponentProps {
    /** schema to use */
    schema: Schema;
    /** dataSource to use */
    dataSource: DataSource;
    /** Design of datagrid. See README.md of this folder */
    design: DatagridDesign;
    /** Called when design changes */
    onDesignChange: (design: DatagridDesign) => void;
}
export default class DatagridDesignerComponent extends React.Component<DatagridDesignerComponentProps> {
    static contextTypes: {
        globalFiltersElementFactory: PropTypes.Requireable<(...args: any[]) => any>;
    };
    handleTableChange: (table: any) => void;
    handleColumnsChange: (columns: any) => void;
    handleFilterChange: (filter: any) => void;
    handleGlobalFiltersChange: (globalFilters: any) => void;
    handleOrderBysChange: (orderBys: any) => void;
    renderTabs(): React.CElement<any, TabbedComponent>;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
