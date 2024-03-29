import { JsonQLExpr } from "jsonql";
import { Schema } from "mwater-expressions";
import { JsonQLFilter } from "../JsonQLFilter";
import { MapDesign } from "./MapDesign";
export interface MapScope {
    name: string;
    filter: JsonQLFilter;
    data: {
        layerViewId: string;
        data: any;
    };
}
export declare function canConvertToClusterMap(design: MapDesign): boolean;
export declare function canConvertToMarkersMap(design: MapDesign): boolean;
export declare function convertToClusterMap(design: MapDesign): MapDesign;
export declare function convertToMarkersMap(design: MapDesign): MapDesign;
export declare function getFilterableTables(design: MapDesign, schema: Schema): string[];
export declare function getCompiledFilters(design: MapDesign, schema: Schema, filterableTables: string[]): {
    table: string;
    jsonql: JsonQLExpr;
}[];
