import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import { MapDesign, MapLayerView } from "./MapDesign";
export interface MapLayersDesignerComponentProps {
    /** Schema to use */
    schema: Schema;
    dataSource: DataSource;
    /** See Map Design.md */
    design: MapDesign;
    /** Called with new design */
    onDesignChange: (design: MapDesign) => void;
    /** True to allow editing layers */
    allowEditingLayers: boolean;
    filters?: any;
}
export default class MapLayersDesignerComponent extends React.Component<MapLayersDesignerComponentProps> {
    updateDesign(changes: any): void;
    handleLayerViewChange: (index: any, layerView: MapLayerView) => void;
    handleRemoveLayerView: (index: any) => void;
    handleReorder: (layerList: any) => void;
    renderLayerView: (layerView: any, index: any, connectDragSource: any, connectDragPreview: any, connectDropTarget: any) => React.DetailedReactHTMLElement<{
        style: {
            padding: string;
            border: string;
            marginBottom: number;
            backgroundColor: string;
        };
    }, HTMLElement>;
    render(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
}
