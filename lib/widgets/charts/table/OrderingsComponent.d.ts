import React from "react";
import { DataSource, Schema } from "mwater-expressions";
export interface OrderingsComponentProps {
    orderings: any;
    onOrderingsChange: any;
    schema: Schema;
    dataSource: DataSource;
    table?: string;
}
export default class OrderingsComponent extends React.Component<OrderingsComponentProps> {
    handleAdd: () => any;
    handleOrderingRemove: (index: any) => any;
    handleOrderingChange: (index: any, ordering: any) => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
