import React from "react";
import { Schema } from "mwater-expressions";
interface MWaterResponsesFilterComponentProps {
    schema: Schema;
    /** responses:xyz */
    table: string;
    filter?: any;
    onFilterChange: any;
}
export default class MWaterResponsesFilterComponent extends React.Component<MWaterResponsesFilterComponentProps> {
    getFilters(): any;
    setFilters(filters: any): any;
    getFinalFilter(): {
        type: string;
        op: string;
        table: string;
        exprs: ({
            type: string;
            table: string;
            column: string;
            valueType?: undefined;
            value?: undefined;
        } | {
            type: string;
            valueType: string;
            value: string[];
            table?: undefined;
            column?: undefined;
        })[];
    };
    isFinal(): boolean;
    getSiteValue(): string | null;
    handleSiteChange: (site: any) => any;
    handleFinalChange: (final: any) => any;
    handleChange: (final: any, site: any) => any;
    render(): React.DetailedReactHTMLElement<{
        style: {
            paddingLeft: number;
            paddingTop: number;
        };
    }, HTMLElement>;
}
export {};
