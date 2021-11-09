import React from "react";
import Layer from "./Layer";
import { Schema } from "mwater-expressions";
export interface TileUrlLayerDesign {
    tileUrl: string;
    minZoom?: number;
    maxZoom?: number;
    readonly?: boolean;
}
export default class TileUrlLayer extends Layer<TileUrlLayerDesign> {
    getLayerDefinitionType(): "TileUrl";
    getTileUrl(design: any, filters: any): any;
    getUtfGridUrl(design: any, filters: any): null;
    getMinZoom(design: any): any;
    getMaxZoom(design: any): any;
    isEditable(): boolean;
    isIncomplete(design: any, schema: Schema): boolean;
    createDesignerElement(options: any): React.CElement<TileUrlLayerDesignerComponentProps, TileUrlLayerDesignerComponent>;
    cleanDesign(design: any, schema: Schema): any;
    validateDesign(design: any, schema: Schema): "Missing Url" | null;
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
