import React from "react";
import ModalWindowComponent from "react-library/lib/ModalWindowComponent";
declare const _default: {
    new (): {
        createViewElement(options: any): React.CElement<any, MapWidgetComponent>;
        getFilterableTables(design: any, schema: any): string[];
        getData(design: any, schema: any, dataSource: any, filters: any, callback: any): void;
        isAutoHeight(): boolean;
        getTOCEntries(design: any, namedStrings: any): never[];
    };
};
export default _default;
interface MapWidgetComponentProps {
    /** Schema to use */
    schema: any;
    /** Data source to use */
    dataSource: any;
    widgetDataSource: any;
    /** See Map Design.md */
    design: any;
    /** Called with new design.  null/undefined for readonly */
    onDesignChange?: any;
    width?: number;
    height?: number;
    /** scope of the widget (when the widget self-selects a particular scope) */
    scope?: any;
    /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
    filters?: any;
    /** called with (scope) as a scope to apply to self and filter to apply to other widgets. See WidgetScoper for details */
    onScopeChange?: any;
    onRowClick?: any;
}
interface MapWidgetComponentState {
    editDesign: any;
    transientDesign: any;
}
declare class MapWidgetComponent extends React.Component<MapWidgetComponentProps, MapWidgetComponentState> {
    constructor(props: any);
    componentDidUpdate(prevProps: any): void;
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
    renderContent(design: any, onDesignChange: any, width: any, height: any): React.DetailedReactHTMLElement<{
        style: {
            width: any;
            height: any;
            padding: number;
        };
    }, HTMLElement>;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
