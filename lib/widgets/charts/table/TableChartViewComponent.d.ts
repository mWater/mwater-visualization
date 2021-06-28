import React from "react";
interface TableChartViewComponentProps {
    /** Design of chart */
    design: any;
    /** Data that the table has requested */
    data: any;
    /** Schema to use */
    schema: any;
    width?: number;
    height?: number;
    /** scope of the widget (when the widget self-selects a particular scope) */
    scope?: any;
    /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
    onScopeChange?: any;
    onRowClick?: any;
}
export default class TableChartViewComponent extends React.Component<TableChartViewComponentProps> {
    shouldComponentUpdate(prevProps: any): boolean;
    render(): React.DetailedReactHTMLElement<{
        style: {
            width: number | undefined;
            height: number | undefined;
        };
        className: string;
    }, HTMLElement>;
}
export {};
