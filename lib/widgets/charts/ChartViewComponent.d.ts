import React from "react";
interface ChartViewComponentProps {
    /** Chart object to use */
    chart: any;
    /** Design of chart */
    design: any;
    /** When design change */
    onDesignChange?: any;
    schema: any;
    /** Data source to use for chart */
    dataSource: any;
    widgetDataSource: any;
    width?: number;
    height?: number;
    /** scope of the widget (when the widget self-selects a particular scope) */
    scope?: any;
    /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias }. Use injectAlias to correct */
    filters?: any;
    /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
    onScopeChange?: any;
    onRowClick?: any;
}
interface ChartViewComponentState {
    cacheExpiry?: any;
    dataLoading?: any;
    validDesign?: any;
    dataError?: any;
    data?: any;
}
export default class ChartViewComponent extends React.Component<ChartViewComponentProps, ChartViewComponentState> {
    constructor(props: any);
    componentDidMount(): void;
    componentWillReceiveProps(nextProps: any): void;
    updateData(props: any): void;
    loadData(props: any, callback: any): void;
    renderSpinner(): React.DetailedReactHTMLElement<{
        style: {
            position: "absolute";
            bottom: string;
            left: number;
            right: number;
            textAlign: "center";
            fontSize: number;
        };
    }, HTMLElement>;
    render(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | React.DetailedReactHTMLElement<{
        style: React.CSSProperties;
    }, HTMLElement>;
}
export {};
