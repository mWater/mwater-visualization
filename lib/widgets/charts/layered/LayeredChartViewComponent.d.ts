import PropTypes from "prop-types";
import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import { LayeredChartDesign } from "./LayeredChartDesign";
import { WidgetScope } from "../../../WidgetScope";
export interface LayeredChartViewComponentProps {
    schema: Schema;
    dataSource: DataSource;
    design: LayeredChartDesign;
    data: any;
    onDesignChange?: any;
    width: number;
    height: number;
    /** scope of the widget (when the widget self-selects a particular scope) */
    scope?: WidgetScope;
    /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
    onScopeChange?: (scope?: WidgetScope) => void;
}
interface LayeredChartViewComponentState {
    headerHeight: any;
    footerHeight: any;
}
export default class LayeredChartViewComponent extends React.Component<LayeredChartViewComponentProps, LayeredChartViewComponentState> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    header: HTMLElement | null;
    footer: HTMLElement | null;
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: LayeredChartViewComponentProps): void;
    updateHeights(): void;
    handleHeaderChange: (header: any) => void;
    handleFooterChange: (footer: any) => void;
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
