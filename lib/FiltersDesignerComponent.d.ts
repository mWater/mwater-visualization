import PropTypes from "prop-types";
import React from "react";
export default class FiltersDesignerComponent extends React.Component {
    static propTypes: {
        schema: PropTypes.Validator<object>;
        dataSource: PropTypes.Validator<object>;
        filterableTables: PropTypes.Requireable<(string | null | undefined)[]>;
        filters: PropTypes.Requireable<object>;
        onFiltersChange: PropTypes.Validator<(...args: any[]) => any>;
    };
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    handleFilterChange: (table: any, expr: any) => any;
    renderFilterableTable: (table: any) => React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
