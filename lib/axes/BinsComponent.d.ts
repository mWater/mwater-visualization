import React from "react";
import { DataSource, Schema } from "mwater-expressions";
export interface BinsComponentProps {
    schema: Schema;
    dataSource: DataSource;
    /** Expression for computing min/max */
    expr: any;
    xform: any;
    onChange: any;
}
interface BinsComponentState {
    guessing: any;
}
export default class BinsComponent extends React.Component<BinsComponentProps, BinsComponentState> {
    unmounted?: boolean;
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): boolean;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
