import React from "react";
import { DataSource, Schema } from "mwater-expressions";
interface MapLayersDesignerComponentProps {
    /** Schema to use */
    schema: Schema;
    dataSource: DataSource;
    /** See Map Design.md */
    design: any;
    /** Called with new design */
    onDesignChange: any;
    /** True to allow editing layers */
    allowEditingLayers: boolean;
    filters?: any;
}
export default class MapLayersDesignerComponent extends React.Component<MapLayersDesignerComponentProps> {
    updateDesign(changes: any): any;
    handleLayerViewChange: (index: any, layerView: any) => any;
    handleRemoveLayerView: (index: any) => any;
    handleReorder: (layerList: any) => any;
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
export {};
