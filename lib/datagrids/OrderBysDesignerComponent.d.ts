import React from "react";
import { DataSource, Schema } from "mwater-expressions";
export interface OrderBysDesignerComponentProps {
    /** schema to use */
    schema: Schema;
    /** dataSource to use */
    dataSource: DataSource;
    table: string;
    /** Columns list See README.md of this folder */
    orderBys: any;
    /** Called when columns changes */
    onChange: any;
}
export default class OrderBysDesignerComponent extends React.Component<OrderBysDesignerComponentProps> {
    static defaultProps: {
        orderBys: never[];
    };
    handleChange: (index: any, orderBy: any) => any;
    handleRemove: (index: any) => any;
    handleAdd: () => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
