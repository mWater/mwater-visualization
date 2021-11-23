import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import * as uiComponents from "../../../UIComponents";
export interface LayeredChartLayerDesignerComponentProps {
    design: any;
    schema: Schema;
    dataSource: DataSource;
    index: number;
    onChange: any;
    onRemove: any;
    filters?: any;
}
export default class LayeredChartLayerDesignerComponent extends React.Component<LayeredChartLayerDesignerComponentProps> {
    isLayerPolar(layer: any): boolean;
    doesLayerNeedGrouping(layer: any): boolean;
    isXAxisRequired(layer: any): boolean;
    getAxisTypes(layer: any, axisKey: any): string[] | undefined;
    getAxisLabel(icon: any, label: any): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    getXAxisLabel(layer: any): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    getYAxisLabel(layer: any): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    getColorAxisLabel(layer: any): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    updateLayer(changes: any): any;
    updateAxes(changes: any): any;
    handleNameChange: (ev: any) => any;
    handleTableChange: (table: any) => any;
    handleXAxisChange: (axis: any) => any;
    handleXColorMapChange: (xColorMap: any) => any;
    handleColorAxisChange: (axis: any) => any;
    handleYAxisChange: (axis: any) => any;
    handleFilterChange: (filter: any) => any;
    handleColorChange: (color: any) => any;
    handleCumulativeChange: (value: any) => any;
    handleTrendlineChange: (value: any) => any;
    handleStackedChange: (value: any) => any;
    renderName(): React.DetailedReactHTMLElement<{
        type: string;
        className: string;
        value: any;
        onChange: (ev: any) => any;
        placeholder: string;
    }, HTMLElement>;
    renderRemove(): React.DetailedReactHTMLElement<{
        className: string;
        type: string;
        onClick: any;
    }, HTMLElement> | undefined;
    renderTable(): React.CElement<uiComponents.SectionComponentProps, uiComponents.SectionComponent>;
    renderXAxis(): React.CElement<uiComponents.SectionComponentProps, uiComponents.SectionComponent> | undefined;
    renderColorAxis(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | undefined;
    renderYAxis(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | undefined;
    renderCumulative(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | undefined;
    renderTrendline(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | undefined;
    renderStacked(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | null;
    renderColor(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | undefined;
    renderFilter(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
