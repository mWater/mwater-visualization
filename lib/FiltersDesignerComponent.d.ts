import PropTypes from "prop-types";
import React from "react";
import { DataSource, Expr, Schema } from "mwater-expressions";
export interface FiltersDesignerComponentProps {
    /** Schema to use */
    schema: Schema;
    /** Data source to use */
    dataSource: DataSource;
    /** Tables that can be filtered on. Should only include tables that actually exist */
    filterableTables?: string[];
    filters?: {
        [tableId: string]: Expr;
    };
    onFiltersChange: (filters: {
        [tableId: string]: Expr;
    }) => void;
}
export default class FiltersDesignerComponent extends React.Component<FiltersDesignerComponentProps> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    handleFilterChange: (table: any, expr: any) => void;
    renderFilterableTable: (table: any) => React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
