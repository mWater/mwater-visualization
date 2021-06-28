import React from "react";
interface ImageMosaicChartDesignerComponentProps {
    design: any;
    schema: any;
    dataSource: any;
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
    renderImageAxis(): React.CElement<{
        label: string;
    }, React.Component<{
        label: string;
    }, any, any>> | undefined;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
