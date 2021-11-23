/// <reference types="jquery" />
import PropTypes from "prop-types";
import React from "react";
import { Schema } from "mwater-expressions";
export interface MWaterAddRelatedIndicatorComponentProps {
    table: string;
    apiUrl: string;
    client?: string;
    /** User id */
    user?: string;
    /** Called with table id e.g. indicator_values:someid */
    onSelect: any;
    schema: Schema;
    /** String filter */
    filter?: string;
}
interface MWaterAddRelatedIndicatorComponentState {
    addingTables: any;
    indicators: any;
}
export default class MWaterAddRelatedIndicatorComponent extends React.Component<MWaterAddRelatedIndicatorComponentProps, MWaterAddRelatedIndicatorComponentState> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    constructor(props: any);
    componentDidMount(): JQuery.jqXHR<any>;
    doesIndicatorReferenceTable(indicator: any, table: any): boolean;
    handleSelect: (table: any) => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
