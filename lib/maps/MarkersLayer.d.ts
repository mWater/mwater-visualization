import React from "react";
import Layer, { OnGridClickOptions, VectorTileDef } from "./Layer";
import { Schema, DataSource } from "mwater-expressions";
import { OnGridClickResults } from "./maps";
import { JsonQLFilter } from "../index";
import { JsonQLQuery, JsonQLSelectQuery } from "jsonql";
import { MarkersLayerDesign } from "./MarkersLayerDesign";
export default class MarkersLayer extends Layer<MarkersLayerDesign> {
    /** Gets the type of layer definition */
    getLayerDefinitionType(): "VectorTile";
    getVectorTile(design: MarkersLayerDesign, sourceId: string, schema: Schema, filters: JsonQLFilter[], opacity: number): VectorTileDef;
    createJsonQL(design: MarkersLayerDesign, schema: Schema, filters: JsonQLFilter[]): JsonQLSelectQuery;
    getJsonQLCss(design: MarkersLayerDesign, schema: Schema, filters: JsonQLFilter[]): {
        layers: {
            id: string;
            jsonql: JsonQLQuery;
        }[];
        css: string;
        interactivity: {
            layer: string;
            fields: string[];
        };
    };
    createMapnikJsonQL(design: MarkersLayerDesign, schema: Schema, filters: JsonQLFilter[]): JsonQLQuery;
    createCss(design: MarkersLayerDesign): string;
    onGridClick(ev: {
        data: any;
        event: any;
    }, clickOptions: OnGridClickOptions<MarkersLayerDesign>): OnGridClickResults;
    getBounds(design: MarkersLayerDesign, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[], callback: any): void;
    getMinZoom(design: MarkersLayerDesign): number | undefined;
    getMaxZoom(design: MarkersLayerDesign): number;
    getLegend(design: MarkersLayerDesign, schema: Schema, name: string, dataSource: DataSource, locale: string, filters: JsonQLFilter[]): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    getFilterableTables(design: MarkersLayerDesign, schema: Schema): string[];
    isEditable(): boolean;
    createDesignerElement(options: {
        design: MarkersLayerDesign;
        schema: Schema;
        dataSource: DataSource;
        onDesignChange: (design: MarkersLayerDesign) => void;
        filters: JsonQLFilter[];
    }): React.ReactElement<{}>;
    cleanDesign(design: MarkersLayerDesign, schema: Schema): MarkersLayerDesign;
    validateDesign(design: MarkersLayerDesign, schema: Schema): string | null;
    createKMLExportJsonQL(design: MarkersLayerDesign, schema: Schema, filters: JsonQLFilter[]): JsonQLSelectQuery;
    createKMLExportStyleInfo(design: MarkersLayerDesign, schema: Schema, filters: JsonQLFilter[]): any;
    getKMLExportJsonQL(design: MarkersLayerDesign, schema: Schema, filters: JsonQLFilter[]): {
        layers: {
            id: string;
            jsonql: JsonQLSelectQuery;
            style: any;
        }[];
    };
    acceptKmlVisitorForRow(visitor: any, row: any): any;
}
