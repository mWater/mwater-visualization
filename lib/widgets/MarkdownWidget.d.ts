import React from "react";
import ModalWindowComponent from "react-library/lib/ModalWindowComponent";
declare const _default: {
    new (): {
        createViewElement(options: any): React.CElement<any, MarkdownWidgetComponent>;
        isAutoHeight(): boolean;
        getData(design: any, schema: any, dataSource: any, filters: any, callback: any): void;
        getFilterableTables(design: any, schema: any): never[];
        getTOCEntries(design: any, namedStrings: any): never[];
    };
};
export default _default;
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
    renderEditor(): React.CElement<{
        isOpen: boolean;
        onRequestClose?: (() => void) | undefined;
        backgroundColor?: string | undefined;
        outerPadding?: number | undefined;
        innerPadding?: number | undefined;
    }, ModalWindowComponent> | null;
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
