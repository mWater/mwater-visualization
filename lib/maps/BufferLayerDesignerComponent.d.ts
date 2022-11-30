import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import EditPopupComponent from "./EditPopupComponent";
import { BufferLayerDesign } from "./BufferLayerDesign";
import { JsonQLFilter } from "../JsonQLFilter";
export interface BufferLayerDesignerComponentProps {
    /** Schema to use */
    schema: Schema;
    dataSource: DataSource;
    /** Design of the design */
    design: BufferLayerDesign;
    /** Called with new design */
    onDesignChange: (design: BufferLayerDesign) => void;
    filters?: JsonQLFilter[];
}
export default class BufferLayerDesignerComponent extends React.Component<BufferLayerDesignerComponentProps> {
    update(updates: any): void;
    updateAxes(changes: any): void;
    handleTableChange: (table: any) => void;
    handleRadiusChange: (radius: any) => void;
    handleGeometryAxisChange: (axis: any) => void;
    handleFilterChange: (expr: any) => void;
    handleColorChange: (color: any) => void;
    handleColorAxisChange: (axis: any) => void;
    handleFillOpacityChange: (fillOpacity: any) => void;
    handleUnionShapesChange: (unionShapes: boolean) => void;
    renderTable(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderGeometryAxis(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | undefined;
    renderRadius(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderUnionShapes(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
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
