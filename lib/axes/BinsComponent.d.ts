import React from "react";
interface BinsComponentProps {
    schema: any;
    dataSource: any;
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
    componentDidMount(): any;
    componentWillUnmount(): boolean;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
