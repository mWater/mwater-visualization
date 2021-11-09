import React from "react";
import { Cell } from "fixed-data-table-2";
interface ExprCellComponentProps {
    /** schema to use */
    schema: any;
    /** dataSource to use */
    dataSource: any;
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
        href: any;
        key: any;
        target: string;
        style: {
            paddingLeft: number;
            paddingRight: number;
        };
    }, HTMLElement>;
    render(): React.CElement<import("fixed-data-table-2").CellProps, Cell>;
}
export {};
