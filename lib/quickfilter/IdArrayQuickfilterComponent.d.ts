import React from "react";
import { DataSource, Expr, Schema } from "mwater-expressions";
import { JsonQLFilter } from "..";
export interface IdArrayQuickfilterComponentProps {
    label: string;
    schema: Schema;
    dataSource: DataSource;
    expr: Expr;
    index: number;
    /** Current value of quickfilter (state of filter selected) */
    value: any;
    onValueChange: (value: any) => void;
    /** true to display multiple values */
    multi?: boolean;
    filters?: JsonQLFilter[];
}
export default class IdArrayQuickfilterComponent extends React.Component<IdArrayQuickfilterComponentProps> {
    render(): React.DetailedReactHTMLElement<{
        style: {
            display: "inline-block";
            paddingRight: number;
        };
    }, HTMLElement>;
}
