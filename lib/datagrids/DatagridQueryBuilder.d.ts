import { JsonQLExpr, JsonQLQuery, JsonQLSelect } from "jsonql";
import { Schema } from "mwater-expressions";
import { DatagridDesign, DatagridDesignColumn, DatagridDesignSubtable } from "./DatagridDesign";
export default class DatagridQueryBuilder {
    schema: Schema;
    constructor(schema: Schema);
    createQuery(design: any, options?: {}): JsonQLQuery;
    createSimpleQuery(design: any, options: any): JsonQLQuery;
    createComplexQuery(design: any, options: any): JsonQLQuery;
    createComplexMainQuery(design: DatagridDesign, options: any): JsonQLQuery;
    createComplexSubtableQuery(design: DatagridDesign, options: any, subtable: any, subtableIndex: any): JsonQLQuery;
    getMainOrderByExprs(design: any, isAggr?: boolean): JsonQLExpr[];
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
