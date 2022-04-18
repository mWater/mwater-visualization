import PropTypes from "prop-types";
import React from "react";
import { Schema } from "mwater-expressions";
export interface MWaterTableSelectComponentProps {
    /** Url to hit api */
    apiUrl: string;
    /** Optional client */
    client?: string;
    schema: Schema;
    /** User id */
    user?: string;
    table?: string;
    /** Called with table selected */
    onChange: any;
    extraTables: any;
    onExtraTablesChange: any;
    /** Can also perform filtering for some types. Include these props to enable this */
    filter?: any;
    onFilterChange?: any;
}
interface MWaterTableSelectComponentState {
    pendingExtraTable: any;
}
export default class MWaterTableSelectComponent extends React.Component<MWaterTableSelectComponentProps, MWaterTableSelectComponentState> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
        activeTables: PropTypes.Requireable<string[]>;
    };
    toggleEdit: any;
    constructor(props: any);
    componentWillReceiveProps(nextProps: any): any;
    handleChange: (tableId: any) => any;
    handleTableChange: (tableId: any) => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
