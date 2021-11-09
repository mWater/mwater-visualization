import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import { Cell } from "fixed-data-table-2";
export interface ExprCellComponentProps {
    /** schema to use */
    schema: Schema;
    /** dataSource to use */
    dataSource: DataSource;
    /** Locale to use */
    locale?: string;
    exprType?: string;
    /** Optional format */
    format?: string;
    width: number;
    height: number;
    value?: any;
    expr?: any;
    /** True to show muted */
    muted?: boolean;
    onClick?: any;
}
export default class ExprCellComponent extends React.Component<ExprCellComponentProps> {
    handleClick: () => void;
    renderImage(id: any): React.DetailedReactHTMLElement<{
        href: string;
        key: any;
        target: string;
        style: {
            paddingLeft: number;
            paddingRight: number;
        };
    }, HTMLElement>;
    render(): React.CElement<import("fixed-data-table-2").CellProps, Cell>;
}
