import React from "react";
interface PopupFilterJoinsEditComponentProps {
    /** Schema to use */
    schema: any;
    dataSource: any;
    /** table of the row that the popup will be for */
    table: string;
    /** table of the row that join is to. Usually same as table except for choropleth maps */
    idTable: string;
    /** Default popup filter joins */
    defaultPopupFilterJoins: any;
    /** Design of the popup this is for */
    popup: any;
    /** popup filter joins object */
    design?: any;
    onDesignChange: any;
}
interface PopupFilterJoinsEditComponentState {
    expanded: any;
}
export default class PopupFilterJoinsEditComponent extends React.Component<PopupFilterJoinsEditComponentProps, PopupFilterJoinsEditComponentState> {
    constructor(props: any);
    handleExprChange: (table: any, expr: any) => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | React.DetailedReactHTMLElement<{
        className: string;
        onClick: () => void;
    }, HTMLElement>;
}
export {};
