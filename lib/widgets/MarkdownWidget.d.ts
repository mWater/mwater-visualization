import React from "react";
import Widget, { CreateViewElementOptions } from "./Widget";
import ModalWindowComponent from "react-library/lib/ModalWindowComponent";
export default class MarkdownWidget extends Widget {
    createViewElement(options: CreateViewElementOptions): React.CElement<any, MarkdownWidgetComponent>;
    isAutoHeight(): boolean;
}
interface MarkdownWidgetComponentProps {
    /** See Map Design.md */
    design: any;
    /** Called with new design. null/undefined for readonly */
    onDesignChange?: any;
    width?: number;
    height?: number;
}
interface MarkdownWidgetComponentState {
    editDesign: any;
}
declare class MarkdownWidgetComponent extends React.Component<MarkdownWidgetComponentProps, MarkdownWidgetComponentState> {
    constructor(props: any);
    handleStartEditing: () => void;
    handleEndEditing: () => void;
    handleEditDesignChange: (design: any) => void;
    renderEditor(): React.CElement<import("react-library/lib/ModalWindowComponent").ModalWindowComponentProps, ModalWindowComponent> | null;
    renderContent(design: any): React.CElement<MarkdownWidgetViewComponentProps, MarkdownWidgetViewComponent>;
    render(): React.DetailedReactHTMLElement<{
        onDoubleClick: () => void;
    }, HTMLElement>;
}
interface MarkdownWidgetViewComponentProps {
    /** Design of chart */
    design: any;
    width?: number;
    height?: number;
}
declare class MarkdownWidgetViewComponent extends React.Component<MarkdownWidgetViewComponentProps> {
    render(): React.DetailedReactHTMLElement<{
        style: {
            width: number | undefined;
            height: number | undefined;
        };
        className: string;
        dangerouslySetInnerHTML: {
            __html: any;
        };
    }, HTMLElement>;
}
export {};
