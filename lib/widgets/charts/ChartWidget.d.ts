import React from "react";
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent";
import ChartViewComponent from "./ChartViewComponent";
import ModalWindowComponent from "react-library/lib/ModalWindowComponent";
declare const _default: {
    new (chart: any): {
        createViewElement(options: any): React.CElement<any, ChartWidgetComponent>;
        getData(design: any, schema: any, dataSource: any, filters: any, callback: any): any;
        getFilterableTables(design: any, schema: any): any;
        isAutoHeight(): any;
        getTOCEntries(design: any, namedStrings: any): never[];
    };
};
export default _default;
interface ChartWidgetComponentProps {
    /** schema to use */
    schema: any;
    /** data source to use */
    dataSource: any;
    widgetDataSource: any;
    /** Chart object to use */
    chart: any;
    /** Design of chart */
    design: any;
    /** null/undefined for readonly */
    onDesignChange?: any;
    /** Data source to use for chart */
    dataSource: any;
    width?: number;
    height?: number;
    /** scope of the widget (when the widget self-selects a particular scope) */
    scope?: any;
    /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
    filters?: any;
    /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
    onScopeChange?: any;
    /** Called with (tableId, rowId) when item is clicked */
    onRowClick?: any;
    /** Connects move handle for dragging (see WidgetContainerComponent) TODO REMOVE */
    connectMoveHandle?: any;
    /** Connects resize handle for dragging (see WidgetContainerComponent) TODO REMOVE */
    connectResizeHandle?: any;
}
declare class ChartWidgetComponent extends React.PureComponent<ChartWidgetComponentProps> {
    static initClass(): void;
    constructor(props: any);
    handleSaveCsvFile: () => any;
    handleStartEditing: () => void;
    handleEndEditing: () => void;
    handleCancelEditing: () => void;
    handleEditDesignChange: (design: any) => void;
    renderChart(design: any, onDesignChange: any, width: any, height: any): React.CElement<any, ChartViewComponent>;
    renderEditor(): React.CElement<{
        isOpen: boolean;
        onRequestClose?: (() => void) | undefined;
        backgroundColor?: string | undefined;
        outerPadding?: number | undefined;
        innerPadding?: number | undefined;
    }, ModalWindowComponent> | React.CElement<{
        title?: React.ReactNode;
        actionLabel?: React.ReactNode;
        cancelLabel?: React.ReactNode;
        deleteLabel?: React.ReactNode;
        onAction?: (() => void) | undefined;
        onCancel?: (() => void) | undefined;
        onDelete?: (() => void) | undefined;
        size?: "full" | "large" | undefined;
        actionBusy?: boolean | undefined;
    }, ActionCancelModalComponent> | null;
    renderEditLink(): React.DetailedReactHTMLElement<{
        className: string;
        onClick: () => void;
    }, HTMLElement>;
    render(): React.DetailedReactHTMLElement<{
        onDoubleClick: (() => void) | undefined;
        style: {
            position: "relative";
            width: number | undefined;
        };
    }, HTMLElement>;
}
