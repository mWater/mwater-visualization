import React from "react";
interface MapLayerViewDesignerComponentProps {
    /** Schema to use */
    schema: any;
    dataSource: any;
    /** See Map Design.md */
    layerView: any;
    /** Called with new layer view */
    onLayerViewChange: any;
    /** Called to remove */
    onRemove: any;
    /** connector for reorderable */
    connectDragSource?: any;
    /** connector for reorderable */
    connectDragPreview?: any;
    /** connector for reorderable */
    connectDropTarget?: any;
    allowEditingLayer: boolean;
    filters?: any;
}
interface MapLayerViewDesignerComponentState {
    editing: any;
}
export default class MapLayerViewDesignerComponent extends React.Component<MapLayerViewDesignerComponentProps, MapLayerViewDesignerComponentState> {
    constructor(props: any);
    update(updates: any): any;
    handleVisibleClick: () => any;
    handleHideLegend: (hideLegend: any) => any;
    handleGroupChange: (group: any) => any;
    handleToggleEditing: () => void;
    handleSaveEditing: (design: any) => any;
    handleRename: () => any;
    renderVisible(): React.DetailedReactHTMLElement<{
        className: string;
        style: {
            color: "#2E6DA4";
        };
        onClick: () => any;
    }, HTMLElement> | React.DetailedReactHTMLElement<{
        className: string;
        style: {
            color: "#DDDDDD";
        };
        onClick: () => any;
    }, HTMLElement>;
    renderAdvanced(): React.DetailedReactHTMLElement<{
        key: string;
        style: {
            display: "grid";
            gridTemplateColumns: string;
            alignItems: "center";
            columnGap: number;
        };
    }, HTMLElement>;
    renderName(): React.DetailedReactHTMLElement<{
        className: string;
        onClick: () => any;
        style: {
            cursor: "pointer";
        };
    }, HTMLElement>;
    renderEditor(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    renderLayerEditToggle(): React.DetailedReactHTMLElement<{
        key: string;
        style: {
            marginBottom: number | undefined;
        };
    }, HTMLElement>;
    handleOpacityChange: (newValue: any) => any;
    handleRemove: () => any;
    renderOpacityControl(): React.DetailedReactHTMLElement<{
        className: string;
        style: {
            paddingTop: number;
        };
    }, HTMLElement>;
    renderDeleteLayer(): React.DetailedReactHTMLElement<{
        style: {
            float: "right";
            cursor: "pointer";
            marginLeft: number;
        };
        key: string;
    }, HTMLElement>;
    render(): any;
}
export {};
