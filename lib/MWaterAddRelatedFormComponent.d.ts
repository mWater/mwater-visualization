import React from "react";
interface MWaterAddRelatedFormComponentProps {
    table: string;
    apiUrl: string;
    client?: string;
    /** User id */
    user?: string;
    /** Called with table id e.g. responses:someid */
    onSelect: any;
    schema: any;
}
interface MWaterAddRelatedFormComponentState {
    waitingForTable: any;
    open: any;
}
export default class MWaterAddRelatedFormComponent extends React.Component<MWaterAddRelatedFormComponentProps, MWaterAddRelatedFormComponentState> {
    constructor(props: any);
    componentWillReceiveProps(nextProps: any): void;
    handleOpen: () => void;
    handleSelect: (table: any) => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
