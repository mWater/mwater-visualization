import React from "react";
import Layer from "./Layer";
export default class TileUrlLayer extends Layer {
    getLayerDefinitionType(): string;
    getTileUrl(design: any, filters: any): any;
    getUtfGridUrl(design: any, filters: any): null;
    getMinZoom(design: any): any;
    getMaxZoom(design: any): any;
    isEditable(): boolean;
    isIncomplete(design: any, schema: any): boolean;
    createDesignerElement(options: any): React.CElement<TileUrlLayerDesignerComponentProps, TileUrlLayerDesignerComponent>;
    cleanDesign(design: any, schema: any): any;
    validateDesign(design: any, schema: any): "Missing Url" | null;
}
interface TileUrlLayerDesignerComponentProps {
    /** Design of the marker layer */
    design: any;
    onDesignChange: any;
}
declare class TileUrlLayerDesignerComponent extends React.Component<TileUrlLayerDesignerComponentProps> {
    handleTileUrlChange: (ev: any) => any;
    render(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
}
export {};
