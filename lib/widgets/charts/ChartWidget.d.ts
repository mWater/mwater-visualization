import PropTypes from "prop-types";
import React from "react";
import Widget, { CreateViewElementOptions } from "./../Widget";
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent";
import ChartViewComponent from "./ChartViewComponent";
import ModalWindowComponent from "react-library/lib/ModalWindowComponent";
import { DataSource, Schema } from "mwater-expressions";
import { WidgetDataSource } from "../WidgetDataSource";
import Chart from "./Chart";
import { JsonQLFilter } from "../../JsonQLFilter";
/** A widget which is a chart */
export default class ChartWidget extends Widget {
    chart: Chart;
    constructor(chart: Chart);
    createViewElement(options: CreateViewElementOptions): React.CElement<any, ChartWidgetComponent>;
    getData(design: any, schema: Schema, dataSource: DataSource, filters: any, callback: any): void;
    getFilterableTables(design: any, schema: Schema): string[];
    isAutoHeight(): boolean;
}
interface ChartWidgetComponentProps {
    /** schema to use */
    schema: Schema;
    /** data source to use */
    dataSource: DataSource;
    widgetDataSource: WidgetDataSource;
    /** Chart object to use */
    chart: Chart;
    /** Design of chart */
    design: any;
    /** null/undefined for readonly */
    onDesignChange?: any;
    /** Width in pixels */
    width: number;
    /** Height, if a fixed height widget, or one that uses aspect ratio */
    height?: number;
    /** scope of the widget (when the widget self-selects a particular scope) */
    scope?: any;
    /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
    filters: JsonQLFilter[];
    /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
    onScopeChange?: any;
    /** Called with (tableId, rowId) when item is clicked */
    onRowClick?: any;
    /** Connects move handle for dragging (see WidgetContainerComponent) TODO REMOVE */
    connectMoveHandle?: any;
    /** Connects resize handle for dragging (see WidgetContainerComponent) TODO REMOVE */
    connectResizeHandle?: any;
}
declare class ChartWidgetComponent extends React.PureComponent<ChartWidgetComponentProps, {
    editDesign: any;
}> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    constructor(props: any);
    handleSaveCsvFile: () => void;
    handleStartEditing: () => void;
    handleEndEditing: () => void;
    handleCancelEditing: () => void;
    handleEditDesignChange: (design: any) => void;
    renderChart(design: any, onDesignChange: any, width: any, height: any): React.CElement<import("./ChartViewComponent").ChartViewComponentProps, ChartViewComponent>;
    renderEditor(): React.CElement<import("react-library/lib/ModalWindowComponent").ModalWindowComponentProps, ModalWindowComponent> | React.CElement<import("react-library/lib/ActionCancelModalComponent").ActionCancelModalComponentProps, ActionCancelModalComponent> | null;
    renderEditLink(): React.DetailedReactHTMLElement<{
        className: string;
        onClick: () => void;
    }, HTMLElement>;
    render(): React.DetailedReactHTMLElement<{
        onDoubleClick: (() => void) | undefined;
        style: {
            position: "relative";
            width: number;
        };
    }, HTMLElement>;
}
export {};
