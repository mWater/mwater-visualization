import React from "react";
interface LayeredChartViewComponentProps {
    schema: any;
    dataSource: any;
    design: any;
    data: any;
    onDesignChange?: any;
    width: number;
    height: number;
    /** scope of the widget (when the widget self-selects a particular scope) */
    scope?: any;
    /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
    onScopeChange?: any;
}
interface LayeredChartViewComponentState {
    headerHeight: any;
    footerHeight: any;
}
export default class LayeredChartViewComponent extends React.Component<LayeredChartViewComponentProps, LayeredChartViewComponentState> {
    static initClass(): void;
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(): void;
    updateHeights(): void;
    handleHeaderChange: (header: any) => any;
    handleFooterChange: (footer: any) => any;
    renderHeader(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    renderFooter(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    render(): React.DetailedReactHTMLElement<{
        style: {
            width: number;
            height: number;
        };
    }, HTMLElement>;
}
export {};
