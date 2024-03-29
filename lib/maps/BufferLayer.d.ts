import { JsonQLQuery } from "jsonql";
import { DataSource, Schema } from "mwater-expressions";
import React from "react";
import { JsonQLFilter } from "../JsonQLFilter";
import { BufferLayerDesign } from "./BufferLayerDesign";
import Layer, { OnGridClickOptions, OnGridHoverOptions, VectorTileDef } from "./Layer";
import { OnGridClickResults, OnGridHoverResults } from "./maps";
import LayerLegendComponent from "./LayerLegendComponent";
export default class BufferLayer extends Layer<BufferLayerDesign> {
    /** Gets the type of layer definition */
    getLayerDefinitionType(): "VectorTile";
    getVectorTile(design: BufferLayerDesign, sourceId: string, schema: Schema, filters: JsonQLFilter[], opacity: number): VectorTileDef;
    createJsonQL(design: BufferLayerDesign, schema: Schema, filters: JsonQLFilter[]): JsonQLQuery;
    getJsonQLCss(design: BufferLayerDesign, schema: Schema, filters: JsonQLFilter[]): {
        layers: {
            id: string;
            jsonql: import("jsonql").JsonQLSelectQuery;
        }[];
        css: string;
        interactivity: {
            layer: string;
            fields: string[];
        };
    };
    createMapnikJsonQL(design: BufferLayerDesign, schema: Schema, filters: JsonQLFilter[]): import("jsonql").JsonQLSelectQuery;
    createCss(design: BufferLayerDesign, schema: Schema): string;
    onGridClick(ev: {
        data: any;
        event: any;
    }, clickOptions: OnGridClickOptions<BufferLayerDesign>): OnGridClickResults;
    onGridHoverOver(ev: {
        data: any;
        event: any;
    }, hoverOptions: OnGridHoverOptions<BufferLayerDesign>): OnGridHoverResults;
    getBounds(design: BufferLayerDesign, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[], callback: any): void;
    getMinZoom(design: BufferLayerDesign): number | undefined;
    getMaxZoom(design: BufferLayerDesign): number;
    getLegend(design: BufferLayerDesign, schema: Schema, name: string, dataSource: DataSource, locale: string, filters: JsonQLFilter[]): React.CElement<import("./LayerLegendComponent").LayerLegendComponentProps, LayerLegendComponent>;
    getFilterableTables(design: BufferLayerDesign, schema: Schema): string[];
    isEditable(): boolean;
    isIncomplete(design: BufferLayerDesign, schema: Schema): boolean;
    createDesignerElement(options: {
        design: BufferLayerDesign;
        schema: Schema;
        dataSource: DataSource;
        onDesignChange: (design: BufferLayerDesign) => void;
        filters: JsonQLFilter[];
    }): React.ReactElement<{}>;
    cleanDesign(design: BufferLayerDesign, schema: Schema): BufferLayerDesign;
    validateDesign(design: BufferLayerDesign, schema: Schema): string | null;
}
