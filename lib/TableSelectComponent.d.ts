import PropTypes from "prop-types";
import React from "react";
interface TableSelectComponentProps {
    schema: any;
    /** Current table id */
    value?: string;
    /** Newly selected table id */
    onChange: any;
    /** Some table select components (not the default) can also perform filtering. Include these props to enable this */
    filter?: any;
    onFilterChange?: any;
}
export default class TableSelectComponent extends React.Component<TableSelectComponentProps> {
    static contextTypes: {
        tableSelectElementFactory: PropTypes.Requireable<(...args: any[]) => any>;
        locale: PropTypes.Requireable<string>;
        activeTables: PropTypes.Requireable<string[]>;
    };
    render(): any;
}
export {};
