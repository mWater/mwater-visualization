import React from "react";
import { DataSource, Schema } from "mwater-expressions";
interface EditPopupComponentProps {
    /** Schema to use */
    schema: Schema;
    dataSource: DataSource;
    /** Design of the marker layer */
    design: any;
    /** Called with new design */
    onDesignChange: any;
    /** Table that popup is for */
    table: string;
    /** Table of the row that join is to. Usually same as table except for choropleth maps */
    idTable: string;
    defaultPopupFilterJoins: any;
}
interface EditPopupComponentState {
    editing: any;
}
export default class EditPopupComponent extends React.Component<EditPopupComponentProps, EditPopupComponentState> {
    constructor(props: any);
    handleItemsChange: (items: any) => any;
    handleRemovePopup: () => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
