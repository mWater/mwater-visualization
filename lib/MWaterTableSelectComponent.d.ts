import React from "react";
interface MWaterTableSelectComponentProps {
    /** Url to hit api */
    apiUrl: string;
    /** Optional client */
    client?: string;
    schema: any;
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
    static initClass(): void;
    constructor(props: any);
    componentWillReceiveProps(nextProps: any): any;
    handleChange: (tableId: any) => any;
    handleTableChange: (tableId: any) => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
