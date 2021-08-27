import { JsonQLQuery } from "jsonql";
import { DataSource, Schema } from "mwater-expressions";
import React from "react";
import { JsonQLFilter } from "../JsonQLFilter";
import { ClusterLayerDesign } from "./ClusterLayerDesign";
import Layer, { VectorTileDef } from "./Layer";
export default class ClusterLayer extends Layer<ClusterLayerDesign> {
    /** Gets the type of layer definition */
    getLayerDefinitionType(): "VectorTile";
    getVectorTile(design: ClusterLayerDesign, sourceId: string, schema: Schema, filters: JsonQLFilter[], opacity: number): VectorTileDef;
    createJsonQL(design: ClusterLayerDesign, schema: Schema, filters: JsonQLFilter[]): JsonQLQuery;
    getJsonQLCss(design: ClusterLayerDesign, schema: Schema, filters: JsonQLFilter[]): {
        layers: {
            id: string;
            jsonql: JsonQLQuery;
        }[];
        css: string;
    };
    createMapnikJsonQL(design: ClusterLayerDesign, schema: Schema, filters: JsonQLFilter[]): JsonQLQuery;
    createCss(design: ClusterLayerDesign, schema: Schema): string;
    getBounds(design: ClusterLayerDesign, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[], callback: any): any;
    getMinZoom(design: ClusterLayerDesign): number | undefined;
    getMaxZoom(design: ClusterLayerDesign): number;
    getLegend(design: ClusterLayerDesign, schema: Schema, name: string, dataSource: DataSource, locale: string, filters?: JsonQLFilter[]): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    getFilterableTables(design: ClusterLayerDesign, schema: Schema): string[];
    isEditable(): boolean;
    isIncomplete(design: ClusterLayerDesign, schema: Schema): boolean;
    createDesignerElement(options: {
        design: ClusterLayerDesign;
        schema: Schema;
        dataSource: DataSource;
        onDesignChange: (design: ClusterLayerDesign) => void;
        filters: JsonQLFilter[];
    }): React.ReactElement<{}>;
    cleanDesign(design: ClusterLayerDesign, schema: Schema): ClusterLayerDesign;
    validateDesign(design: ClusterLayerDesign, schema: Schema): string | null;
}
