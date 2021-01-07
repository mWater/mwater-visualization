import React from 'react';
import Layer, { OnGridClickOptions, VectorTileDef } from './Layer';
import { Schema, DataSource } from 'mwater-expressions';
import { OnGridClickResults } from './maps';
import { JsonQLFilter } from '../index';
import { JsonQLQuery } from 'jsonql';
import { MarkersLayerDesign } from './MarkersLayerDesign';
export default class MarkersLayer extends Layer<MarkersLayerDesign> {
    /** Gets the type of layer definition */
    getLayerDefinitionType(): "VectorTile";
    getVectorTile(design: MarkersLayerDesign, sourceId: string, schema: Schema, filters: JsonQLFilter[], opacity: number): VectorTileDef;
    createJsonQL(design: MarkersLayerDesign, schema: Schema, filters: JsonQLFilter[]): JsonQLQuery;
    getJsonQLCss(design: MarkersLayerDesign, schema: Schema, filters: JsonQLFilter[]): {
        layers: {
            id: string;
            jsonql: {
                type: string;
                selects: ({
                    type: string;
                    expr: {
                        type: string;
                        op: string;
                        exprs: {
                            type: string;
                            tableAlias: string;
                            column: string;
                        }[];
                        tableAlias?: undefined;
                        column?: undefined;
                    };
                    alias: string;
                } | {
                    type: string;
                    expr: {
                        type: string;
                        tableAlias: string;
                        column: string;
                        op?: undefined;
                        exprs?: undefined;
                    };
                    alias: string;
                })[];
                from: {
                    type: string;
                    query: JsonQLQuery;
                    alias: string;
                };
                where: {
                    type: string;
                    op: string;
                    exprs: (number | {
                        type: string;
                        tableAlias: string;
                        column: string;
                    })[];
                };
            };
        }[];
        css: string;
        interactivity: {
            layer: string;
            fields: string[];
        };
    };
    createMapnikJsonQL(design: MarkersLayerDesign, schema: Schema, filters: JsonQLFilter[]): {
        type: string;
        selects: ({
            type: string;
            expr: {
                type: string;
                op: string;
                exprs: {
                    type: string;
                    tableAlias: string;
                    column: string;
                }[];
                tableAlias?: undefined;
                column?: undefined;
            };
            alias: string;
        } | {
            type: string;
            expr: {
                type: string;
                tableAlias: string;
                column: string;
                op?: undefined;
                exprs?: undefined;
            };
            alias: string;
        })[];
        from: {
            type: string;
            query: JsonQLQuery;
            alias: string;
        };
        where: {
            type: string;
            op: string;
            exprs: (number | {
                type: string;
                tableAlias: string;
                column: string;
            })[];
        };
    };
    createCss(design: MarkersLayerDesign): string;
    onGridClick(ev: {
        data: any;
        event: any;
    }, clickOptions: OnGridClickOptions<MarkersLayerDesign>): OnGridClickResults;
    getBounds(design: MarkersLayerDesign, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[], callback: any): void;
    getMinZoom(design: MarkersLayerDesign): number | undefined;
    getMaxZoom(design: MarkersLayerDesign): number;
    getLegend(design: MarkersLayerDesign, schema: Schema, name: string, dataSource: DataSource, locale: string, filters: JsonQLFilter[]): React.CElement<{
        schema: Schema;
        defaultColor: string | undefined;
        symbol: string;
        markerSize: number | undefined;
        name: string;
        dataSource: DataSource;
        filters: JsonQLFilter[];
        axis: import("../axes/Axis").Axis;
        locale: string;
    }, React.Component<{
        schema: Schema;
        defaultColor: string | undefined;
        symbol: string;
        markerSize: number | undefined;
        name: string;
        dataSource: DataSource;
        filters: JsonQLFilter[];
        axis: import("../axes/Axis").Axis;
        locale: string;
    }, any, any>>;
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
    createKMLExportJsonQL(design: MarkersLayerDesign, schema: Schema, filters: JsonQLFilter[]): JsonQLQuery;
    createKMLExportStyleInfo(design: MarkersLayerDesign, schema: Schema, filters: JsonQLFilter[]): any;
    getKMLExportJsonQL(design: MarkersLayerDesign, schema: Schema, filters: JsonQLFilter[]): {
        layers: {
            id: string;
            jsonql: JsonQLQuery;
            style: any;
        }[];
    };
    acceptKmlVisitorForRow(visitor: any, row: any): any;
}
