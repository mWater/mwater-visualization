import React from "react";
import Widget from "./Widget";
import ModalWindowComponent from "react-library/lib/ModalWindowComponent";
import { DataSource, Schema } from "mwater-expressions";
import { WidgetDataSource } from "./WidgetDataSource";
export default class MapWidget extends Widget {
    createViewElement(options: any): React.CElement<any, MapWidgetComponent>;
    getFilterableTables(design: any, schema: Schema): string[];
}
interface MapWidgetComponentProps {
    /** Schema to use */
    schema: Schema;
    /** Data source to use */
    dataSource: DataSource;
    widgetDataSource: WidgetDataSource;
    /** See Map Design.md */
    design: any;
    /** Called with new design.  null/undefined for readonly */
    onDesignChange?: any;
    width?: number;
    height?: number;
    /** scope of the widget (when the widget self-selects a particular scope) */
    scope?: any;
    /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
    filters?: any;
    /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
    onScopeChange?: any;
    onRowClick?: any;
}
interface MapWidgetComponentState {
    editDesign: any;
    transientDesign: any;
}
declare class MapWidgetComponent extends React.Component<MapWidgetComponentProps, MapWidgetComponentState> {
    constructor(props: any);
    componentDidUpdate(prevProps: any): void;
    handleStartEditing: () => void;
    handleEndEditing: () => void;
    handleEditDesignChange: (design: any) => void;
    renderEditor(): React.CElement<any, ModalWindowComponent> | null;
    renderContent(design: any, onDesignChange: any, width: any, height: any): React.DetailedReactHTMLElement<{
        style: {
            width: any;
            height: any;
            padding: number;
        };
    }, HTMLElement>;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
