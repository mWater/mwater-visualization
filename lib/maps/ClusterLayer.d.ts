import { JsonQLQuery } from "jsonql";
import { DataSource, Schema } from "mwater-expressions";
import React from "react";
import { JsonQLFilter } from "..";
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
            jsonql: {
                type: string;
                selects: ({
                    type: string;
                    expr: {
                        type: string;
                        op: string;
                        exprs: {
                            type: string;
                            op: string;
                            exprs: import("jsonql").JsonQL[];
                        }[];
                    };
                    alias: string;
                } | {
                    type: string;
                    expr: {
                        type: string;
                        op: string;
                        exprs: {
                            type: string;
                            tableAlias: string;
                            column: string;
                        }[];
                    };
                    alias: string;
                } | {
                    type: string;
                    expr: {
                        type: string;
                        op: string;
                        exprs: (number | {
                            type: string;
                            op: string;
                            exprs: (number | {
                                type: string;
                                op: string;
                                exprs: {
                                    type: string;
                                    op: string;
                                    exprs: {
                                        type: string;
                                        tableAlias: string;
                                        column: string;
                                    }[];
                                }[];
                            })[];
                        })[];
                    };
                    alias: string;
                })[];
                from: {
                    type: string;
                    query: {
                        type: string;
                        selects: ({
                            type: string;
                            expr: {
                                type: string;
                                op: string;
                                exprs: (number | {
                                    type: string;
                                    tableAlias: string;
                                    column: string;
                                    op?: undefined;
                                    exprs?: undefined;
                                } | {
                                    type: string;
                                    op: string;
                                    exprs: (number | {
                                        type: string;
                                        op: string;
                                        exprs: {
                                            type: string;
                                            op: string;
                                            exprs: (number | {
                                                type: string;
                                                token: string;
                                            })[];
                                        }[];
                                    })[];
                                    tableAlias?: undefined;
                                    column?: undefined;
                                })[];
                            };
                            over: {};
                            alias: string;
                        } | {
                            type: string;
                            expr: {
                                type: string;
                                tableAlias: string;
                                column: string;
                            };
                            alias: string;
                            over?: undefined;
                        })[];
                        from: {
                            type: string;
                            query: JsonQLQuery;
                            alias: string;
                        };
                    };
                    alias: string;
                };
                groupBy: {
                    type: string;
                    tableAlias: string;
                    column: string;
                }[];
            };
        }[];
        css: string;
    };
    createMapnikJsonQL(design: ClusterLayerDesign, schema: Schema, filters: JsonQLFilter[]): {
        type: string;
        selects: ({
            type: string;
            expr: {
                type: string;
                op: string;
                exprs: {
                    type: string;
                    op: string;
                    exprs: import("jsonql").JsonQL[];
                }[];
            };
            alias: string;
        } | {
            type: string;
            expr: {
                type: string;
                op: string;
                exprs: {
                    type: string;
                    tableAlias: string;
                    column: string;
                }[];
            };
            alias: string;
        } | {
            type: string;
            expr: {
                type: string;
                op: string;
                exprs: (number | {
                    type: string;
                    op: string;
                    exprs: (number | {
                        type: string;
                        op: string;
                        exprs: {
                            type: string;
                            op: string;
                            exprs: {
                                type: string;
                                tableAlias: string;
                                column: string;
                            }[];
                        }[];
                    })[];
                })[];
            };
            alias: string;
        })[];
        from: {
            type: string;
            query: {
                type: string;
                selects: ({
                    type: string;
                    expr: {
                        type: string;
                        op: string;
                        exprs: (number | {
                            type: string;
                            tableAlias: string;
                            column: string;
                            op?: undefined;
                            exprs?: undefined;
                        } | {
                            type: string;
                            op: string;
                            exprs: (number | {
                                type: string;
                                op: string;
                                exprs: {
                                    type: string;
                                    op: string;
                                    exprs: (number | {
                                        type: string;
                                        token: string;
                                    })[];
                                }[];
                            })[];
                            tableAlias?: undefined;
                            column?: undefined;
                        })[];
                    };
                    over: {};
                    alias: string;
                } | {
                    type: string;
                    expr: {
                        type: string;
                        tableAlias: string;
                        column: string;
                    };
                    alias: string;
                    over?: undefined;
                })[];
                from: {
                    type: string;
                    query: JsonQLQuery;
                    alias: string;
                };
            };
            alias: string;
        };
        groupBy: {
            type: string;
            tableAlias: string;
            column: string;
        }[];
    };
    createCss(design: ClusterLayerDesign, schema: Schema): string;
    getBounds(design: ClusterLayerDesign, schema: Schema, dataSource: DataSource, filters: JsonQLFilter[], callback: any): void;
    getMinZoom(design: ClusterLayerDesign): number | undefined;
    getMaxZoom(design: ClusterLayerDesign): number;
    getLegend(design: ClusterLayerDesign, schema: Schema, name: string, dataSource: DataSource, locale: string, filters?: JsonQLFilter[]): React.CElement<{
        schema: Schema;
        defaultColor: string;
        symbol: string;
        name: string;
        dataSource: DataSource;
        filters: JsonQLFilter[];
        locale: string;
    }, React.Component<{
        schema: Schema;
        defaultColor: string;
        symbol: string;
        name: string;
        dataSource: DataSource;
        filters: JsonQLFilter[];
        locale: string;
    }, any, any>>;
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
