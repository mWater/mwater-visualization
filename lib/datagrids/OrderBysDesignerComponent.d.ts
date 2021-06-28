import React from "react";
interface OrderBysDesignerComponentProps {
    /** schema to use */
    schema: any;
    /** dataSource to use */
    dataSource: any;
    table: string;
    /** Columns list See README.md of this folder */
    orderBys: any;
    /** Called when columns changes */
    onChange: any;
}
export default class OrderBysDesignerComponent extends React.Component<OrderBysDesignerComponentProps> {
    static initClass(): void;
    handleChange: (index: any, orderBy: any) => any;
    handleRemove: (index: any) => any;
    handleAdd: () => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
