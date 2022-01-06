import React from "react";
import AsyncLoadComponent from "react-library/lib/AsyncLoadComponent";
import DropdownWidgetComponent from "./DropdownWidgetComponent";
import { DataSource, Schema } from "mwater-expressions";
import { WidgetDataSource } from "./WidgetDataSource";
export interface ImageWidgetComponentProps {
    design: any;
    /** Called with new design. null/undefined for readonly */
    onDesignChange?: any;
    filters?: any;
    schema: Schema;
    /** Data source to use for widget */
    dataSource: DataSource;
    widgetDataSource: WidgetDataSource;
    width?: number;
    height?: number;
    singleRowTable?: string;
}
export default class ImageWidgetComponent extends AsyncLoadComponent<ImageWidgetComponentProps> {
    isLoadNeeded(newProps: any, oldProps: any): boolean;
    load(props: any, prevProps: any, callback: any): any;
    handleStartEditing: () => any;
    renderEditLink(): React.DetailedReactHTMLElement<{
        className: string;
        onClick: () => any;
    }, HTMLElement>;
    renderEditor(): React.CElement<any, any>;
    renderExpression(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | undefined;
    renderContent(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | React.CElement<RotatedImageComponentProps, RotatedImageComponent> | undefined;
    render(): React.CElement<import("./DropdownWidgetComponent").DropdownWidgetComponentProps, DropdownWidgetComponent>;
}
interface RotatedImageComponentProps {
    /** Url of the image */
    imgUrl: string;
    rotation?: number;
    onClick?: any;
    caption?: string;
    url?: string;
}
declare class RotatedImageComponent extends React.Component<RotatedImageComponentProps> {
    render(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
}
export {};
