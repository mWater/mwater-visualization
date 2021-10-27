import React from "react";
interface ExprItemEditorComponentProps {
    /** Schema to use */
    schema: any;
    /** Data source to use to get values */
    dataSource: any;
    /** Expression item to edit */
    exprItem: any;
    /** Called with expr item */
    onChange: any;
    singleRowTable?: string;
}
interface ExprItemEditorComponentState {
    table: any;
}
export default class ExprItemEditorComponent extends React.Component<ExprItemEditorComponentProps, ExprItemEditorComponentState> {
    constructor(props: any);
    handleTableChange: (table: any) => void;
    handleExprChange: (expr: any) => any;
    handleIncludeLabelChange: (value: any) => any;
    handleLabelTextChange: (ev: any) => any;
    handleFormatChange: (ev: any) => any;
    renderFormat(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
    render(): React.DetailedReactHTMLElement<{
        style: {
            paddingBottom: number;
        };
    }, HTMLElement>;
}
export {};
