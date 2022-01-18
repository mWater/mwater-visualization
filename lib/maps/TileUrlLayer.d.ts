import React from "react";
import Layer from "./Layer";
import { DataSource, Schema } from "mwater-expressions";
import { JsonQLFilter } from "../JsonQLFilter";
export interface TileUrlLayerDesign {
    /** Url with {s}, {z}, {x}, {y} */
    tileUrl: string;
    /** optional min zoom level */
    minZoom?: number;
    /** optional max zoom level */
    maxZoom?: number;
    /** if true, hides url and prevents editing */
    readonly?: boolean;
    /** Url to get legend html from. */
    legendUrl?: string;
}
export default class TileUrlLayer extends Layer<TileUrlLayerDesign> {
    getLayerDefinitionType(): "TileUrl";
    getTileUrl(design: any, filters: any): any;
    getUtfGridUrl(design: any, filters: any): null;
    getMinZoom(design: any): any;
    getMaxZoom(design: any): any;
    isEditable(): boolean;
    isIncomplete(design: any, schema: Schema): boolean;
    getLegend(design: TileUrlLayerDesign, schema: Schema, name: string, dataSource: DataSource, locale: string, filters: JsonQLFilter[]): JSX.Element | null;
    createDesignerElement(options: any): React.CElement<TileUrlLayerDesignerComponentProps, TileUrlLayerDesignerComponent>;
    cleanDesign(design: any, schema: Schema): any;
    validateDesign(design: any, schema: Schema): "Missing Url" | null;
}
interface TileUrlLayerDesignerComponentProps {
    /** Design of the marker layer */
    design: TileUrlLayerDesign;
    onDesignChange: (design: TileUrlLayerDesign) => void;
}
declare class TileUrlLayerDesignerComponent extends React.Component<TileUrlLayerDesignerComponentProps> {
    handleTileUrlChange: (tileUrl: string) => void;
    handleLegendUrlChange: (legendUrl: string) => void;
    render(): JSX.Element | null;
}
export {};
