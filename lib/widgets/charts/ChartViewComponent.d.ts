import { DataSource, Schema } from "mwater-expressions";
import React from "react";
import { JsonQLFilter } from "../../JsonQLFilter";
import { WidgetScope } from "../../WidgetScope";
import { WidgetDataSource } from "../WidgetDataSource";
import Chart from "./Chart";
export interface ChartViewComponentProps {
    /** Chart object to use */
    chart: Chart;
    /** Design of chart */
    design: any;
    /** When design change */
    onDesignChange?: (design: any) => void;
    schema: Schema;
    /** Data source to use for chart */
    dataSource: DataSource;
    widgetDataSource: WidgetDataSource;
    width?: number;
    height?: number;
    /** scope of the widget (when the widget self-selects a particular scope) */
    scope?: WidgetScope;
    /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias }. Use injectAlias to correct */
    filters?: JsonQLFilter[];
    /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
    onScopeChange?: (scope: WidgetScope | null) => void;
    onRowClick?: (tableId: string, rowId: any) => void;
}
interface ChartViewComponentState {
    cacheExpiry?: any;
    dataLoading?: any;
    validDesign?: any;
    dataError?: any;
    data?: any;
    showErrorDetails: boolean;
}
/** Inner view part of the chart widget. Uses a query data loading component
 * to handle loading and continues to display old data if design becomes
 * invalid
 */
export default class ChartViewComponent extends React.Component<ChartViewComponentProps, ChartViewComponentState> {
    /** Ordinal of update (0, 1, 2...) to ensure using latest */
    updateSeq: number;
    constructor(props: ChartViewComponentProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: ChartViewComponentProps): void;
    updateData(): void;
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
    renderError(): React.DetailedReactHTMLElement<{
        style: {
            position: "absolute";
            bottom: string;
            left: number;
            right: number;
            textAlign: "center";
        };
    }, HTMLElement>;
    render(): React.DetailedReactHTMLElement<{
        style: {
            position: "absolute";
            bottom: string;
            left: number;
            right: number;
            textAlign: "center";
        };
    }, HTMLElement> | React.DetailedReactHTMLElement<{
        style: React.CSSProperties;
    }, HTMLElement>;
}
export {};
