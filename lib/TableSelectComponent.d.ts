import PropTypes from "prop-types";
import React from "react";
import { Expr, Schema } from "mwater-expressions";
export interface TableSelectComponentProps {
    schema: Schema;
    /** Current table id */
    value?: string;
    /** Newly selected table id */
    onChange: (tableId: string) => void;
    /** Some table select components (not the default) can also perform filtering. Include these props to enable this */
    filter?: Expr;
    onFilterChange?: (filter: Expr) => void;
}
export default class TableSelectComponent extends React.Component<TableSelectComponentProps> {
    static contextTypes: {
        tableSelectElementFactory: PropTypes.Requireable<(...args: any[]) => any>;
        locale: PropTypes.Requireable<string>;
        activeTables: PropTypes.Requireable<string[]>;
    };
    render(): any;
}
