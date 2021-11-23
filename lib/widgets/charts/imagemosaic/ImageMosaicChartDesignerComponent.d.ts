import React from "react";
import * as ui from "../../../UIComponents";
import { DataSource, Schema } from "mwater-expressions";
export interface ImageMosaicChartDesignerComponentProps {
    design: any;
    schema: Schema;
    dataSource: DataSource;
    onDesignChange: any;
    filters?: any;
}
export default class ImageMosaicChartDesignerComponent extends React.Component<ImageMosaicChartDesignerComponentProps> {
    updateDesign(changes: any): any;
    handleTitleTextChange: (ev: any) => any;
    handleTableChange: (table: any) => any;
    handleFilterChange: (filter: any) => any;
    handleImageAxisChange: (imageAxis: any) => any;
    renderTable(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderTitle(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderFilter(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
    renderImageAxis(): React.CElement<ui.SectionComponentProps, ui.SectionComponent> | undefined;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
