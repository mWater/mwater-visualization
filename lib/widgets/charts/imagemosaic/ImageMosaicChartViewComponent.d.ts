import React from "react";
import ImagePopupComponent from "./ImagePopupComponent";
import { DataSource } from "mwater-expressions";
export interface ImageMosaicChartViewComponentProps {
    /** Design of chart */
    design: any;
    /** Data that the chart has requested. In format  [image: {image data or imagelist data}] */
    data: any;
    /** Data source to use */
    dataSource: DataSource;
    width?: number;
    height?: number;
    onRowClick?: any;
}
/** creates a d3 calendar visualization */
export default class ImageMosaicChartViewComponent extends React.Component<ImageMosaicChartViewComponentProps> {
    imagePopup: ImagePopupComponent | null;
    shouldComponentUpdate(prevProps: any): boolean;
    handleClick: (primaryKey: any, image: any) => any;
    renderImage: (primaryKey: any, image: any, imageManager: any) => React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    renderImages(imageManager: any): (React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> | React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>[])[];
    render(): React.ReactElement<{
        style: {
            width: number | undefined;
            height: number | undefined;
            position: string;
            overflowY: string;
        };
        className: string;
    }, string | React.JSXElementConstructor<any>>;
}
