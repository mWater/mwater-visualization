import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import EditPopupComponent from "./EditPopupComponent";
import MarkerSymbolSelectComponent from "./MarkerSymbolSelectComponent";
export interface MarkersLayerDesignerComponentProps {
    /** Schema to use */
    schema: Schema;
    dataSource: DataSource;
    /** Design of the marker layer */
    design: any;
    /** Called with new design */
    onDesignChange: any;
    filters?: any;
}
export default class MarkersLayerDesignerComponent extends React.Component<MarkersLayerDesignerComponentProps> {
    update(updates: any): any;
    updateAxes(changes: any): any;
    handleTableChange: (table: any) => any;
    handleGeometryAxisChange: (axis: any) => any;
    handleColorAxisChange: (axis: any) => any;
    handleFilterChange: (expr: any) => any;
    handleColorChange: (color: any) => any;
    handleSymbolChange: (symbol: any) => any;
    handleNameChange: (e: any) => any;
    handleMarkerSizeChange: (markerSize: any) => any;
    handleLineWidthChange: (lineWidth: any) => any;
    renderTable(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderGeometryAxis(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | undefined;
    renderColor(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | undefined;
    renderSymbol(): React.CElement<import("./MarkerSymbolSelectComponent").MarkerSymbolSelectComponentProps, MarkerSymbolSelectComponent> | undefined;
    renderMarkerSize(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | undefined;
    renderLineWidth(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | undefined;
    renderFilter(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
    renderPopup(): React.CElement<any, EditPopupComponent> | null;
    renderHoverOver(): React.FunctionComponentElement<import("./EditHoverOver").EditHoverOverProps> | null;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
