import React from 'react';
import Layer from './Layer';
import { Schema, DataSource } from 'mwater-expressions';
import { LayerDefinition, OnGridClickResults } from './maps';
import { JsonQLFilter } from '../index';
import ChoroplethLayerDesign from './ChoroplethLayerDesign';
import { JsonQL, JsonQLQuery } from 'jsonql';
export default class ChoroplethLayer extends Layer<ChoroplethLayerDesign> {
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
    createJsonQL(design: ChoroplethLayerDesign, schema: Schema, filters: JsonQLFilter[]): JsonQL;
    createCss(design: any, schema: Schema, filters: JsonQLFilter[]): string;
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
    }, clickOptions: {
        /** design of layer */
        design: any;
        /** schema to use */
        schema: Schema;
        /** data source to use */
        dataSource: DataSource;
        /** layer data source */
        layerDataSource: any;
        /** current scope data if layer is scoping */
        scopeData: any;
        /** compiled filters to apply to the popup */
        filters: JsonQLFilter[];
    }): OnGridClickResults;
    getBounds(design: ChoroplethLayerDesign, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[], callback: any): any;
    getMinZoom(design: ChoroplethLayerDesign): number | undefined;
    getMaxZoom(design: ChoroplethLayerDesign): number;
    getLegend(design: ChoroplethLayerDesign, schema: Schema, name: string, dataSource: DataSource, locale: string, filters: JsonQLFilter[]): React.CElement<{
        schema: Schema;
        name: string;
        dataSource: DataSource;
        filters: JsonQLFilter[];
        axis: import("../axes/Axis").Axis;
        defaultColor: string | null | undefined;
        locale: string;
    }, React.Component<{
        schema: Schema;
        name: string;
        dataSource: DataSource;
        filters: JsonQLFilter[];
        axis: import("../axes/Axis").Axis;
        defaultColor: string | null | undefined;
        locale: string;
    }, any, any>>;
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
    createKMLExportJsonQL(design: ChoroplethLayerDesign, schema: Schema, filters: JsonQLFilter[]): JsonQLQuery;
    getKMLExportJsonQL(design: ChoroplethLayerDesign, schema: Schema, filters: JsonQLFilter[]): {
        layers: {
            id: string;
            jsonql: JsonQLQuery;
            style: {
                color?: string | null | undefined;
                opacity?: number | undefined;
                colorMap: any;
            };
        }[];
    };
    acceptKmlVisitorForRow(visitor: any, row: any): any;
}
