import React from "react";
import Layer, { OnGridClickOptions, OnGridHoverOptions, VectorTileDef } from "./Layer";
import { Schema, DataSource } from "mwater-expressions";
import { LayerDefinition, OnGridClickResults, OnGridHoverResults } from "./maps";
import { JsonQLFilter } from "../index";
import ChoroplethLayerDesign from "./ChoroplethLayerDesign";
import { JsonQLQuery } from "jsonql";
import LayerLegendComponent from "./LayerLegendComponent";
export default class ChoroplethLayer extends Layer<ChoroplethLayerDesign> {
    /** Gets the type of layer definition */
    getLayerDefinitionType(): "VectorTile";
    getVectorTile(design: ChoroplethLayerDesign, sourceId: string, schema: Schema, filters: JsonQLFilter[], opacity: number): VectorTileDef;
    createPlainVectorTile(design: ChoroplethLayerDesign, sourceId: string, schema: Schema, filters: JsonQLFilter[], opacity: number): VectorTileDef;
    createIndirectVectorTile(design: ChoroplethLayerDesign, sourceId: string, schema: Schema, filters: JsonQLFilter[], opacity: number): VectorTileDef;
    createDirectVectorTile(design: ChoroplethLayerDesign, sourceId: string, schema: Schema, filters: JsonQLFilter[], opacity: number): VectorTileDef;
    /** Gets the layer definition as JsonQL + CSS in format:
     *   {
     *     layers: array of { id: layer id, jsonql: jsonql that includes "the_webmercator_geom" as a column }
     *     css: carto css
     *     interactivity: (optional) { layer: id of layer, fields: array of field names }
     *   }
     * arguments:
     *   design: design of layer
     *   schema: schema to use
     *   filters: array of filters to apply
     */
    getJsonQLCss(design: ChoroplethLayerDesign, schema: Schema, filters: JsonQLFilter[]): LayerDefinition;
    createMapnikJsonQL(design: ChoroplethLayerDesign, schema: Schema, filters: JsonQLFilter[]): JsonQLQuery;
    createCss(design: ChoroplethLayerDesign, schema: Schema, filters: JsonQLFilter[]): string;
    /**
     * Called when the interactivity grid is clicked.
     * arguments:
     *   ev: { data: interactivty data e.g. `{ id: 123 }` }
     *   clickOptions:
     *     design: design of layer
     *     schema: schema to use
     *     dataSource: data source to use
     *     layerDataSource: layer data source
     *     scopeData: current scope data if layer is scoping
     *     filters: compiled filters to apply to the popup
     *
     * Returns:
     *   null/undefined
     *   or
     *   {
     *     scope: scope to apply ({ name, filter, data })
     *     row: { tableId:, primaryKey: }  # row that was selected
     *     popup: React element to put into a popup
     */
    onGridClick(ev: {
        data: any;
        event: any;
    }, clickOptions: OnGridClickOptions<ChoroplethLayerDesign>): OnGridClickResults;
    onGridHoverOver(ev: {
        data: any;
        event: any;
    }, hoverOptions: OnGridHoverOptions<ChoroplethLayerDesign>): OnGridHoverResults;
    getBounds(design: ChoroplethLayerDesign, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[], callback: any): void;
    getMinZoom(design: ChoroplethLayerDesign): number | undefined;
    getMaxZoom(design: ChoroplethLayerDesign): number;
    getLegend(design: ChoroplethLayerDesign, schema: Schema, name: string, dataSource: DataSource, locale: string, filters: JsonQLFilter[]): React.CElement<import("./LayerLegendComponent").LayerLegendComponentProps, LayerLegendComponent>;
    getFilterableTables(design: ChoroplethLayerDesign, schema: Schema): string[];
    /** True if layer can be edited */
    isEditable(): boolean;
    cleanDesign(design: ChoroplethLayerDesign, schema: Schema): ChoroplethLayerDesign;
    validateDesign(design: ChoroplethLayerDesign, schema: Schema): string | null;
    createDesignerElement(options: {
        design: ChoroplethLayerDesign;
        schema: Schema;
        dataSource: DataSource;
        onDesignChange: (design: ChoroplethLayerDesign) => void;
        filters: JsonQLFilter[];
    }): React.ReactElement<{}>;
}
