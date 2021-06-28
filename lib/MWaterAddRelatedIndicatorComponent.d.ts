/// <reference types="jquery" />
import React from "react";
interface MWaterAddRelatedIndicatorComponentProps {
    table: string;
    apiUrl: string;
    client?: string;
    /** User id */
    user?: string;
    /** Called with table id e.g. indicator_values:someid */
    onSelect: any;
    schema: any;
    /** String filter */
    filter?: string;
}
interface MWaterAddRelatedIndicatorComponentState {
    addingTables: any;
    indicators: any;
}
export default class MWaterAddRelatedIndicatorComponent extends React.Component<MWaterAddRelatedIndicatorComponentProps, MWaterAddRelatedIndicatorComponentState> {
    static initClass(): void;
    constructor(props: any);
    componentDidMount(): JQuery.jqXHR<any>;
    doesIndicatorReferenceTable(indicator: any, table: any): boolean;
    handleSelect: (table: any) => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
