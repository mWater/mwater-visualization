import React from "react";
import TabbedComponent from "react-library/lib/TabbedComponent";
import * as uiComponents from "../../../UIComponents";
import { DataSource, Schema } from "mwater-expressions";
import { LayeredChartDesign } from "./LayeredChartDesign";
import { JsonQLFilter } from "../../..";
export interface LayeredChartDesignerComponentProps {
    design: LayeredChartDesign;
    schema: Schema;
    dataSource: DataSource;
    onDesignChange: (design: LayeredChartDesign) => void;
    filters?: JsonQLFilter[];
}
export default class LayeredChartDesignerComponent extends React.Component<LayeredChartDesignerComponentProps> {
    areAxesLabelsNeeded(): boolean;
    updateDesign(changes: any): void;
    handleTypeChange: (type: any) => void;
    handleTransposeChange: (value: any) => void;
    handleStackedChange: (value: any) => void;
    handleProportionalChange: (value: any) => void;
    handleLabelsChange: (value: any) => void;
    handleLabelsPopoutChange: (value: any) => void;
    handlePercentageVisibilityChange: (value: any) => void;
    handlePolarOrderChange: (value: any) => void;
    handleYThresholdsChange: (yThresholds: any) => void;
    handleLayerChange: (index: any, layer: any) => void;
    handleRemoveLayer: (index: any) => void;
    handleAddLayer: () => void;
    handleXAxisLabelTextChange: (ev: any) => void;
    handleYAxisLabelTextChange: (ev: any) => void;
    handleToggleXAxisLabelClick: (ev: any) => void;
    handleToggleYAxisLabelClick: (ev: any) => void;
    handleYMinChange: (yMin: any) => void;
    handleYMaxChange: (yMax: any) => void;
    renderLabels(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | undefined;
    renderType(): React.CElement<uiComponents.SectionComponentProps, uiComponents.SectionComponent>;
    renderLayer: (index: any) => React.DetailedReactHTMLElement<{
        style: {
            paddingTop: number;
            paddingBottom: number;
        };
        key: any;
    }, HTMLElement>;
    renderLayers(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | undefined;
    renderOptions(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | undefined;
    renderThresholds(): React.CElement<uiComponents.SectionComponentProps, uiComponents.SectionComponent> | null;
    renderYRange(): React.CElement<uiComponents.SectionComponentProps, uiComponents.SectionComponent> | null;
    render(): React.CElement<any, TabbedComponent>;
}
