import React from "react";
import EditPopupComponent from "./EditPopupComponent";
interface BufferLayerDesignerComponentProps {
    /** Schema to use */
    schema: any;
    dataSource: any;
    /** Design of the design */
    design: any;
    /** Called with new design */
    onDesignChange: any;
    filters?: any;
}
export default class BufferLayerDesignerComponent extends React.Component<BufferLayerDesignerComponentProps> {
    update(updates: any): any;
    updateAxes(changes: any): any;
    handleTableChange: (table: any) => any;
    handleRadiusChange: (radius: any) => any;
    handleGeometryAxisChange: (axis: any) => any;
    handleFilterChange: (expr: any) => any;
    handleColorChange: (color: any) => any;
    handleColorAxisChange: (axis: any) => any;
    handleFillOpacityChange: (fillOpacity: any) => any;
    renderTable(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderGeometryAxis(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | undefined;
    renderRadius(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderColor(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | undefined;
    renderFillOpacity(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderFilter(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
    renderPopup(): React.CElement<any, EditPopupComponent> | null;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
