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
    static initClass(): void;
    render(): any;
}
export {};
