import React from "react";
import { Schema } from "mwater-expressions";
export interface MWaterAddRelatedFormComponentProps {
    /** Entities or assets table id */
    table: string;
    apiUrl: string;
    client?: string;
    /** User id */
    user?: string;
    /** Called with table id e.g. responses:someid */
    onSelect: (tableId: string) => void;
    schema: Schema;
}
interface MWaterAddRelatedFormComponentState {
    waitingForTable: any;
    open: boolean;
}
export default class MWaterAddRelatedFormComponent extends React.Component<MWaterAddRelatedFormComponentProps, MWaterAddRelatedFormComponentState> {
    constructor(props: MWaterAddRelatedFormComponentProps);
    componentWillReceiveProps(nextProps: any): void;
    handleOpen: () => void;
    handleSelect: (table: any) => void;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
