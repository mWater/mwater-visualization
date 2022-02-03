import React from "react";
import AsyncLoadComponent from "react-library/lib/AsyncLoadComponent";
import AutoSizeComponent from "react-library/lib/AutoSizeComponent";
import DropdownWidgetComponent from "./DropdownWidgetComponent";
import ModalPopupComponent from "react-library/lib/ModalPopupComponent";
import { DataSource, Schema } from "mwater-expressions";
import { WidgetDataSource } from "./WidgetDataSource";
import { ImageWidgetDesign } from "./ImageWidget";
export interface ImageWidgetComponentProps {
    design: ImageWidgetDesign;
    /** Called with new design. null/undefined for readonly */
    onDesignChange?: (design: ImageWidgetDesign) => void;
    filters?: any;
    schema: Schema;
    /** Data source to use for widget */
    dataSource: DataSource;
    widgetDataSource: WidgetDataSource;
    width: number;
    height: number;
    singleRowTable?: string;
}
export default class ImageWidgetComponent extends AsyncLoadComponent<ImageWidgetComponentProps, {
    data: any;
    loading: boolean;
}> {
    editor: ImageWidgetDesignComponent | null;
    isLoadNeeded(newProps: ImageWidgetComponentProps, oldProps: ImageWidgetComponentProps): boolean;
    load(props: ImageWidgetComponentProps, prevProps: ImageWidgetComponentProps, callback: any): void;
    handleStartEditing: () => void;
    renderEditLink(): React.DetailedReactHTMLElement<{
        className: string;
        onClick: () => void;
    }, HTMLElement>;
    renderEditor(): React.CElement<any, ImageWidgetDesignComponent>;
    renderExpression(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | React.CElement<import("react-library/lib/AutoSizeComponent").AutoSizeComponentProps, AutoSizeComponent> | null;
    renderContent(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | React.CElement<import("react-library/lib/AutoSizeComponent").AutoSizeComponentProps, AutoSizeComponent> | React.CElement<RotatedImageComponentProps, RotatedImageComponent> | null;
    render(): React.CElement<import("./DropdownWidgetComponent").DropdownWidgetComponentProps, DropdownWidgetComponent>;
}
interface ImageWidgetDesignComponentProps {
    design: any;
    /** Called with new design. null/undefined for readonly */
    onDesignChange?: any;
    schema: Schema;
    dataSource: DataSource;
}
interface ImageWidgetDesignComponentState {
    imageUrl: any;
    url: any;
    uid: any;
    expr: any;
    caption: any;
    rotation: any;
    captionPosition: any;
    table: any;
    editing: any;
    currentTab: any;
    data: any;
    error: any;
    files: any;
    uploading: boolean;
    openUrlInSameTab?: boolean;
}
declare class ImageWidgetDesignComponent extends React.Component<ImageWidgetDesignComponentProps, ImageWidgetDesignComponentState> {
    constructor(props: any);
    edit: () => void;
    setCurrentTab(): void;
    handleImageUrlChange: (e: any) => void;
    handleUrlChange: (e: any) => void;
    renderUploadEditor(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    handleFileUpload: (uid: any) => void;
    handleExpressionChange: (expr: any) => void;
    handleTableChange: (table: any) => void;
    handleCaptionChange: (ev: any) => void;
    handleRotationChange: (rotation: any) => void;
    handleCaptionPositionChange: (captionPosition: any) => void;
    handleOpenUrlInSameTabChange: (openUrlInSameTab?: boolean | undefined) => void;
    handleSave: () => any;
    handleCancel: () => void;
    renderExpressionEditor(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderRotation(): React.DetailedReactHTMLElement<{
        style: {
            paddingTop: number;
        };
    }, HTMLElement>;
    renderImageUrlEditor(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderUrlEditor(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    render(): React.CElement<import("react-library/lib/ModalPopupComponent").ModalPopupComponentProps, ModalPopupComponent> | null;
}
interface RotatedImageComponentProps {
    /** Url of the image */
    imgUrl: string;
    rotation?: number;
    onClick?: any;
    caption?: string;
    url?: string;
    openUrlInSameTab?: boolean;
}
declare class RotatedImageComponent extends React.Component<RotatedImageComponentProps> {
    render(): React.CElement<import("react-library/lib/AutoSizeComponent").AutoSizeComponentProps, AutoSizeComponent>;
}
export {};
