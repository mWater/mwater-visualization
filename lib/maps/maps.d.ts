/// <reference types="react" />
import { JsonQL } from "jsonql";
export interface LayerDefinition {
    layers: Array<{
        /** Layer id */
        id: string;
        /** jsonql that includes "the_webmercator_geom" as a column */
        jsonql: JsonQL;
    }>;
    /** carto css */
    css: string;
    interactivity?: {
        /** id of layer */
        layer: string;
        /** array of field names */
        fields: string[];
    };
}
export declare type OnGridClickResults = {
    scope?: any;
    row?: {
        tableId: string;
        primaryKey: any;
    };
    popup?: React.ReactElement<{}>;
} | null;
