import { Schema } from "mwater-expressions";
import { MapDesign } from "./MapDesign";
export declare function canConvertToClusterMap(design: MapDesign): boolean;
export declare function convertToClusterMap(design: MapDesign): {};
export declare function getFilterableTables(design: MapDesign, schema: Schema): string[];
export declare function getCompiledFilters(design: MapDesign, schema: Schema, filterableTables: string[]): {
    table: string;
    jsonql: import("jsonql").JsonQLExpr;
}[];
