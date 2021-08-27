import React from "react";
import Layer, { VectorTileDef } from "./Layer";
import { Schema, DataSource } from "mwater-expressions";
import { LayerDefinition } from "./maps";
import { JsonQLFilter } from "../index";
import GridLayerDesign from "./GridLayerDesign";
import { JsonQLQuery } from "jsonql";
/** Layer which is a grid of squares or flat-topped hexagons. Depends on "Grid Functions.sql" having been run */
export default class GridLayer extends Layer<GridLayerDesign> {
    /** Gets the type of layer definition */
    getLayerDefinitionType(): "VectorTile";
    getVectorTile(design: GridLayerDesign, sourceId: string, schema: Schema, filters: JsonQLFilter[], opacity: number): VectorTileDef;
    createJsonQL(design: GridLayerDesign, schema: Schema, filters: JsonQLFilter[]): JsonQLQuery;
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
    getJsonQLCss(design: GridLayerDesign, schema: Schema, filters: JsonQLFilter[]): LayerDefinition;
    createMapnikJsonQL(design: GridLayerDesign, schema: Schema, filters: JsonQLFilter[]): JsonQLQuery;
    createCss(design: GridLayerDesign, schema: Schema, filters: JsonQLFilter[]): string;
    getMinZoom(design: GridLayerDesign): number | undefined;
    getMaxZoom(design: GridLayerDesign): number;
    /** Get the legend to be optionally displayed on the map. Returns
     * a React element */
    getLegend(design: GridLayerDesign, schema: Schema, name: string, dataSource: DataSource, locale: string, filters: JsonQLFilter[]): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    getFilterableTables(design: GridLayerDesign, schema: Schema): string[];
    /** True if layer can be edited */
    isEditable(): boolean;
    /** Returns a cleaned design */
    cleanDesign(design: GridLayerDesign, schema: Schema): GridLayerDesign;
    /** Validates design. Null if ok, message otherwise */
    validateDesign(design: GridLayerDesign, schema: Schema): string | null;
    createDesignerElement(options: {
        design: GridLayerDesign;
        schema: Schema;
        dataSource: DataSource;
        onDesignChange: (design: GridLayerDesign) => void;
        filters: JsonQLFilter[];
    }): React.ReactElement<{}>;
}
