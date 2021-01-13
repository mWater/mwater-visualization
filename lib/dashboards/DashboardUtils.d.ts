import { Schema } from "mwater-expressions";
import { DashboardDesign } from "./DashboardDesign";
/** Gets filterable tables for a dashboard */
export declare function getFilterableTables(design: DashboardDesign, schema: Schema): string[];
/** Get filters from props filters combined with dashboard filters */
export declare function getCompiledFilters(design: DashboardDesign, schema: Schema, filterableTables: string[]): {
    table: string;
    jsonql: import("jsonql").JsonQLExpr;
}[];
