import { JsonQLExpr, JsonQLQuery, JsonQLSelect } from "jsonql";
import { Schema } from "mwater-expressions";
import { JsonQLFilter } from "../JsonQLFilter";
import { DatagridDesign, DatagridDesignColumn, DatagridDesignSubtable } from "./DatagridDesign";
export default class DatagridQueryBuilder {
    schema: Schema;
    constructor(schema: Schema);
    createQuery(design: DatagridDesign, options?: {
        /** start at row offset */
        offset?: number;
        /** limit rows */
        limit?: number;
        /** array of additional filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. } */
        extraFilters?: JsonQLFilter[];
        /** repeat main level values in subtable rows instead of leaving blank */
        fillSubtableRows?: boolean;
    }): JsonQLQuery;
    createSimpleQuery(design: any, options?: {
        /** start at row offset */
        offset?: number;
        /** limit rows */
        limit?: number;
        /** array of additional filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. } */
        extraFilters?: JsonQLFilter[];
        /** repeat main level values in subtable rows instead of leaving blank */
        fillSubtableRows?: boolean;
    }): JsonQLQuery;
    createComplexQuery(design: DatagridDesign, options?: {
        /** start at row offset */
        offset?: number;
        /** limit rows */
        limit?: number;
        /** array of additional filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. } */
        extraFilters?: JsonQLFilter[];
        /** repeat main level values in subtable rows instead of leaving blank */
        fillSubtableRows?: boolean;
    }): JsonQLQuery;
    createComplexMainQuery(design: DatagridDesign, options?: {
        /** start at row offset */
        offset?: number;
        /** limit rows */
        limit?: number;
        /** array of additional filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. } */
        extraFilters?: JsonQLFilter[];
        /** repeat main level values in subtable rows instead of leaving blank */
        fillSubtableRows?: boolean;
    }): JsonQLQuery;
    createComplexSubtableQuery(design: DatagridDesign, options: {
        /** start at row offset */
        offset?: number | undefined;
        /** limit rows */
        limit?: number | undefined;
        /** array of additional filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. } */
        extraFilters?: JsonQLFilter[] | undefined;
        /** repeat main level values in subtable rows instead of leaving blank */
        fillSubtableRows?: boolean | undefined;
    } | undefined, subtable: any, subtableIndex: any): JsonQLQuery;
    getMainOrderByExprs(design: DatagridDesign, isAggr?: boolean): JsonQLExpr[];
    getMainOrderByDirections(design: any, isAggr?: boolean): any[];
    getSubtableOrderByExprs(design: DatagridDesign, subtable: DatagridDesignSubtable): JsonQLExpr[];
    getSubtableOrderByDirections(design: any, subtable: any): any[];
    getSubtableOrderByExprTypes(design: any, subtable: any): (string | null)[];
    /** Create the select for a column in JsonQL format */
    createColumnSelect(column: DatagridDesignColumn, columnIndex: any, subtable?: any, fillSubtableRows?: any): JsonQLSelect;
    createSimpleSelects(design: DatagridDesign, isAggr: boolean): JsonQLSelect[];
    createNullExpr(exprType: any): JsonQLExpr;
    isMainAggr(design: any): boolean;
}
